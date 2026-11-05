package dev.zofolio.githubsync;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

	private static final Logger log = LoggerFactory.getLogger(GithubClient.class);

	static final String QUERY = """
			query($login: String!) { user(login: $login) {
			  repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) { pageInfo { hasNextPage } nodes {
			    name pushedAt
			    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }
			    defaultBranchRef { target { ... on Commit { history { totalCount } } } } } }
			  contributionsCollection { contributionCalendar { totalContributions
			    weeks { contributionDays { date contributionCount } } } } } }""";
	/** Une année civile ; GitHub limite {@code from}-{@code to} à un an. */
	static final String YEAR_QUERY = """
			query($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) {
			  contributionsCollection(from: $from, to: $to) { contributionCalendar { totalContributions } } } }""";
	private static final Duration TIMEOUT = Duration.ofSeconds(10);

	/** Réponse REST de la liste des exécutions d'un workflow. */
	record Runs(@JsonProperty("workflow_runs") List<Run> workflowRuns) {
		record Run(String conclusion, @JsonProperty("html_url") String htmlUrl) {}
	}

	record Repo(String name, Instant pushedAt, Integer commits, Map<String, Long> languages) {}

	record Calendar(LocalDate start, List<Integer> counts, int total) {}

	/** {@code truncated} : GitHub annonce d'autres pages que les 100 dépôts reçus. */
	record Snapshot(List<Repo> repos, Calendar calendar, boolean truncated) {}

	/** Réponse GraphQL brute. */
	record Response(Data data, List<Object> errors) {
		record Data(User user) {}

		record User(Repositories repositories, Contributions contributionsCollection) {}

		record Repositories(PageInfo pageInfo, List<Node> nodes) {}

		record PageInfo(Boolean hasNextPage) {}

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

		record YearCalendar(Integer totalContributions) {}
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
		return new Snapshot(repos, toCalendar(u.contributionsCollection().contributionCalendar()),
				u.repositories().pageInfo() == null || !Boolean.FALSE.equals(u.repositories().pageInfo().hasNextPage()));
	}

	/**
	 * Total de contributions par année, une requête GraphQL par année. Une année en erreur est absente du résultat
	 * (l'appelant garde alors sa valeur stockée).
	 */
	Map<Integer, Integer> contributionYears(int fromYear, int toYear) {
		Map<Integer, Integer> totals = new LinkedHashMap<>();
		for (int y = fromYear; y <= toYear; y++) {
			try {
				var vars = Map.of("login", login, "from", y + "-01-01T00:00:00Z", "to", y + "-12-31T23:59:59Z");
				Response r = http.post().uri(url).header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON).body(Map.of("query", YEAR_QUERY, "variables", vars))
						.retrieve().body(Response.class);
				if (r != null && (r.errors() == null || r.errors().isEmpty()) && r.data() != null
						&& r.data().user() != null && r.data().user().contributionsCollection() != null
						&& r.data().user().contributionsCollection().contributionCalendar() != null) {
					Integer t = r.data().user().contributionsCollection().contributionCalendar().totalContributions();
					if (t != null && t >= 0) {
						totals.put(y, t);
						continue;
					}
				}
				log.warn("github-sync : année {} ignorée (réponse incomplète)", y);
			} catch (RuntimeException e) {
				// jamais e.getMessage() : on ne journalise que le type d'erreur
				log.warn("github-sync : année {} ignorée ({})", y, e.getClass().getSimpleName());
			}
		}
		return totals;
	}

	/**
	 * Dernière exécution terminée du workflow CI sur main (lecture publique, aucun droit de plus que le token existant).
	 *
	 * @return {@code null} si aucune exécution
	 */
	CiStatus latestCiRun() {
		Runs r = http.get()
				.uri(url.replaceFirst("/graphql$", "") + "/repos/" + login
						+ "/Zofolio/actions/workflows/ci.yml/runs?branch=main&status=completed&per_page=1")
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + token).retrieve().body(Runs.class);
		if (r == null || r.workflowRuns() == null || r.workflowRuns().isEmpty() || r.workflowRuns().get(0) == null) {
			return null;
		}
		var run = r.workflowRuns().get(0);
		String conclusion = "success".equals(run.conclusion()) || "failure".equals(run.conclusion()) ? run.conclusion()
				: null;
		String link = run.htmlUrl() != null && run.htmlUrl().startsWith("https://github.com/") ? run.htmlUrl() : null;
		return new CiStatus(conclusion, link);
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
