package dev.zofolio.contact;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** RGPD art. 5-1-e : applique la durée de conservation annoncée dans les mentions légales (12 mois). */
@Component
class ContactPurgeJob {
	private static final Logger log = LoggerFactory.getLogger(ContactPurgeJob.class);
	static final Duration RETENTION = Duration.ofDays(365);

	private final ContactMessageRepository repo;

	ContactPurgeJob(ContactMessageRepository repo) {
		this.repo = repo;
	}

	@Scheduled(cron = "0 0 3 * * *", zone = "Europe/Paris")
	@Transactional
	void purge() {
		long n = repo.deleteByCreatedAtBefore(Instant.now().minus(RETENTION));
		if (n > 0) log.info("contact : {} message(s) de plus de 12 mois supprimé(s)", n);
	}
}
