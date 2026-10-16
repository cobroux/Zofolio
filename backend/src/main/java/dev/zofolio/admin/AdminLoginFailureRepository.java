package dev.zofolio.admin;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface AdminLoginFailureRepository extends JpaRepository<AdminLoginFailure, Long> {
	long countByIpHashAndFailedAtAfter(String ipHash, Instant since);

	long countByFailedAtAfter(Instant since);

	Optional<AdminLoginFailure> findFirstByIpHashAndFailedAtAfterOrderByFailedAtAsc(String ipHash, Instant since);

	Optional<AdminLoginFailure> findFirstByFailedAtAfterOrderByFailedAtAsc(Instant since);

	void deleteByIpHash(String ipHash);

	void deleteByFailedAtBefore(Instant before);
}
