package dev.zofolio.admin;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublisher;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;

/** Client HTTP de test avec bocal de cookies manuel (le cookie {@code Secure} serait refusé en http par un CookieManager). */
public class AdminClient {
	public static final String PASSWORD = "test-password-admin";
	/** Les tests déclarent 127.0.0.1 comme proxy de confiance : cet en-tête simule l'IP vue par Caddy. */
	public static final String PROXY_PROPS = "server.tomcat.remoteip.internal-proxies=127\\.0\\.0\\.1|0:0:0:0:0:0:0:1|::1";

	private final HttpClient http = HttpClient.newHttpClient();
	private final String base;
	private final String ip;
	public final Map<String, String> cookies = new LinkedHashMap<>();

	public AdminClient(int port, String ip) {
		this.base = "http://127.0.0.1:" + port;
		this.ip = ip;
	}

	public HttpResponse<String> send(String method, String path, String json) throws Exception {
		return send(method, path, json == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(json),
				"application/json", true);
	}

	public HttpResponse<String> send(String method, String path, BodyPublisher body, String contentType, boolean csrf)
			throws Exception {
		var b = HttpRequest.newBuilder(URI.create(base + path)).method(method, body).header("Content-Type", contentType)
				.header("X-Forwarded-For", ip);
		if (!cookies.isEmpty()) {
			b.header("Cookie", String.join("; ", cookies.entrySet().stream().map(e -> e.getKey() + "=" + e.getValue()).toList()));
		}
		if (csrf && cookies.containsKey("XSRF-TOKEN")) {
			b.header("X-XSRF-TOKEN", cookies.get("XSRF-TOKEN"));
		}
		HttpResponse<String> r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
		for (String c : r.headers().allValues("Set-Cookie")) {
			String kv = c.split(";", 2)[0];
			String name = kv.substring(0, kv.indexOf('='));
			String value = kv.substring(kv.indexOf('=') + 1);
			if (c.contains("Max-Age=0") || value.isEmpty()) {
				cookies.remove(name);
			} else {
				cookies.put(name, value);
			}
		}
		return r;
	}

	/** Client déjà connecté (IP simulée propre à chaque appel : n'interfère pas avec le blocage). */
	public static AdminClient loggedIn(int port) throws Exception {
		var c = new AdminClient(port, "10.9." + (int) (Math.random() * 250) + "." + (int) (Math.random() * 250));
		if (c.login(PASSWORD).statusCode() != 204) {
			throw new IllegalStateException("connexion de test refusée");
		}
		return c;
	}

	public HttpResponse<String> get(String path) throws Exception {
		return send("GET", path, null);
	}

	/** GET /session (pose le cookie CSRF) puis login ; renvoie la réponse du login. */
	public HttpResponse<String> login(String password) throws Exception {
		get("/api/admin/session");
		return send("POST", "/api/admin/login", "{\"password\":\"" + password + "\"}");
	}
}
