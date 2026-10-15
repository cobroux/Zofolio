package dev.zofolio.githubsync;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GithubRepoRepository extends JpaRepository<GithubRepo, String> {}
