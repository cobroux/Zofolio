package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;

import dev.zofolio.shared.ApiException;

class ImageSanitizerTest {

	@Test
	void exifAndGpsAreGoneAndOrientation6SwapsWidthAndHeight() throws Exception {
		byte[] trapped = Fixtures.jpegWithExif(Fixtures.image(100, 50, "jpg"), 6);
		assertThat(Fixtures.contains(trapped, "GPS-LAT")).isTrue();
		assertThat(ImageSanitizer.exifOrientation(trapped)).isEqualTo(6);

		var r = ImageSanitizer.sanitize(trapped);

		assertThat(r.width()).isEqualTo(50);
		assertThat(r.height()).isEqualTo(100);
		assertThat(Fixtures.contains(r.data(), "Exif")).isFalse();
		assertThat(Fixtures.contains(r.data(), "GPS-LAT")).isFalse();
		var img = ImageIO.read(new ByteArrayInputStream(r.data()));
		// 6 = rotation 90 horaire : le rouge (gauche) passe en haut
		assertThat(img.getRGB(25, 5) & 0xFF0000).isGreaterThan(0x800000);
		assertThat(img.getRGB(25, 95) & 0xFF).isGreaterThan(0x80);
	}

	@Test
	void everyOrientationKeepsAreaAndSwapsSidesFrom5() throws Exception {
		for (int o = 1; o <= 8; o++) {
			var r = ImageSanitizer.sanitize(Fixtures.jpegWithExif(Fixtures.image(60, 20, "jpg"), o));
			assertThat(o >= 5 ? r.height() : r.width()).as("orientation " + o).isEqualTo(60);
		}
	}

	@Test
	void pngIsReencodedAndDimensionsAreChecked() throws Exception {
		assertThat(ImageSanitizer.sanitize(Fixtures.image(10, 10, "png")).contentType()).isEqualTo("image/png");
		assertThatThrownBy(() -> ImageSanitizer.sanitize(Fixtures.image(5000, 1, "png"))).isInstanceOf(ApiException.class);
	}

	@Test
	void garbageAndTruncatedImagesAreRejected() throws Exception {
		assertThatThrownBy(() -> ImageSanitizer.sanitize("MZ\u0090 not an image".getBytes())).isInstanceOf(ApiException.class);
		byte[] png = Fixtures.image(50, 50, "png");
		byte[] cut = java.util.Arrays.copyOf(png, 40);
		assertThatThrownBy(() -> ImageSanitizer.sanitize(cut)).isInstanceOf(ApiException.class);
		assertThat(ImageSanitizer.exifOrientation(new byte[] { (byte) 0xFF, (byte) 0xD8 })).isEqualTo(1);
	}
}
