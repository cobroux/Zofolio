package dev.zofolio.content;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import dev.zofolio.TestcontainersConfiguration;

/** Données factices uniquement ; le vrai contenu arrive en T32. */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContentApiIT {

	@LocalServerPort
	int port;
	@Autowired
	RaceRepository races;
	@Autowired
	ProjectRepository projects;
	@Autowired
	ExperienceRepository experiences;

	@BeforeEach
	void seed() {
		races.deleteAll();
		projects.deleteAll();
		experiences.deleteAll();
		Race r2 = race("Course B", null, 2);
		Race r1 = race("Course A", Map.of("fr", "Note FR"), 1);
		r1.name = Map.of("fr", "Course A", "en", "Race A");
		r1.distanceKm = new BigDecimal("12.5");
		races.saveAll(List.of(r2, r1));
		projects.saveAll(List.of(project("visible", Project.Tier.CASE_STUDY, "P3", 2),
				project("masque", Project.Tier.HIDDEN, "P1", 1), project("sans-etape", Project.Tier.SHORT, null, 3)));
		Experience e = new Experience();
		e.stage = "P1";
		e.kind = Experience.Kind.EDUCATION;
		e.title = Map.of("fr", "Titre");
		e.body = Map.of("fr", "Corps");
		e.stack = List.of("Java");
		experiences.save(e);
	}

	@Test
	void racesFrenchWithNullFieldsPresent() throws Exception {
		HttpResponse<String> r = get("/api/fr/races");
		assertThat(r.statusCode()).isEqualTo(200);
		assertThat(r.body()).contains("\"name\":\"Course A\"", "\"distanceKm\":12.5", "\"durationS\":null");
		assertThat(r.body().indexOf("Course A")).isLessThan(r.body().indexOf("Course B"));
	}

	@Test
	void racesEnglishFallsBackToFrench() throws Exception {
		String body = get("/api/en/races").body();
		assertThat(body).contains("\"name\":\"Race A\"", "\"name\":\"Course B\"", "\"note\":\"Note FR\"");
	}

	@Test
	void unknownLangIsNotFound() throws Exception {
		HttpResponse<String> r = get("/api/de/races");
		assertThat(r.statusCode()).isEqualTo(404);
		assertThat(r.body()).contains("\"code\":\"NOT_FOUND\"");
	}

	@Test
	void projectsHideHidden() throws Exception {
		String body = get("/api/fr/projects").body();
		assertThat(body).contains("\"slug\":\"visible\"", "\"slug\":\"sans-etape\"").doesNotContain("masque");
	}

	@Test
	void projectDetailUnknownOrHiddenIsNotFound() throws Exception {
		assertThat(get("/api/fr/projects/visible").statusCode()).isEqualTo(200);
		for (String slug : List.of("inconnu", "masque")) {
			HttpResponse<String> r = get("/api/fr/projects/" + slug);
			assertThat(r.statusCode()).isEqualTo(404);
			assertThat(r.body()).contains("\"code\":\"NOT_FOUND\"");
		}
	}

	@Test
	void homeAggregates() throws Exception {
		String body = get("/api/fr/home").body();
		assertThat(body).contains("\"experiences\":[", "\"stage\":\"P1\",\"kind\":\"EDUCATION\"", "\"slug\":\"visible\"",
				"\"races\":[").doesNotContain("masque", "sans-etape");
	}

	private HttpResponse<String> get(String path) throws Exception {
		return HttpClient.newHttpClient().send(
				HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).build(),
				HttpResponse.BodyHandlers.ofString());
	}

	private static Race race(String name, Map<String, String> note, int order) {
		Race r = new Race();
		r.kind = Race.Kind.RACE;
		r.name = Map.of("fr", name);
		r.note = note;
		r.sortOrder = order;
		return r;
	}

	private static Project project(String slug, Project.Tier tier, String stage, int order) {
		Project p = new Project();
		p.slug = slug;
		p.tier = tier;
		p.stage = stage;
		p.title = Map.of("fr", slug);
		p.pitch = Map.of("fr", "Pitch");
		p.aiTag = Project.AiTag.HAND;
		p.stack = List.of("Java 21");
		p.sortOrder = order;
		return p;
	}
}
