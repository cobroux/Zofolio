package dev.zofolio.githubsync;

import java.time.Instant;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Cache d'un dépôt public ; lu par {@code content}, qui n'expose que les dépôts de {@code github_repos} (D16). */
@Entity
public class GithubRepo {
	@Id
	public String name;
	public Instant pushedAt;
	public Integer commits;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, Long> languages;
	public Instant syncedAt;
}
