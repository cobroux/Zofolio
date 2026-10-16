package dev.zofolio.githubsync;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientResponseException;

import dev.zofolio.githubsync.GithubClient.Repo;
import dev.zofolio.githubsync.GithubClient.Snapshot;

@Service
class GithubSyncService {

	private static final Logger log = LoggerFactory.getLogger(GithubSyncService.class);

	private final GithubClient client;
	private final GithubRepoRepository repos;
	private final GithubContributionsRepository contributions;

	GithubSyncService(GithubClient client, GithubRepoRepository repos, GithubContributionsRepository contributions) {
		this.client = client;
		this.repos = repos;
		this.contributions = contributions;
	}

	/** Tout ou rien (D18) : en cas d'échec, le cache précédent reste intact. Ne lève jamais. */
	@Transactional
	public void sync() {
		if (!client.enabled()) {
			log.info("github-sync : GITHUB_TOKEN vide, synchro ignorée");
			return;
		}
		Snapshot s;
		try {
			s = client.fetch();
		} catch (RestClientResponseException e) {
			log.warn("github-sync : échec, cache conservé (HTTP {})", e.getStatusCode().value());
			return;
		} catch (RuntimeException e) {
			// jamais e.getMessage() : on ne journalise que le type d'erreur
			log.warn("github-sync : échec, cache conservé ({})", e.getClass().getSimpleName());
			return;
		}
		Instant now = Instant.now();
		Set<String> names = s.repos().stream().map(Repo::name).collect(Collectors.toSet());
		var cached = repos.findAll();
		// Page tronquée ou liste vide alors que le cache ne l'est pas : on ne supprime rien (upsert seulement).
		if (s.truncated() || (names.isEmpty() && !cached.isEmpty())) {
			log.warn("github-sync : réponse partielle (hasNextPage ou liste vide), aucune suppression");
		} else {
			repos.deleteAll(cached.stream().filter(r -> !names.contains(r.name)).toList());
		}
		for (Repo r : s.repos()) {
			GithubRepo e = new GithubRepo();
			e.name = r.name();
			e.pushedAt = r.pushedAt();
			e.commits = r.commits();
			e.languages = r.languages();
			e.syncedAt = now;
			repos.save(e);
		}
		GithubContributions c = new GithubContributions();
		c.startDate = s.calendar().start();
		c.counts = s.calendar().counts();
		c.total = s.calendar().total();
		c.syncedAt = now;
		contributions.save(c);
		log.info("github-sync : {} dépôts synchronisés", s.repos().size());
	}
}
