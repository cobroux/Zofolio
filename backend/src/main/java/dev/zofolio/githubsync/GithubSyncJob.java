package dev.zofolio.githubsync;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Désactivé en test par {@code zofolio.github.sync.enabled=false}. Synchro aussi à chaque démarrage (D17). */
@Component
@ConditionalOnProperty(name = "zofolio.github.sync.enabled", havingValue = "true", matchIfMissing = true)
class GithubSyncJob {

	private final GithubSyncService service;

	GithubSyncJob(GithubSyncService service) {
		this.service = service;
	}

	@Scheduled(fixedRateString = "PT6H", initialDelayString = "PT30S")
	void run() {
		service.sync();
	}
}
