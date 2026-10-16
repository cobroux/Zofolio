package dev.zofolio.githubsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

/** Aucun appel réseau : MockRestServiceServer. Le token ci-dessous est factice. */
@ExtendWith(OutputCaptureExtension.class)
class GithubSyncServiceTest {

	static final String TOKEN = "fake-token-0123456789";
	static final String URL = "http://github.test/graphql";

	RestClient.Builder builder = RestClient.builder();
	MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
	GithubRepoRepository repos = mock(GithubRepoRepository.class);
	GithubContributionsRepository contributions = mock(GithubContributionsRepository.class);

	GithubSyncService service(String token) {
		return new GithubSyncService(new GithubClient(builder, URL, token, "cobroux"), repos, contributions);
	}

	@Test
	void successWritesReposAndContributionsAndDropsStaleOnes(CapturedOutput out) throws IOException {
		GithubRepo stale = new GithubRepo();
		stale.name = "supprime";
		when(repos.findAll()).thenReturn(List.of(stale));
		server.expect(requestTo(URL)).andExpect(method(HttpMethod.POST))
				.andExpect(header("Authorization", "Bearer " + TOKEN))
				.andRespond(withSuccess(ok(), MediaType.APPLICATION_JSON));

		service(TOKEN).sync();

		server.verify();
		verify(repos).deleteAll(List.of(stale));
		verify(repos, times(3)).save(any(GithubRepo.class));
		verify(contributions).save(any(GithubContributions.class));
		assertThat(out.getAll()).doesNotContain(TOKEN);
	}

	@Test
	void failuresLeaveCacheUntouchedAndNeverLogToken(CapturedOutput out) throws IOException {
		for (var response : List.of(withStatus(HttpStatus.UNAUTHORIZED).body("{\"message\":\"Bad credentials\"}")
				.contentType(MediaType.APPLICATION_JSON), withServerError(),
				withSuccess("{\"errors\":[{\"message\":\"boom\"}],\"data\":null}", MediaType.APPLICATION_JSON),
				withSuccess("{\"data\":{\"user\":null}}", MediaType.APPLICATION_JSON),
				withSuccess(ok().replace("\"totalCount\":10", "\"totalCount\":-1"), MediaType.APPLICATION_JSON),
				withSuccess(ok().replace("\"size\":500", "\"size\":-5"), MediaType.APPLICATION_JSON),
				withSuccess(ok().replace("repo-a", "x".repeat(101)), MediaType.APPLICATION_JSON),
				withSuccess("not json", MediaType.APPLICATION_JSON),
				withException(new SocketTimeoutException("Read timed out")))) {
			server.reset();
			server.expect(requestTo(URL)).andRespond(response);
			service(TOKEN).sync();
			server.verify();
		}
		verify(repos, never()).save(any());
		verify(repos, never()).deleteAll(any(Iterable.class));
		verifyNoInteractions(contributions);
		assertThat(out.getAll()).contains("cache conservé").doesNotContain(TOKEN);
	}

	@Test
	void hasNextPageKeepsMissingReposAndOnlyUpserts(CapturedOutput out) throws IOException {
		GithubRepo stale = new GithubRepo();
		stale.name = "page-2";
		when(repos.findAll()).thenReturn(List.of(stale));
		server.expect(requestTo(URL)).andRespond(withSuccess(
				ok().replace("\"hasNextPage\":false", "\"hasNextPage\":true"), MediaType.APPLICATION_JSON));

		service(TOKEN).sync();

		verify(repos, never()).deleteAll(any(Iterable.class));
		verify(repos, times(3)).save(any(GithubRepo.class));
		assertThat(out.getAll()).contains("aucune suppression");
	}

	@Test
	void emptyListWithNonEmptyCacheLeavesCacheIntact(CapturedOutput out) throws IOException {
		GithubRepo cached = new GithubRepo();
		cached.name = "repo-a";
		when(repos.findAll()).thenReturn(List.of(cached));
		String empty = ok().replaceAll("(?s)\"nodes\":\\[.*?\\]\\},\\s*\"contributionsCollection", "\"nodes\":[]},\"contributionsCollection");
		server.expect(requestTo(URL)).andRespond(withSuccess(empty, MediaType.APPLICATION_JSON));

		service(TOKEN).sync();

		verify(repos, never()).deleteAll(any(Iterable.class));
		verify(repos, never()).save(any());
		assertThat(out.getAll()).contains("aucune suppression");
	}

	@Test
	void blankTokenMakesNoRequest() {
		service("").sync(); // aucune attente déclarée : toute requête ferait échouer MockRestServiceServer
		server.verify();
		verifyNoInteractions(repos, contributions);
	}

	private static String ok() throws IOException {
		return new ClassPathResource("github/graphql-ok.json").getContentAsString(StandardCharsets.UTF_8);
	}
}
