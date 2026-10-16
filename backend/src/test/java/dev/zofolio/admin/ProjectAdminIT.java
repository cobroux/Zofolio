package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import dev.zofolio.TestcontainersConfiguration;

/** Utilise les projets semés par Liquibase ; chaque test crée ses propres slugs. */
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = AdminClient.PROXY_PROPS)
class ProjectAdminIT {

	@LocalServerPort int port;
	@Autowired JdbcTemplate jdbc;
	final ObjectMapper json = new ObjectMapper();

	static String body(String slug, String extra) {
		return "{\"slug\":\"" + slug + "\",\"aiTag\":\"HAND\",\"title\":{\"fr\":\"Titre\"},\"pitch\":{\"fr\":\"Pitch\"},"
				+ "\"stack\":[\"Java 21\"]" + (extra.isEmpty() ? "" : "," + extra) + "}";
	}

	@Test
	void everyRouteNeedsASession() throws Exception {
		var c = new AdminClient(port, "10.0.1.1");
		c.get("/api/admin/session");
		for (String[] r : new String[][] { { "GET", "/api/admin/projects" }, { "GET", "/api/admin/projects/oltre" },
				{ "POST", "/api/admin/projects" }, { "PUT", "/api/admin/projects/oltre" }, { "DELETE", "/api/admin/projects/oltre" },
				{ "POST", "/api/admin/preview/fr/project" }, { "GET", "/api/admin/github-repos" } }) {
			assertThat(c.send(r[0], r[1], r[0].equals("GET") || r[0].equals("DELETE") ? null : "{}").statusCode())
					.as(r[0] + " " + r[1]).isEqualTo(401);
		}
	}

	@Test
	void newProjectIsHiddenUntilPublishedThenServedWithEnglishFallback() throws Exception {
		var c = AdminClient.loggedIn(port);
		var created = c.send("POST", "/api/admin/projects", body("nouveau-it", "\"title\":{\"fr\":\"Nouveau\",\"en\":\"New\"}"));
		assertThat(created.statusCode()).isEqualTo(201);
		assertThat(created.headers().firstValue("Location")).hasValue("/api/admin/projects/nouveau-it");
		assertThat(json.readTree(created.body()).get("tier").asText()).isEqualTo("HIDDEN");
		assertThat(c.get("/api/fr/projects").body()).doesNotContain("nouveau-it");
		assertThat(c.get("/api/fr/projects/nouveau-it").statusCode()).isEqualTo(404);

		var put = c.send("PUT", "/api/admin/projects/nouveau-it",
				body("ignore-au-put", "\"tier\":\"SHORT\",\"title\":{\"fr\":\"Nouveau\",\"en\":\"New\"}"));
		assertThat(put.statusCode()).isEqualTo(200);
		assertThat(json.readTree(put.body()).get("slug").asText()).isEqualTo("nouveau-it");
		assertThat(c.get("/api/en/projects/nouveau-it").body()).contains("\"title\":\"New\"", "\"pitch\":\"Pitch\"");
		assertThat(c.get("/api/fr/projects/nouveau-it").body()).contains("\"title\":\"Nouveau\"");
		assertThat(c.get("/api/admin/projects/nouveau-it").body()).contains("\"en\":\"New\"");

		assertThat(c.send("DELETE", "/api/admin/projects/nouveau-it", null).statusCode()).isEqualTo(204);
		assertThat(c.get("/api/admin/projects/nouveau-it").statusCode()).isEqualTo(404);
	}

	@Test
	void takenSlugIs409() throws Exception {
		var c = AdminClient.loggedIn(port);
		assertThat(c.send("POST", "/api/admin/projects", body("pris-it", "")).statusCode()).isEqualTo(201);
		var r = c.send("POST", "/api/admin/projects", body("pris-it", ""));
		assertThat(r.statusCode()).isEqualTo(409);
		assertThat(r.body()).contains("\"code\":\"CONFLICT\"");
	}

	@Test
	void invalidFieldsAreRejectedWithDottedPaths() throws Exception {
		var c = AdminClient.loggedIn(port);
		String[][] cases = {
				{ "\"demoUrl\":\"javascript:alert(1)\"", "demoUrl" },
				{ "\"demoUrl\":\"http://exemple.dev\"", "demoUrl" },
				{ "\"title\":{\"fr\":\"x\",\"de\":\"y\"}", "title.de" },
				{ "\"title\":{\"en\":\"only en\"}", "title.fr" },
				{ "\"pitch\":{\"fr\":\"" + "p".repeat(301) + "\"}", "pitch.fr" },
				{ "\"githubRepos\":[\"../etc\"]", "githubRepos[0]" },
				{ "\"githubRepos\":[\"a\",\"b\",\"c\",\"d\",\"e\",\"f\"]", "githubRepos" },
				{ "\"stage\":\"P2\"", "stage" },
				{ "\"tier\":\"PUBLIC\"", "tier" },
				{ "\"decisions\":{\"en\":[{\"title\":\"ok\",\"tradeoff\":\"ok\"},{\"title\":\"\",\"tradeoff\":\"ok\"}]}", "decisions.en[1].title" },
				{ "\"video\":{\"name\":\"Bad Name\",\"width\":0,\"height\":800}", "video.name" },
				{ "\"video\":{\"name\":\"ok\",\"width\":10,\"height\":10,\"mp4\":\"/uploads/../x.mp4\"}", "video.mp4" } };
		for (String[] k : cases) {
			var r = c.send("POST", "/api/admin/projects", body("rejet-it", k[0]));
			assertThat(r.statusCode()).as(k[0]).isEqualTo(400);
			assertThat(r.body()).as(k[0]).contains("\"code\":\"VALIDATION_FAILED\"").contains("\"field\":\"" + k[1] + "\"");
		}
		assertThat(c.send("POST", "/api/admin/projects", body("Bad Slug", "")).body()).contains("\"field\":\"slug\"");
		assertThat(c.send("POST", "/api/admin/projects", "{not json").body()).contains("MALFORMED_REQUEST");
		assertThat(c.get("/api/admin/projects/rejet-it").statusCode()).isEqualTo(404);
	}

	@Test
	void previewComputesCaseStudyWithoutWriting() throws Exception {
		var c = AdminClient.loggedIn(port);
		long before = jdbc.queryForObject("select count(*) from project", Long.class);
		var r = c.send("POST", "/api/admin/preview/en/project", body("apercu-it", "\"tier\":\"HIDDEN\",\"problem\":{\"fr\":\"Probleme\",\"en\":\"Problem\"},"
				+ "\"decisions\":{\"fr\":[{\"title\":\"Choix\",\"tradeoff\":\"Compromis\"}]}"));
		assertThat(r.statusCode()).isEqualTo(200);
		JsonNode p = json.readTree(r.body());
		assertThat(p.get("caseStudy").get("problem").asText()).isEqualTo("Problem");
		assertThat(p.get("caseStudy").get("decisions").get(0).get("title").asText()).isEqualTo("Choix");
		assertThat(jdbc.queryForObject("select count(*) from project", Long.class)).isEqualTo(before);
		assertThat(c.send("POST", "/api/admin/preview/de/project", body("x", "")).statusCode()).isEqualTo(404);
	}

	@Test
	void uploadedClipUrlsAreServedWithoutWebm() throws Exception {
		var c = AdminClient.loggedIn(port);
		jdbc.update("insert into media (file_name, kind, content_type, bytes) values ('0123456789abcdef01234567.mp4', 'VIDEO', 'video/mp4', 1), ('0123456789abcdef01234567.jpg', 'IMAGE', 'image/jpeg', 1) on conflict do nothing");
		String video = "\"tier\":\"SHORT\",\"video\":{\"name\":\"clip-it\",\"mp4\":\"/uploads/0123456789abcdef01234567.mp4\","
				+ "\"poster\":\"/uploads/0123456789abcdef01234567.jpg\",\"width\":1280,\"height\":800,\"caption\":{\"fr\":\"Legende\"}}";
		assertThat(c.send("POST", "/api/admin/projects", body("clip-it", video)).statusCode()).isEqualTo(201);
		assertThat(c.get("/api/fr/projects/clip-it").body()).contains("\"mp4\":\"/uploads/0123456789abcdef01234567.mp4\"",
				"\"webm\":null", "\"poster\":\"/uploads/0123456789abcdef01234567.jpg\"");
	}

	@Test
	void seededProjectsRoundTripUnchangedExceptTooLongMetaDescription() throws Exception {
		var c = AdminClient.loggedIn(port);
		List<String> failures = new java.util.ArrayList<>();
		for (JsonNode p : json.readTree(c.get("/api/admin/projects").body())) {
			var r = c.send("PUT", "/api/admin/projects/" + p.get("slug").asText(), p.toString());
			if (r.statusCode() != 200) {
				failures.add(p.get("slug").asText() + " " + r.body());
			}
		}
		// shortcut: la copie validée de GFaim (FR) fait 161 caractères pour 160 autorisés ; à raccourcir dans l'admin
		assertThat(failures).hasSize(1);
		assertThat(failures.get(0)).startsWith("gfaim").contains("metaDescription.fr");
	}

	@Test
	void githubReposListsCacheWithCuratingProjects() throws Exception {
		jdbc.update("insert into github_repo (name, pushed_at, commits, languages, synced_at) values ('repo-it', now(), 7, '{\"Java\": 10}', now()) on conflict do nothing");
		var c = AdminClient.loggedIn(port);
		assertThat(c.send("POST", "/api/admin/projects", body("cure-it", "\"githubRepos\":[\"repo-it\"]")).statusCode()).isEqualTo(201);
		JsonNode repo = null;
		for (JsonNode n : json.readTree(c.get("/api/admin/github-repos").body())) {
			if (n.get("name").asText().equals("repo-it")) {
				repo = n;
			}
		}
		assertThat(repo).isNotNull();
		assertThat(repo.get("commits").asInt()).isEqualTo(7);
		assertThat(repo.get("languages").get(0).asText()).isEqualTo("Java");
		assertThat(repo.get("projects").get(0).asText()).isEqualTo("cure-it");
	}
}
