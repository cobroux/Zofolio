package dev.zofolio.githubsync;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GithubContributionYearRepository extends JpaRepository<GithubContributionYear, Integer> {
	List<GithubContributionYear> findAllByOrderByYearAsc();
}
