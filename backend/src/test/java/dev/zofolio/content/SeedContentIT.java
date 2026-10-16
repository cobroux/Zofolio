package dev.zofolio.content;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
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

	@Test
	void racesAreSortedByDateDescendingUndatedLast() throws Exception {
		var names = new java.util.ArrayList<String>();
		new ObjectMapper().readTree(get("/api/fr/races")).forEach(r -> names.add(r.get("date").asText("") + " " + r.get("name").asText()));
		assertThat(names).hasSize(7);
		assertThat(names.subList(0, 5).stream().map(n -> n.substring(0, 10))).containsExactly(
				"2026-09-13", "2026-04-12", "2025-10-11", "2025-09-14", "2025-05-11");
		assertThat(names.get(1)).endsWith("Marathon de Paris");
		assertThat(names.get(5)).startsWith(" Triathlon");
		assertThat(names.get(6)).startsWith(" Chtriman");
	}

	private String get(String path) throws Exception {
		return HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).build(),
				HttpResponse.BodyHandlers.ofString()).body();
	}

	@Test
	void caseStudiesAreCompleteWithoutPlaceholders() throws Exception {
		for (String slug : new String[] { "oltre", "zotracker", "gfaim", "trading-app" }) {
			JsonNode p = new ObjectMapper().readTree(get("/api/fr/projects/" + slug));
			JsonNode cs = p.get("caseStudy");
			assertThat(cs.isNull()).as(slug).isFalse();
			for (String f : new String[] { "role", "problem", "wall", "takeaway" }) {
				assertThat(cs.get(f).asText()).as(slug + "." + f).isNotBlank();
			}
			assertThat(cs.get("decisions").size()).as(slug).isBetween(2, 3);
			assertThat(p.toString()).as(slug).doesNotContain("À FOURNIR");
			if (slug.equals("trading-app")) {
				assertThat(cs.get("repos")).isEmpty();
				assertThat(p.get("repoUrl").isNull()).isTrue();
			} else {
				assertThat(cs.get("repos")).isNotEmpty();
			}
		}
	}

	@Test
	void englishIsServedFromTheSeed() throws Exception {
		JsonNode p = new ObjectMapper().readTree(get("/api/en/projects/oltre"));
		assertThat(p.get("metaTitle").asText()).isEqualTo("Oltre, a day-to-day planning app, Enzo Leveque");
		assertThat(p.get("pitch").asText()).startsWith("A personal app to organize");
		assertThat(p.get("caseStudy").get("problem").asText()).startsWith("My daily life was scattered");
		assertThat(p.get("caseStudy").get("decisions").get(0).get("title").asText()).isEqualTo("Garmin in a separate service");
		assertThat(p.get("video").get("caption").asText()).startsWith("A walk through Oltre");
		assertThat(get("/api/en/home")).contains("Hospital porter in the ER", "Software Engineer").doesNotContain("Brancardier");
	}
}
