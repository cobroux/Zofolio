package dev.zofolio.build;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.zofolio.githubsync.GithubSyncService;

@RestController
class BuildController {

	private final GithubSyncService sync;
	private final String sha;
	private final String deployedAt;

	BuildController(GithubSyncService sync, @Value("${GIT_SHA:}") String sha,
			@Value("${DEPLOYED_AT:}") String deployedAt) {
		this.sync = sync;
		this.sha = sha;
		this.deployedAt = deployedAt;
	}

	@GetMapping("/api/build")
	BuildInfo build() {
		return BuildInfo.of(sha, deployedAt, sync.ci());
	}
}
