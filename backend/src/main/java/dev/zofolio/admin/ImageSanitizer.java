package dev.zofolio.admin;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;

import dev.zofolio.shared.ApiException;

/**
 * D43 : l'image est décodée puis ré-encodée, ce qui supprime EXIF, GPS, XMP et profil ICC par construction.
 * Les dimensions sont lues avant le décodage (bombe de décompression) et l'orientation EXIF est appliquée aux pixels.
 */
final class ImageSanitizer {

	static final int MAX_SIDE = 4096;

	record Result(byte[] data, String ext, String contentType, int width, int height) {}

	private ImageSanitizer() {}

	static boolean isJpeg(byte[] d) {
		return d.length > 3 && (d[0] & 0xff) == 0xFF && (d[1] & 0xff) == 0xD8 && (d[2] & 0xff) == 0xFF;
	}

	static boolean isPng(byte[] d) {
		byte[] sig = { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A };
		if (d.length < sig.length) {
			return false;
		}
		for (int i = 0; i < sig.length; i++) {
			if (d[i] != sig[i]) {
				return false;
			}
		}
		return true;
	}

	/** @throws ApiException MEDIA_REJECTED (TYPE, DIMENSIONS ou DECODE) */
	static Result sanitize(byte[] in) {
		boolean jpeg = isJpeg(in);
		if (!jpeg && !isPng(in)) {
			throw ApiException.mediaRejected("TYPE");
		}
		BufferedImage img;
		try (ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(in))) {
			Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
			if (!readers.hasNext()) {
				throw ApiException.mediaRejected("DECODE");
			}
			ImageReader reader = readers.next();
			try {
				if (!reader.getFormatName().equalsIgnoreCase(jpeg ? "JPEG" : "png")) {
					throw ApiException.mediaRejected("TYPE");
				}
				reader.setInput(iis, true, true);
				if (reader.getWidth(0) > MAX_SIDE || reader.getHeight(0) > MAX_SIDE) {
					throw ApiException.mediaRejected("DIMENSIONS");
				}
				img = reader.read(0);
			} finally {
				reader.dispose();
			}
		} catch (IOException | RuntimeException e) {
			if (e instanceof ApiException a) {
				throw a;
			}
			throw ApiException.mediaRejected("DECODE");
		}
		if (jpeg) {
			img = orient(img, exifOrientation(in));
		}
		try {
			return jpeg ? encodeJpeg(img) : encodePng(img);
		} catch (IOException e) {
			throw ApiException.mediaRejected("DECODE");
		}
	}

	private static Result encodeJpeg(BufferedImage src) throws IOException {
		BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
		var g = rgb.createGraphics();
		g.setColor(java.awt.Color.WHITE); // l'alpha éventuel n'existe pas en JPEG
		g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
		g.drawImage(src, 0, 0, null);
		g.dispose();
		ImageWriter w = ImageIO.getImageWritersByFormatName("jpeg").next();
		ImageWriteParam p = w.getDefaultWriteParam();
		p.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
		p.setCompressionQuality(0.85f);
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		try (var ios = new MemoryCacheImageOutputStream(out)) {
			w.setOutput(ios);
			w.write(null, new IIOImage(rgb, null, null), p); // métadonnées null : aucune ne sort
		} finally {
			w.dispose();
		}
		return new Result(out.toByteArray(), "jpg", "image/jpeg", rgb.getWidth(), rgb.getHeight());
	}

	private static Result encodePng(BufferedImage img) throws IOException {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		if (!ImageIO.write(img, "png", out)) {
			throw new IOException("pas d'encodeur PNG");
		}
		return new Result(out.toByteArray(), "png", "image/png", img.getWidth(), img.getHeight());
	}

	/** Orientation EXIF (1 à 8) du premier segment APP1 ; 1 si absente ou illisible. */
	static int exifOrientation(byte[] d) {
		int p = 2;
		while (p + 4 < d.length && (d[p] & 0xff) == 0xFF) {
			int marker = d[p + 1] & 0xff;
			int len = ((d[p + 2] & 0xff) << 8) | (d[p + 3] & 0xff);
			if (marker == 0xDA || len < 2) {
				break; // début des données image
			}
			if (marker == 0xE1 && len >= 16 && p + 4 + 6 <= d.length && d[p + 4] == 'E' && d[p + 5] == 'x'
					&& d[p + 6] == 'i' && d[p + 7] == 'f') {
				return tiffOrientation(d, p + 10, Math.min(d.length, p + 2 + len));
			}
			p += 2 + len;
		}
		return 1;
	}

	private static int tiffOrientation(byte[] d, int t, int end) {
		if (t + 8 > end) {
			return 1;
		}
		boolean le = d[t] == 'I';
		long ifd = u32(d, t + 4, le);
		int pos = (int) (t + ifd);
		if (ifd < 8 || pos < 0 || pos + 2 > end) {
			return 1;
		}
		int n = u16(d, pos, le);
		for (int i = 0; i < n && pos + 2 + 12 * (i + 1) <= end; i++) {
			int e = pos + 2 + 12 * i;
			if (u16(d, e, le) == 0x0112) {
				int v = u16(d, e + 8, le);
				return v >= 1 && v <= 8 ? v : 1;
			}
		}
		return 1;
	}

	private static int u16(byte[] d, int p, boolean le) {
		return le ? (d[p] & 0xff) | ((d[p + 1] & 0xff) << 8) : ((d[p] & 0xff) << 8) | (d[p + 1] & 0xff);
	}

	private static long u32(byte[] d, int p, boolean le) {
		return le ? u16(d, p, true) | ((long) u16(d, p + 2, true) << 16) : ((long) u16(d, p, false) << 16) | u16(d, p + 2, false);
	}

	/** Applique l'orientation EXIF aux pixels (cases 2 à 8 du standard). */
	static BufferedImage orient(BufferedImage src, int o) {
		if (o == 1) {
			return src;
		}
		int w = src.getWidth(), h = src.getHeight();
		boolean swap = o >= 5;
		BufferedImage dst = new BufferedImage(swap ? h : w, swap ? w : h, BufferedImage.TYPE_INT_ARGB);
		int[] px = src.getRGB(0, 0, w, h, null, 0, w);
		int dw = dst.getWidth();
		int[] out = new int[px.length];
		for (int y = 0; y < h; y++) {
			for (int x = 0; x < w; x++) {
				int nx, ny;
				switch (o) {
					case 2 -> { nx = w - 1 - x; ny = y; }
					case 3 -> { nx = w - 1 - x; ny = h - 1 - y; }
					case 4 -> { nx = x; ny = h - 1 - y; }
					case 5 -> { nx = y; ny = x; }
					case 6 -> { nx = h - 1 - y; ny = x; }
					case 7 -> { nx = h - 1 - y; ny = w - 1 - x; }
					default -> { nx = y; ny = w - 1 - x; }
				}
				out[ny * dw + nx] = px[y * w + x];
			}
		}
		dst.setRGB(0, 0, dst.getWidth(), dst.getHeight(), out, 0, dw);
		return dst;
	}
}
