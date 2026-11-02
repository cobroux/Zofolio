package dev.zofolio.cv;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import dev.zofolio.shared.ApiException;

@RestController
class CvController {
	static final int MAX_BYTES = 5 * 1024 * 1024;

	private final CvDownloadRepository repository;
	private final Resource pdf;
	private final Resource pdfEn;
	private final Path dir;

	CvController(CvDownloadRepository repository,
			@Value("${zofolio.cv.location:classpath:cv/Enzo-Leveque-CV-FR.pdf}") Resource pdf,
			@Value("${zofolio.cv.location-en:classpath:cv/Enzo-Leveque-CV-EN.pdf}") Resource pdfEn,
			@Value("${MEDIA_DIR:${java.io.tmpdir}/zofolio-media}") String mediaDir) {
		this.repository = repository;
		this.pdf = pdf;
		this.pdfEn = pdfEn;
		this.dir = Path.of(mediaDir).toAbsolutePath().normalize().resolve("cv");
	}

	@GetMapping("/api/{lang}/cv")
	ResponseEntity<Resource> cv(@PathVariable String lang) {
		if (!lang.equals("fr") && !lang.equals("en")) throw ApiException.notFound();
		// Le PDF téléversé depuis l'admin passe avant celui du classpath.
		Resource fr = uploaded("fr").exists() ? uploaded("fr") : pdf;
		Resource en = uploaded("en").exists() ? uploaded("en") : pdfEn;
		if (!fr.exists()) throw ApiException.notFound();
		repository.save(new CvDownload(lang));
		// EN absent : repli sur le CV FR (D9)
		boolean isEn = lang.equals("en") && en.exists();
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_PDF)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename(isEn ? "Enzo-Leveque-CV-EN.pdf" : "Enzo-Leveque-CV-FR.pdf").build().toString())
				.body(isEn ? en : fr);
	}

	/** Date du CV téléversé par langue, {@code null} : PDF embarqué. */
	@GetMapping("/api/admin/cv")
	Map<String, Instant> current() throws IOException {
		var m = new LinkedHashMap<String, Instant>();
		for (String l : new String[] { "fr", "en" }) {
			Path p = dir.resolve("cv-" + l + ".pdf");
			m.put(l, Files.exists(p) ? Files.getLastModifiedTime(p).toInstant() : null);
		}
		return m;
	}

	@PutMapping(path = "/api/admin/cv/{lang:fr|en}", consumes = "multipart/form-data")
	ResponseEntity<Void> upload(@PathVariable String lang, @RequestPart("file") MultipartFile file) throws IOException {
		if (file.getSize() > MAX_BYTES) throw ApiException.mediaRejected("SIZE");
		byte[] data = file.getBytes();
		if (data.length < 5 || !new String(data, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-")) throw ApiException.mediaRejected("TYPE");
		Files.createDirectories(dir);
		Path tmp = Files.createTempFile(dir, "upload-", ".tmp");
		try {
			Files.write(tmp, data);
			Files.move(tmp, dir.resolve("cv-" + lang + ".pdf"), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
		} finally {
			Files.deleteIfExists(tmp);
		}
		return ResponseEntity.noContent().build();
	}

	private Resource uploaded(String lang) {
		return new FileSystemResource(dir.resolve("cv-" + lang + ".pdf"));
	}
}
