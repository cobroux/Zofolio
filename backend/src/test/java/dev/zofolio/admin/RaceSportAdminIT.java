package dev.zofolio.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import dev.zofolio.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = AdminClient.PROXY_PROPS)
class RaceSportAdminIT {

	@LocalServerPort int port;
	final ObjectMapper json = new ObjectMapper();

	static String race(String name, String extra) {
		return "{\"kind\":\"RACE\",\"name\":{\"fr\":\"" + name + "\",\"en\":\"" + name + " EN\"},\"date\":\"2025-06-01\"" + extra + "}";
	}

	@Test
	void routesNeedASession() throws Exception {
		var c = new AdminClient(port, "10.0.2.1");
		c.get("/api/admin/session");
		assertThat(c.get("/api/admin/races").statusCode()).isEqualTo(401);
		assertThat(c.send("POST", "/api/admin/races", race("x", "")).statusCode()).isEqualTo(401);
		assertThat(c.get("/api/admin/sport-years").statusCode()).isEqualTo(401);
		assertThat(c.send("PUT", "/api/admin/sport-years/2025", "{}").statusCode()).isEqualTo(401);
		assertThat(c.send("DELETE", "/api/admin/sport-years/2025", null).statusCode()).isEqualTo(401);
	}

	@Test
	void raceCrudIsVisibleInPublicRacesWithEnglishAndFrenchFallback() throws Exception {
		var c = AdminClient.loggedIn(port);
		var created = c.send("POST", "/api/admin/races", race("Course IT", ",\"distanceKm\":42.195,\"elevationGainM\":100,\"durationS\":12000,\"personalRecord\":true"));
		assertThat(created.statusCode()).isEqualTo(201);
		long id = json.readTree(created.body()).get("id").asLong();
		assertThat(c.get("/api/en/races").body()).contains("\"name\":\"Course IT EN\"", "\"distanceKm\":42.2");

		var upd = c.send("PUT", "/api/admin/races/" + id, "{\"kind\":\"CLUB\",\"name\":{\"fr\":\"Renommée IT\"},\"date\":\"2025-06-02\"}");
		assertThat(upd.statusCode()).isEqualTo(200);
		assertThat(c.get("/api/en/races").body()).contains("\"name\":\"Renommée IT\"").doesNotContain("Course IT EN");
		assertThat(json.readTree(c.get("/api/admin/races").body()).toString()).contains("Renommée IT");

		assertThat(c.send("DELETE", "/api/admin/races/" + id, null).statusCode()).isEqualTo(204);
		assertThat(c.send("DELETE", "/api/admin/races/" + id, null).statusCode()).isEqualTo(404);
		assertThat(c.get("/api/fr/races").body()).doesNotContain("Renommée IT");
	}

	@Test
	void invalidRacesAreRejected() throws Exception {
		var c = AdminClient.loggedIn(port);
		String future = LocalDate.now().plusYears(2).toString();
		String[][] cases = { { ",\"distanceKm\":1001", "distanceKm" }, { ",\"elevationGainM\":-1", "elevationGainM" },
				{ ",\"durationS\":604801", "durationS" }, { ",\"date\":\"" + future + "\"", "date" } };
		for (String[] k : cases) {
			String body = race("R", "").replace(",\"date\":\"2025-06-01\"", "") + "";
			body = body.substring(0, body.length() - 1) + (k[0].startsWith(",\"date") ? "" : ",\"date\":\"2025-06-01\"") + k[0] + "}";
			var r = c.send("POST", "/api/admin/races", body);
			assertThat(r.statusCode()).as(k[0]).isEqualTo(400);
			assertThat(r.body()).contains("\"field\":\"" + k[1] + "\"");
		}
		assertThat(c.send("POST", "/api/admin/races", "{\"kind\":\"BIKE\",\"name\":{\"fr\":\"x\"}}").body()).contains("\"field\":\"kind\"");
		assertThat(c.send("POST", "/api/admin/races", "{\"kind\":\"RACE\",\"name\":{\"fr\":\"x\",\"de\":\"y\"}}").body()).contains("name.de");
	}

	@Test
	void sportYearUpsertAppearsInHomeNewestFirst() throws Exception {
		var c = AdminClient.loggedIn(port);
		// 2021-2022 : les années 2023+ sont déjà semées (20261017-1000) ; on vérifie l'ordre décroissant et l'upsert.
		assertThat(c.send("PUT", "/api/admin/sport-years/2021", "{\"year\":2021,\"distanceKm\":1800,\"elevationGainM\":30000,\"hours\":200,\"activities\":150}").statusCode()).isEqualTo(200);
		assertThat(c.send("PUT", "/api/admin/sport-years/2022", "{\"year\":2022,\"distanceKm\":2140,\"elevationGainM\":null,\"hours\":260,\"activities\":210}").statusCode()).isEqualTo(200);
		assertThat(c.send("PUT", "/api/admin/sport-years/2022", "{\"year\":2022,\"distanceKm\":2200}").statusCode()).isEqualTo(200);

		JsonNode years = json.readTree(c.get("/api/fr/home").body()).get("sportYears");
		int n = years.size();
		assertThat(years.get(n - 1).get("year").asInt()).isEqualTo(2021);
		JsonNode y22 = years.get(n - 2);
		assertThat(y22.get("year").asInt()).isEqualTo(2022);
		assertThat(y22.get("distanceKm").asInt()).isEqualTo(2200);
		assertThat(y22.get("hours").isNull()).isTrue();
		assertThat(years.get(0).get("year").asInt()).isGreaterThan(2022);
		assertThat(c.get("/api/admin/sport-years").body()).contains("\"year\":2022");

		assertThat(c.send("DELETE", "/api/admin/sport-years/2022", null).statusCode()).isEqualTo(204);
		assertThat(c.send("DELETE", "/api/admin/sport-years/2021", null).statusCode()).isEqualTo(204);
		assertThat(c.send("DELETE", "/api/admin/sport-years/2021", null).statusCode()).isEqualTo(404);
	}

	@Test
	void invalidSportYearsAreRejected() throws Exception {
		var c = AdminClient.loggedIn(port);
		int future = LocalDate.now().getYear() + 1;
		for (String year : new String[] { String.valueOf(future), "1999" }) {
			assertThat(c.send("PUT", "/api/admin/sport-years/" + year, "{\"distanceKm\":1}").statusCode()).as(year).isEqualTo(400);
		}
		assertThat(c.send("PUT", "/api/admin/sport-years/2025", "{\"distanceKm\":-5}").body()).contains("distanceKm");
	}
}
