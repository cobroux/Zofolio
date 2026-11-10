package dev.zofolio.contact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class ContactPurgeJobTest {
	ContactMessageRepository repo = mock(ContactMessageRepository.class);

	@Test
	void deletesMessagesOlderThanTwelveMonths() {
		Instant before = Instant.now();
		new ContactPurgeJob(repo).purge();
		ArgumentCaptor<Instant> cutoff = ArgumentCaptor.forClass(Instant.class);
		verify(repo).deleteByCreatedAtBefore(cutoff.capture());
		assertThat(Duration.between(cutoff.getValue(), before)).isBetween(Duration.ofDays(365).minusSeconds(5), Duration.ofDays(365).plusSeconds(5));
	}
}
