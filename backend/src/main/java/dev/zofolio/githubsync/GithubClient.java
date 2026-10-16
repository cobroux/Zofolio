package dev.zofolio.githubsync;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Un seul appel GraphQL (D17). Le token ne sort jamais de l'en-tête {@code Authorization}. */
@Component
class GithubClient {

	static final String QUERY = """
			query($login: String!) { user(login: $login) {
			  repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) { nodes {
			    name pushedAt
			    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }
			    defaultBranchRef { target { ... on Commit { history { totalCount } } } } } }
			  contributionsCollection { contributionCalendar { totalContributions
			    weeks { contributionDays { date contributionCount } } } } } }""";
	private static final Duration TIMEOUT = Duration.ofSeconds(10);

	record Repo(String name, Instant pushedAt, Integer commits, Map<String, Long> languages) {}

	record Calendar(LocalDate start, List<Integer> counts, int total) {}

	record Snapshot(List<Repo> repos, Calendar calendar) {}

	/** Réponse GraphQL brute. */
	record Response(Data data, List<Object> errors) {
		record Data(User user) {}

		record User(Repositories repositories, Contributions contributionsCollection) {}

		record Repositories(List<Node> nodes) {}

		record Node(String name, Instant pushedAt, Languages languages, Branch defaultBranchRef) {}

		record Languages(List<Edge> edges) {}

		record Edge(Long size, Lang node) {}

		record Lang(String name) {}

		record Branch(Target target) {}

		record Target(History history) {}

		record History(Integer totalCount) {}

		record Contributions(ContributionCalendar contributionCalendar) {}

		record ContributionCalendar(Integer totalContributions, List<Week> weeks) {}

		record Week(List<Day> contributionDays) {}

		record Day(LocalDate date, Integer contributionCount) {}
	}

	private final RestClient http;
	private final String url;
	private final String token;
	private final String login;

	@Autowired
	GithubClient(@Value("${zofolio.github.url:https://api.github.com/graphql}") String url,
			@Value("${zofolio.github.token:}") String token, @Value("${zofolio.github.login:cobroux}") String login) {
		this(RestClient.builder().requestFactory(timeouts()), url, token, login);
	}

	/** Pour les tests : le builder peut être lié à un MockRestServiceServer. */
	GithubClient(RestClient.Builder builder, String url, String token, String login) {
		this.http = builder.build();
		this.url = url;
		this.token = token;
		this.login = login;
	}

	private static JdkClientHttpRequestFactory timeouts() {
		var f = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(TIMEOUT).build());
		f.setReadTimeout(TIMEOUT);
		return f;
	}

	boolean enabled() {
		return !token.isBlank();
	}

	/** @throws IllegalStateException réponse incomplète ou invalide (message sans donnée sensible) */
	Snapshot fetch() {
		Response r = http.post().uri(url).header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON).body(Map.of("query", QUERY, "variables", Map.of("login", login)))
				.retrieve().body(Response.class);
		if (r == null || (r.errors() != null && !r.errors().isEmpty()) || r.data() == null || r.data().user() == null) {
			throw new IllegalStateException("réponse GraphQL incomplète (errors ou user absent)");
		}
		var u = r.data().user();
		if (u.repositories() == null || u.repositories().nodes() == null || u.contributionsCollection() == null
				|| u.contributionsCollection().contributionCalendar() == null) {
			throw new IllegalStateException("réponse GraphQL incomplète");
		}
		List<Repo> repos = new ArrayList<>();
		for (var n : u.repositories().nodes()) {
			repos.add(toRepo(n));
		}
		return new Snapshot(repos, toCalendar(u.contributionsCollection().contributionCalendar()));
	}

	private static Repo toRepo(Response.Node n) {
		if (n == null || n.name() == null || n.name().isBlank() || n.name().length() > 100) {
			throw new IllegalStateException("nom de dépôt invalide");
		}
		Integer commits = n.defaultBranchRef() == null || n.defaultBranchRef().target() == null
				|| n.defaultBranchRef().target().history() == null ? null
						: n.defaultBranchRef().target().history().totalCount();
		if (commits != null && commits < 0) {
			throw new IllegalStateException("nombre de commits négatif");
		}
		Map<String, Long> langs = new LinkedHashMap<>();
		if (n.languages() != null && n.languages().edges() != null) {
			for (var e : n.languages().edges()) {
				if (e == null || e.node() == null || e.node().name() == null || e.size() == null || e.size() < 0) {
					throw new IllegalStateException("langage invalide");
				}
				langs.merge(e.node().name(), e.size(), Long::sum);
			}
		}
		return new Repo(n.name(), n.pushedAt(), commits, langs);
	}

	private static Calendar toCalendar(Response.ContributionCalendar c) {
		List<Integer> counts = new ArrayList<>();
		LocalDate start = null;
		if (c.weeks() == null || c.totalContributions() == null || c.totalContributions() < 0) {
			throw new IllegalStateException("calendrier invalide");
		}
		for (var w : c.weeks()) {
			for (var d : w.contributionDays()) {
				if (d == null || d.date() == null || d.contributionCount() == null || d.contributionCount() < 0) {
					throw new IllegalStateException("jour de calendrier invalide");
				}
				if (start == null) {
					start = d.date();
				}
				counts.add(d.contributionCount());
			}
		}
		if (start == null || counts.size() > 371) {
			throw new IllegalStateException("calendrier vide ou trop long");
		}
		return new Calendar(start, counts, c.totalContributions());
	}
}
