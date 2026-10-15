package dev.zofolio.content;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import dev.zofolio.TestcontainersConfiguration;

/** Données réelles (T32). Propriété distincte : contexte et base propres, ContentApiIT vide les tables. */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "it.seed=true")
class SeedContentIT {

	@LocalServerPort
	int port;

	@Test
	void homeHasSevenRacesAndNoHiddenProject() throws Exception {
		String body = HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/fr/home")).build(),
				HttpResponse.BodyHandlers.ofString()).body();
		assertThat(body.split("\"kind\":\"RACE\"", -1)).hasSize(8);
		assertThat(body).contains("\"durationS\":48953", "\"distanceKm\":79.4", "\"elevationGainM\":3160")
				.doesNotContain("file-name-changer", "root-me", "\"cobroux\"", "politique-confidentialite", "HIDDEN");
	}
}
