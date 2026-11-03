package dev.zofolio.githubsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
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
import java.time.Year;
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
import org.springframework.transaction.support.TransactionOperations;
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
	GithubContributionYearRepository years = mock(GithubContributionYearRepository.class);
	int lastYear = Year.now().getValue();

	GithubSyncService service(String token) {
		return new GithubSyncService(new GithubClient(builder, URL, token, "cobroux"), repos, contributions, years,
				TransactionOperations.withoutTransaction());
	}

	/** Une réponse par année de 2023 à aujourd'hui ; {@code failing} répond 500, les autres renvoient year * 10. */
	void expectYears(Integer failing) {
		for (int y = 2023; y <= lastYear; y++) {
			server.expect(requestTo(URL)).andExpect(content().string(containsString("\"" + y + "-01-01T00:00:00Z\"")))
					.andRespond(failing != null && failing == y ? withServerError()
							: withSuccess("{\"data\":{\"user\":{\"contributionsCollection\":{\"contributionCalendar\":{\"totalContributions\":"
									+ y * 10 + "}}}}}", MediaType.APPLICATION_JSON));
		}
	}

	@Test
	void ciStatusComesFromTheLatestCompletedMainRunAndNeverLogsTheToken(CapturedOutput out) {
		server.expect(requestTo("http://github.test/repos/cobroux/Zofolio/actions/workflows/ci.yml/runs?branch=main&status=completed&per_page=1"))
				.andExpect(header("Authorization", "Bearer " + TOKEN))
				.andRespond(withSuccess("{\"workflow_runs\":[{\"conclusion\":\"failure\",\"html_url\":\"https://github.com/cobroux/Zofolio/actions/runs/1\"}]}",
						MediaType.APPLICATION_JSON));
		var service = service(TOKEN);
		assertThat(service.ci()).isNull();
		service.syncCi();
		server.verify();
		assertThat(service.ci()).isEqualTo(new CiStatus("failure", "https://github.com/cobroux/Zofolio/actions/runs/1"));

		// Échec ou lien hors github.com : on garde la valeur précédente / on retire le lien.
		server.reset();
		server.expect(requestTo("http://github.test/repos/cobroux/Zofolio/actions/workflows/ci.yml/runs?branch=main&status=completed&per_page=1"))
				.andRespond(withServerError());
		service.syncCi();
		assertThat(service.ci().conclusion()).isEqualTo("failure");
		server.reset();
		server.expect(requestTo("http://github.test/repos/cobroux/Zofolio/actions/workflows/ci.yml/runs?branch=main&status=completed&per_page=1"))
				.andRespond(withSuccess("{\"workflow_runs\":[{\"conclusion\":\"cancelled\",\"html_url\":\"http://evil.test/x\"}]}", MediaType.APPLICATION_JSON));
		service.syncCi();
		assertThat(service.ci()).isEqualTo(new CiStatus(null, null));
		assertThat(out.getAll()).doesNotContain(TOKEN);
	}

	@Test
	void syncRequestsEachYearFrom2023AndStoresOneRowPerYear() throws IOException {
		server.expect(requestTo(URL)).andRespond(withSuccess(ok(), MediaType.APPLICATION_JSON));
		expectYears(null);

		service(TOKEN).sync();

		server.verify();
		var saved = org.mockito.ArgumentCaptor.forClass(GithubContributionYear.class);
		verify(years, times(lastYear - 2022)).save(saved.capture());
		assertThat(saved.getAllValues()).extracting(y -> y.year).containsExactly(
				java.util.stream.IntStream.rangeClosed(2023, lastYear).boxed().toArray(Integer[]::new));
		assertThat(saved.getAllValues()).allMatch(y -> y.total == y.year * 10 && y.syncedAt != null);
	}

	@Test
	void aYearInErrorIsNotWrittenSoItKeepsItsPreviousValue(CapturedOutput out) throws IOException {
		server.expect(requestTo(URL)).andRespond(withSuccess(ok(), MediaType.APPLICATION_JSON));
		expectYears(2024);

		service(TOKEN).sync();

		server.verify();
		var saved = org.mockito.ArgumentCaptor.forClass(GithubContributionYear.class);
		verify(years, times(lastYear - 2023)).save(saved.capture());
		assertThat(saved.getAllValues()).extracting(y -> y.year).doesNotContain(2024).contains(2023, 2025);
		assertThat(out.getAll()).contains("année 2024 ignorée").doesNotContain(TOKEN);
	}

	@Test
	void successWritesReposAndContributionsAndDropsStaleOnes(CapturedOutput out) throws IOException {
		GithubRepo stale = new GithubRepo();
		stale.name = "supprime";
		when(repos.findAll()).thenReturn(List.of(stale));
		server.expect(requestTo(URL)).andExpect(method(HttpMethod.POST))
				.andExpect(header("Authorization", "Bearer " + TOKEN))
				.andRespond(withSuccess(ok(), MediaType.APPLICATION_JSON));
		expectYears(null);

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
		verifyNoInteractions(contributions, years);
		assertThat(out.getAll()).contains("cache conservé").doesNotContain(TOKEN);
	}

	@Test
	void hasNextPageKeepsMissingReposAndOnlyUpserts(CapturedOutput out) throws IOException {
		GithubRepo stale = new GithubRepo();
		stale.name = "page-2";
		when(repos.findAll()).thenReturn(List.of(stale));
		server.expect(requestTo(URL)).andRespond(withSuccess(
				ok().replace("\"hasNextPage\":false", "\"hasNextPage\":true"), MediaType.APPLICATION_JSON));
		expectYears(null);

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
		expectYears(null);

		service(TOKEN).sync();

		verify(repos, never()).deleteAll(any(Iterable.class));
		verify(repos, never()).save(any());
		assertThat(out.getAll()).contains("aucune suppression");
	}

	@Test
	void aSaveFailureKeepsTheCacheLogsItAndDoesNotPreventTheCiSync(CapturedOutput out) throws IOException {
		when(contributions.save(any(GithubContributions.class))).thenThrow(new IllegalStateException("db down " + TOKEN));
		server.expect(requestTo(URL)).andRespond(withSuccess(ok(), MediaType.APPLICATION_JSON));
		expectYears(null);
		server.expect(requestTo("http://github.test/repos/cobroux/Zofolio/actions/workflows/ci.yml/runs?branch=main&status=completed&per_page=1"))
				.andRespond(withSuccess("{\"workflow_runs\":[{\"conclusion\":\"success\",\"html_url\":\"https://github.com/cobroux/Zofolio/actions/runs/2\"}]}",
						MediaType.APPLICATION_JSON));
		var service = service(TOKEN);

		new GithubSyncJob(service).run(); // ne lève pas, et la CI est quand même lue

		server.verify();
		assertThat(service.ci().conclusion()).isEqualTo("success");
		assertThat(out.getAll()).contains("cache conservé (IllegalStateException)").doesNotContain(TOKEN);
	}

	@Test
	void blankTokenMakesNoRequest() {
		var service = service("");
		service.sync(); // aucune attente déclarée : toute requête ferait échouer MockRestServiceServer
		service.syncCi();
		assertThat(service.ci()).isNull();
		server.verify();
		verifyNoInteractions(repos, contributions, years);
	}

	private static String ok() throws IOException {
		return new ClassPathResource("github/graphql-ok.json").getContentAsString(StandardCharsets.UTF_8);
	}
}
