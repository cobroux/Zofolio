package dev.zofolio.githubsync;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Total de contributions d'une année civile (GraphQL {@code contributionsCollection(from, to)}). */
@Entity
public class GithubContributionYear {
	@Id
	public int year;
	public int total;
	public Instant syncedAt;
}
