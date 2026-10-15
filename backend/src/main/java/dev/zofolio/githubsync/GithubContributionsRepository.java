package dev.zofolio.githubsync;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GithubContributionsRepository extends JpaRepository<GithubContributions, Short> {}
