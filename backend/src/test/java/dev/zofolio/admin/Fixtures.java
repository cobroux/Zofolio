package dev.zofolio.admin;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import javax.imageio.ImageIO;

/** Fichiers piégés fabriqués à la volée (aucun binaire personnel dans le dépôt). */
final class Fixtures {

	private Fixtures() {}

	static byte[] image(int w, int h, String format) throws Exception {
		BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
		for (int x = 0; x < w; x++) {
			for (int y = 0; y < h; y++) {
				img.setRGB(x, y, x < w / 2 ? 0xFF0000 : 0x0000FF); // gauche rouge, droite bleu : détecte les rotations
			}
		}
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		ImageIO.write(img, format, out);
		return out.toByteArray();
	}

	/** JPEG dont un segment APP1 EXIF porte l'orientation et une « position GPS » en texte clair. */
	static byte[] jpegWithExif(byte[] jpeg, int orientation) {
		byte[] gps = "GPS-LAT-48.8566-LON-2.3522\0".getBytes(StandardCharsets.US_ASCII);
		ByteArrayOutputStream tiff = new ByteArrayOutputStream();
		tiff.writeBytes(new byte[] { 'I', 'I', 0x2A, 0, 8, 0, 0, 0 });
		tiff.writeBytes(new byte[] { 2, 0 }); // 2 entrées
		// 0x010E ImageDescription, ASCII, n, offset 38
		tiff.writeBytes(new byte[] { 0x0E, 0x01, 2, 0, (byte) gps.length, 0, 0, 0, 38, 0, 0, 0 });
		// 0x0112 Orientation, SHORT, 1, valeur
		tiff.writeBytes(new byte[] { 0x12, 0x01, 3, 0, 1, 0, 0, 0, (byte) orientation, 0, 0, 0 });
		tiff.writeBytes(new byte[] { 0, 0, 0, 0 }); // pas d'IFD suivant
		tiff.writeBytes(gps);
		byte[] body = tiff.toByteArray();
		int len = 2 + 6 + body.length;
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		out.writeBytes(new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE1, (byte) (len >> 8), (byte) len });
		out.writeBytes("Exif\0\0".getBytes(StandardCharsets.US_ASCII));
		out.writeBytes(body);
		out.write(jpeg, 2, jpeg.length - 2); // le reste du JPEG sans son SOI
		return out.toByteArray();
	}

	static byte[] box(String type, byte[]... children) {
		int size = 8;
		for (byte[] c : children) {
			size += c.length;
		}
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		out.writeBytes(new byte[] { (byte) (size >> 24), (byte) (size >> 16), (byte) (size >> 8), (byte) size });
		out.writeBytes(type.getBytes(StandardCharsets.ISO_8859_1));
		for (byte[] c : children) {
			out.writeBytes(c);
		}
		return out.toByteArray();
	}

	/** MP4 minimal (ftyp, moov, mdat) ; {@code udta} facultatif dans moov. */
	static byte[] mp4(byte[] udta, int mdatPadding) {
		byte[] ftyp = box("ftyp", "isom".getBytes(), new byte[4], "isom".getBytes());
		byte[] moov = udta == null ? box("moov") : box("moov", udta);
		return concat(ftyp, moov, box("mdat", new byte[mdatPadding]));
	}

	static byte[] concat(byte[]... parts) {
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		for (byte[] p : parts) {
			out.writeBytes(p);
		}
		return out.toByteArray();
	}

	static boolean contains(byte[] hay, String needle) {
		return new String(hay, StandardCharsets.ISO_8859_1).contains(needle);
	}
}
