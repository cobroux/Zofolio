package dev.zofolio.contact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import dev.zofolio.shared.ApiException;

class ContactServiceTest {
	ContactMessageRepository repo = mock(ContactMessageRepository.class);
	JavaMailSender mail = mock(JavaMailSender.class);
	ContactService service = new ContactService(repo, mail, "to@x.dev", "", "salt-of-16-chars!");
	ContactRequest req = new ContactRequest("Ada", "ada@x.dev", null, "Hello", "");

	ContactServiceTest() {
		when(repo.save(any(ContactMessage.class))).thenAnswer(i -> i.getArgument(0));
	}

	@Test
	void sendsMailAndMarksSent() {
		ArgumentCaptor<ContactMessage> saved = ArgumentCaptor.forClass(ContactMessage.class);
		service.send(req, "1.2.3.4");
		ArgumentCaptor<SimpleMailMessage> m = ArgumentCaptor.forClass(SimpleMailMessage.class);
		verify(mail).send(m.capture());
		assertThat(m.getValue().getTo()).containsExactly("to@x.dev");
		assertThat(m.getValue().getReplyTo()).isEqualTo("ada@x.dev");
		assertThat(m.getValue().getSubject()).isEqualTo("[Zofolio] Message de Ada");
		verify(repo, org.mockito.Mockito.times(2)).save(saved.capture());
		assertThat(saved.getValue().status).isEqualTo(ContactMessage.Status.SENT);
		assertThat(saved.getValue().ipHash).hasSize(64).doesNotContain("1.2.3.4");
	}

	@Test
	void mailFailureKeepsMessageAsFailedAndThrows() {
		org.mockito.Mockito.doThrow(new MailSendException("down")).when(mail).send(any(SimpleMailMessage.class));
		ArgumentCaptor<ContactMessage> saved = ArgumentCaptor.forClass(ContactMessage.class);
		assertThatThrownBy(() -> service.send(req, "1.2.3.4"))
				.isInstanceOf(ApiException.class).hasMessage("MAIL_DELIVERY_FAILED");
		verify(repo, org.mockito.Mockito.times(2)).save(saved.capture());
		assertThat(saved.getValue().status).isEqualTo(ContactMessage.Status.FAILED);
	}

	@Test
	void shortOrMissingSaltFailsStartup() {
		assertThatThrownBy(() -> new ContactService(repo, mail, "to@x.dev", "", "short"))
				.isInstanceOf(IllegalStateException.class).hasMessageContaining("IP_HASH_SALT");
		assertThatThrownBy(() -> new ContactService(repo, mail, "to@x.dev", "", ""))
				.isInstanceOf(IllegalStateException.class);
	}

	@Test
	void honeypotWritesNothing() {
		service.send(new ContactRequest("Bot", "b@x.dev", null, "spam", "http://spam"), "1.2.3.4");
		verify(repo, never()).save(any());
		verify(mail, never()).send(any(SimpleMailMessage.class));
	}

	@Test
	void sixthMessageIsRateLimited() {
		when(repo.countByIpHashAndCreatedAtAfter(any(), any(Instant.class))).thenReturn(5L);
		assertThatThrownBy(() -> service.send(req, "1.2.3.4"))
				.isInstanceOf(ApiException.class).hasMessage("RATE_LIMITED");
		verify(repo, never()).save(any());
	}
}
