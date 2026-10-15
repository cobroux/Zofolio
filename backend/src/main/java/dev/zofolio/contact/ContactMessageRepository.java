package dev.zofolio.contact;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;

interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
	long countByIpHashAndCreatedAtAfter(String ipHash, Instant since);
}
