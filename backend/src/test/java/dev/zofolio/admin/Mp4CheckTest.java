package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

import dev.zofolio.shared.ApiException;

class Mp4CheckTest {

	static byte[] resource(String name) throws Exception {
		return Files.readAllBytes(Path.of("src/test/resources/media/" + name));
	}

	@Test
	void outputOfEncodeShIsAccepted() throws Exception {
		byte[] ok = resource("encode-sh.mp4");
		assertThat(Mp4Check.looksLikeMp4(ok)).isTrue();
		Mp4Check.check(ok);
	}

	@Test
	void phoneStyleLocationMetadataIsRejected() throws Exception {
		byte[] withXyz = Fixtures.mp4(Fixtures.box("udta", Fixtures.box("©xyz", "+48.85+002.35/".getBytes())), 10);
		assertThatThrownBy(() -> Mp4Check.check(withXyz)).isInstanceOf(ApiException.class).hasMessage("MEDIA_REJECTED");
		assertThatThrownBy(() -> Mp4Check.check(resource("phone.mp4"))).isInstanceOf(ApiException.class);
		assertThatThrownBy(() -> Mp4Check.check(Fixtures.mp4(Fixtures.box("uuid", new byte[16]), 10))).isInstanceOf(ApiException.class);
	}

	@Test
	void truncatedOrIncompleteBoxesAreRejected() throws Exception {
		byte[] ok = resource("encode-sh.mp4");
		assertThatThrownBy(() -> Mp4Check.check(java.util.Arrays.copyOf(ok, ok.length - 5))).isInstanceOf(ApiException.class);
		assertThatThrownBy(() -> Mp4Check.check(Fixtures.concat(Fixtures.box("ftyp", new byte[8])))).isInstanceOf(ApiException.class);
		assertThat(Mp4Check.looksLikeMp4("hello world!".getBytes())).isFalse();
	}
}
