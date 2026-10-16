package dev.zofolio.contact;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import dev.zofolio.shared.ApiException;
import dev.zofolio.shared.IpHash;

@Service
class ContactService {
	private static final Logger log = LoggerFactory.getLogger(ContactService.class);
	static final int MAX_PER_HOUR = 5;
	static final Duration WINDOW = Duration.ofMinutes(60);

	private final ContactMessageRepository repository;
	private final JavaMailSender mailSender;
	private final String to;
	private final String from;
	private final String salt;

	ContactService(ContactMessageRepository repository, JavaMailSender mailSender,
			@Value("${CONTACT_TO:contact@zofolio.local}") String to,
			@Value("${SMTP_USERNAME:}") String from,
			@Value("${IP_HASH_SALT:}") String salt) {
		if (salt.length() < 16) {
			throw new IllegalStateException("IP_HASH_SALT must be set to at least 16 characters");
		}
		this.repository = repository;
		this.mailSender = mailSender;
		this.to = to;
		this.from = from.isBlank() ? "noreply@zofolio.local" : from;
		this.salt = salt;
	}

	/** Pas de @Transactional : le message doit rester enregistré même si l'envoi échoue. */
	void send(ContactRequest r, String ip) {
		if (r.website() != null && !r.website().isBlank()) {
			return; // honeypot : 202 silencieux, rien d'enregistré, ne compte pas dans la limite
		}
		String ipHash = hash(ip);
		if (repository.countByIpHashAndCreatedAtAfter(ipHash, Instant.now().minus(WINDOW)) >= MAX_PER_HOUR) {
			// shortcut: Retry-After = fenêtre entière (borne haute), affiner avec le plus ancien message si besoin
			throw ApiException.rateLimited(WINDOW.toSeconds());
		}
		ContactMessage m = repository.save(new ContactMessage(r, ipHash));
		try {
			mailSender.send(mail(r));
			m.status = ContactMessage.Status.SENT;
			repository.save(m);
		} catch (RuntimeException e) {
			// type d'erreur seulement : le message d'exception SMTP peut contenir l'identifiant
			log.warn("Échec d'envoi du message de contact {} : {}", m.id, e.getClass().getSimpleName());
			m.status = ContactMessage.Status.FAILED;
			repository.save(m);
			throw ApiException.mailFailed();
		}
	}

	private SimpleMailMessage mail(ContactRequest r) {
		SimpleMailMessage mail = new SimpleMailMessage();
		mail.setFrom(from);
		mail.setTo(to);
		mail.setReplyTo(r.email());
		mail.setSubject("[Zofolio] Message de " + r.name());
		mail.setText("De : " + r.name() + " <" + r.email() + ">\nEntreprise : "
				+ (r.company() == null ? "-" : r.company()) + "\n\n" + r.message());
		return mail;
	}

	private String hash(String ip) {
		return IpHash.of(salt, ip);
	}
}
