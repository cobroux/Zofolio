package dev.zofolio.admin;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import dev.zofolio.admin.AdminDto.MediaAdmin;
import dev.zofolio.content.ProjectRepository;
import dev.zofolio.shared.ApiException;

/** D43-D44 : validation par octets magiques, ré-encodage des images, refus des MP4 avec métadonnées. */
@Service
class MediaService {

	private static final Logger log = LoggerFactory.getLogger(MediaService.class);
	static final int MAX_IMAGE_BYTES = 5 * 1024 * 1024;
	static final int MAX_MP4_BYTES = 2_621_440; // 2,5 Mo, ADR 0003
	static final Pattern FILE_NAME = Pattern.compile("^[0-9a-f]{24}\\.(jpg|png|mp4)$");

	/** Résultat d'un téléversement : {@code created} faux si le même contenu existait déjà. */
	record Upload(MediaAdmin media, boolean created) {}

	private final MediaRepository media;
	private final ProjectRepository projects;
	private final Path dir;

	MediaService(MediaRepository media, ProjectRepository projects,
			@Value("${MEDIA_DIR:${java.io.tmpdir}/zofolio-media}") String dir) {
		this.media = media;
		this.projects = projects;
		this.dir = Path.of(dir).toAbsolutePath().normalize();
	}

	Upload upload(MultipartFile file) {
		byte[] in;
		try {
			in = file.getBytes();
		} catch (IOException e) {
			throw ApiException.mediaRejected("DECODE");
		}
		// l'extension ne décide de rien, mais une extension qui contredit les octets magiques est un fichier déguisé
		String declared = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(java.util.Locale.ROOT);
		boolean mp4 = Mp4Check.looksLikeMp4(in);
		boolean declaredVideo = declared.endsWith(".mp4");
		if (!declaredVideo && !declared.endsWith(".jpg") && !declared.endsWith(".jpeg") && !declared.endsWith(".png")
				|| declaredVideo != mp4) {
			throw ApiException.mediaRejected("TYPE");
		}
		String kind, ext, contentType;
		byte[] data;
		Integer width = null, height = null;
		if (mp4) {
			if (in.length > MAX_MP4_BYTES) {
				throw ApiException.mediaRejected("SIZE");
			}
			Mp4Check.check(in);
			kind = "VIDEO";
			ext = "mp4";
			contentType = "video/mp4";
			data = in;
		} else {
			if (in.length > MAX_IMAGE_BYTES) {
				throw ApiException.mediaRejected("SIZE");
			}
			var r = ImageSanitizer.sanitize(in);
			kind = "IMAGE";
			ext = r.ext();
			contentType = r.contentType();
			data = r.data();
			width = r.width();
			height = r.height();
		}
		String name = sha256(data).substring(0, 24) + "." + ext;
		var existing = media.findByFileName(name);
		if (existing.isPresent()) {
			return new Upload(toDto(existing.get()), false);
		}
		write(name, data);
		Media m = new Media();
		m.fileName = name;
		m.kind = kind;
		m.contentType = contentType;
		m.bytes = data.length;
		m.width = width;
		m.height = height;
		try {
			m = media.saveAndFlush(m);
		} catch (RuntimeException e) {
			delete(name); // pas de fichier orphelin si la ligne n'a pas pu être écrite
			throw e;
		}
		log.info("admin : média {} action=CREATE", name);
		return new Upload(toDto(m), true);
	}

	List<MediaAdmin> list() {
		return media.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
	}

	void delete(long id) {
		Media m = media.findById(id).orElseThrow(ApiException::notFound);
		if (!projects.findSlugsUsingMedia("/uploads/" + m.fileName).isEmpty()) {
			throw ApiException.conflict();
		}
		media.delete(m);
		delete(m.fileName);
		log.info("admin : média {} action=DELETE", m.fileName);
	}

	boolean exists(String fileName) {
		return media.existsByFileName(fileName);
	}

	/** Écriture atomique : fichier temporaire dans le même dossier puis {@code move}. */
	private void write(String name, byte[] data) {
		try {
			Files.createDirectories(dir);
			Path tmp = Files.createTempFile(dir, "upload-", ".tmp");
			try {
				Files.write(tmp, data);
				Files.move(tmp, dir.resolve(name), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
			} finally {
				Files.deleteIfExists(tmp);
			}
		} catch (IOException e) {
			throw new IllegalStateException("écriture du média impossible", e);
		}
	}

	/** Nom contrôlé par regex puis chemin résolu sous {@code MEDIA_DIR} avant tout {@code delete}. */
	private void delete(String name) {
		Path p = dir.resolve(name).normalize();
		if (!FILE_NAME.matcher(name).matches() || !p.startsWith(dir) || p.equals(dir)) {
			throw new IllegalStateException("nom de média invalide");
		}
		try {
			Files.deleteIfExists(p);
		} catch (IOException e) {
			throw new IllegalStateException("suppression du média impossible", e);
		}
	}

	private MediaAdmin toDto(Media m) {
		String url = "/uploads/" + m.fileName;
		return new MediaAdmin(m.id, url, m.kind, m.contentType, m.bytes, m.width, m.height, m.createdAt,
				projects.findSlugsUsingMedia(url));
	}

	private static String sha256(byte[] d) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(d));
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}
}
