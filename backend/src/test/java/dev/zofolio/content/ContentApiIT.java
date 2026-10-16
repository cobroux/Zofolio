package dev.zofolio.content;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import dev.zofolio.TestcontainersConfiguration;
import dev.zofolio.githubsync.GithubContributions;
import dev.zofolio.githubsync.GithubContributionsRepository;
import dev.zofolio.githubsync.GithubRepo;
import dev.zofolio.githubsync.GithubRepoRepository;

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
	@Autowired
	GithubRepoRepository githubRepos;
	@Autowired
	GithubContributionsRepository githubContributions;

	@BeforeEach
	void seed() {
		races.deleteAll();
		projects.deleteAll();
		experiences.deleteAll();
		githubRepos.deleteAll();
		githubContributions.deleteAll();
		Race r2 = race("Course B", null, 2);
		Race r1 = race("Course A", Map.of("fr", "Note FR"), 1);
		r1.name = Map.of("fr", "Course A", "en", "Race A");
		r1.distanceKm = new BigDecimal("12.5");
		races.saveAll(List.of(r2, r1));
		projects.saveAll(List.of(project("visible", Project.Tier.CASE_STUDY, "P3", 2),
				project("masque", Project.Tier.HIDDEN, "P1", 1), project("sans-etape", Project.Tier.SHORT, null, 3)));
		Project etude = project("etude", Project.Tier.CASE_STUDY, "P3", 4);
		etude.githubRepos = List.of("repo-a", "repo-b");
		etude.metaTitle = Map.of("fr", "Meta FR", "en", "Meta EN");
		etude.metaDescription = Map.of("fr", "Desc FR");
		etude.role = Map.of("fr", "Role FR");
		etude.problem = Map.of("fr", "Probleme FR");
		etude.decisions = Map.of("fr", List.of(new ContentDto.Decision("Choix FR", "Compromis FR")));
		etude.video = new Project.VideoData("demo-1", null, null, 1280, 800, Map.of("fr", "Legende"));
		projects.save(etude);
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
	void caseStudyDetailFallsBackToFrenchDecisionsAndBuildsVideoAndRepos() throws Exception {
		String body = get("/api/en/projects/etude").body();
		assertThat(body).contains("\"role\":\"Role FR\"", "\"problem\":\"Probleme FR\"",
				"\"decisions\":[{\"title\":\"Choix FR\",\"tradeoff\":\"Compromis FR\"}]",
				"\"repoUrl\":\"https://github.com/cobroux/repo-a\"",
				"\"repos\":[{\"name\":\"repo-a\",\"url\":\"https://github.com/cobroux/repo-a\"},{\"name\":\"repo-b\"",
				"\"mp4\":\"media/demo-1.mp4\"", "\"webm\":\"media/demo-1.webm\"",
				"\"poster\":\"media/demo-1.webp\"", "\"caption\":\"Legende\"", "\"wall\":null");
	}

	@Test
	void metaIsResolvedByLanguageWithFrenchFallbackAndNullWhenAbsent() throws Exception {
		assertThat(get("/api/en/projects/etude").body()).contains("\"metaTitle\":\"Meta EN\"",
				"\"metaDescription\":\"Desc FR\"");
		assertThat(get("/api/fr/projects/etude").body()).contains("\"metaTitle\":\"Meta FR\"");
		assertThat(get("/api/fr/projects/sans-etape").body()).contains("\"metaTitle\":null", "\"metaDescription\":null");
	}

	@Test
	void shortSheetAndListsHaveNoCaseStudy() throws Exception {
		assertThat(get("/api/fr/projects/sans-etape").body()).contains("\"caseStudy\":null", "\"video\":null");
		assertThat(get("/api/fr/projects").body()).doesNotContain("Probleme FR").contains("\"caseStudy\":null");
	}

	@Test
	void githubCacheIsAggregatedForCuratedReposOnly() throws Exception {
		assertThat(get("/api/fr/projects/etude").body()).contains("\"commits\":null", "\"languages\":[]",
				"\"lastPushAt\":null");
		assertThat(get("/api/fr/home").body()).contains("\"contributions\":null");
		githubRepos.saveAll(List.of(cached("repo-a", 10, "2026-01-01T00:00:00Z", Map.of("Java", 500L, "HTML", 5L)),
				cached("repo-b", 5, "2026-03-01T00:00:00Z", Map.of("TypeScript", 300L, "Java", 100L)),
				cached("prive-non-cure", 999, "2030-01-01T00:00:00Z", Map.of("Rust", 99999L))));
		GithubContributions c = new GithubContributions();
		c.startDate = LocalDate.parse("2026-10-11");
		c.counts = List.of(0, 3);
		c.total = 3;
		c.syncedAt = Instant.parse("2026-10-15T12:00:30Z");
		githubContributions.save(c);

		String body = get("/api/fr/projects/etude").body();

		assertThat(body).contains("\"commits\":15", "\"languages\":[\"Java\",\"TypeScript\",\"HTML\"]",
				"\"lastPushAt\":\"2026-03-01T00:00:00Z\"").doesNotContain("prive-non-cure", "Rust", "999");
		assertThat(get("/api/fr/home").body()).contains("\"contributions\":{\"start\":\"2026-10-11\",\"counts\":[0,3]",
				"\"total\":3", "\"syncedAt\":\"2026-10-15T12:00:30Z\"").doesNotContain("prive-non-cure");
	}

	private static GithubRepo cached(String name, int commits, String pushedAt, Map<String, Long> languages) {
		GithubRepo r = new GithubRepo();
		r.name = name;
		r.commits = commits;
		r.pushedAt = Instant.parse(pushedAt);
		r.languages = languages;
		r.syncedAt = Instant.now();
		return r;
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
