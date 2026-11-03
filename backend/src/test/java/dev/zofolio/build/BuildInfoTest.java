package dev.zofolio.build;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import dev.zofolio.githubsync.CiStatus;

class BuildInfoTest {

	@Test
	void commitIsTheFirstSevenCharacters() {
		var b = BuildInfo.of("abcdef1234", "2026-11-03T10:00:00Z", new CiStatus("success", "https://github.com/x"));
		assertThat(b.commit()).isEqualTo("abcdef1");
		assertThat(b.deployedAt()).isEqualTo("2026-11-03T10:00:00Z");
		assertThat(b.ci().conclusion()).isEqualTo("success");
	}

	@Test
	void blankOrAbsentValuesAreNull() {
		var b = BuildInfo.of("  ", "", null);
		assertThat(b.commit()).isNull();
		assertThat(b.deployedAt()).isNull();
		assertThat(b.ci().conclusion()).isNull();
		assertThat(b.ci().url()).isNull();
	}

	@Test
	void shortShaIsKeptAsIs() {
		assertThat(BuildInfo.of("abc", null, null).commit()).isEqualTo("abc");
	}
}
