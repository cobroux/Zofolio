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
				if (slug.equals("trading-app") && f.equals("takeaway")) {
					continue; // rubrique vide masquée (l'accueil porte ces faits)
				}
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
	void caseStudiesV4ContentIsSeeded() throws Exception {
		assertV4("oltre", "J'ai tout construit seul, de zéro : le backend Spring Boot, le frontend Angular, leur mise en place et le déploiement en conteneurs.", "I built all of it alone, from scratch: the Spring Boot back end, the Angular front end, their setup and the container deployment.", "L'application couvre le sport, avec mes activités Garmin, les dépenses, les tâches, les rendez-vous et les repas, plus un coach IA optionnel. Une configuration de production en HTTPS est en place, avec un seul point d'entrée exposé.", "The app covers sport, with my Garmin activities, expenses, tasks, appointments and meals, plus an optional AI coach. A production setup over HTTPS is in place, with a single exposed entry point.");
		assertV4("zotracker", "J'ai conçu et développé tout le système : le serveur Node qui reçoit les positions, les projette sur le tracé GPX et les diffuse en direct, la page publique, l'espace admin, les alertes et le mode simulation, puis le déploiement en conteneur derrière Caddy.", "I designed and built the whole system: the Node server that receives positions, projects them onto the GPX route and broadcasts them live, the public page, the admin area, the alerts and the simulation mode, then the container deployment behind Caddy.", "Les proches suivent ma position en direct sur une page publique, sans rien installer. Le serveur calcule l'allure et les heures de passage, et envoie des alertes. Le mode simulation permet de tout tester sans courir. Un fichier GPX piégé de 920 Ko, qui prenait 5,8 s à lire, se traite maintenant en 5 ms.", "Loved ones follow my position live on a public page, with nothing to install. The server computes pace and passing times, and sends alerts. The simulation mode lets me test everything without running. A booby-trapped 920 KB GPX file that took 5.8 s to parse now takes 5 ms.");
		assertV4("gfaim", "Nous étions quatre, et je me suis occupé du front et du back. Le projet comprend une application Android native et une API Quarkus avec PostgreSQL.", "We were a team of four, and I worked on both the front end and the back end. The project has a native Android app and a Quarkus API with PostgreSQL.", "Le projet de fin d'études a été livré : une API avec authentification par jeton, PostgreSQL et l'API Spoonacular, documentée en OpenAPI, et l'application Android native. Il n'est pas déployé.", "The final-year project was delivered: an API with token authentication, PostgreSQL and the Spoonacular API, documented with OpenAPI, and the native Android app. It is not deployed.");
		JsonNode ta = new ObjectMapper().readTree(get("/api/fr/projects/trading-app"));
		assertThat(ta.get("stage").asText()).isEqualTo("P2");
		assertThat(ta.get("caseStudy").path("contribution").textValue()).isNull();
		assertThat(ta.get("caseStudy").path("takeaway").textValue()).isNull();
		assertThat(new ObjectMapper().readTree(get("/api/en/projects/trading-app")).get("caseStudy").path("takeaway").textValue()).isNull();
	}

	private void assertV4(String slug, String contribFr, String contribEn, String takeFr, String takeEn) throws Exception {
		for (String lang : new String[] { "fr", "en" }) {
			JsonNode cs = new ObjectMapper().readTree(get("/api/" + lang + "/projects/" + slug)).get("caseStudy");
			assertThat(cs.path("contribution").textValue()).as(slug + lang).isEqualTo(lang.equals("fr") ? contribFr : contribEn);
			assertThat(cs.path("takeaway").textValue()).as(slug + lang).isEqualTo(lang.equals("fr") ? takeFr : takeEn);
			assertThat(cs.path("hindsight").textValue()).as(slug + lang + ".hindsight").isNull();
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
