package dev.zofolio.admin;

import java.time.Duration;
import java.time.Instant;
import java.util.OptionalLong;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** D38 : 5 échecs / 15 min par IP, 20 échecs / h toutes IP confondues ; compté en base (survit aux redémarrages). */
@Component
@Transactional
class LoginThrottle {
	static final int MAX_PER_IP = 5;
	static final Duration IP_WINDOW = Duration.ofMinutes(15);
	static final int MAX_GLOBAL = 20;
	static final Duration GLOBAL_WINDOW = Duration.ofHours(1);

	private final AdminLoginFailureRepository failures;

	LoginThrottle(AdminLoginFailureRepository failures) {
		this.failures = failures;
	}

	/** Secondes à attendre si l'IP (ou le plafond global) est bloquée ; vide sinon. Purge les lignes de plus de 24 h. */
	OptionalLong lockedFor(String ipHash) {
		Instant now = Instant.now();
		failures.deleteByFailedAtBefore(now.minus(Duration.ofHours(24)));
		Instant ipSince = now.minus(IP_WINDOW);
		if (failures.countByIpHashAndFailedAtAfter(ipHash, ipSince) >= MAX_PER_IP) {
			return remaining(failures.findFirstByIpHashAndFailedAtAfterOrderByFailedAtAsc(ipHash, ipSince)
					.map(f -> f.failedAt.plus(IP_WINDOW)).orElse(now), now);
		}
		Instant globalSince = now.minus(GLOBAL_WINDOW);
		if (failures.countByFailedAtAfter(globalSince) >= MAX_GLOBAL) {
			return remaining(failures.findFirstByFailedAtAfterOrderByFailedAtAsc(globalSince)
					.map(f -> f.failedAt.plus(GLOBAL_WINDOW)).orElse(now), now);
		}
		return OptionalLong.empty();
	}

	void recordFailure(String ipHash) {
		failures.save(new AdminLoginFailure(ipHash, Instant.now()));
	}

	void clear(String ipHash) {
		failures.deleteByIpHash(ipHash);
	}

	private static OptionalLong remaining(Instant until, Instant now) {
		return OptionalLong.of(Math.max(1, Duration.between(now, until).toSeconds()));
	}
}
