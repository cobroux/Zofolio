package dev.zofolio.githubsync;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Ligne unique (id = 1) : calendrier de contributions. */
@Entity
public class GithubContributions {
	public static final short ID = 1;

	@Id
	public short id = ID;
	public LocalDate startDate;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public List<Integer> counts;
	public int total;
	public Instant syncedAt;
}
