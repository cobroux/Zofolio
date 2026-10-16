package dev.zofolio.content;

import java.util.List;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Project {
	public enum Tier { CASE_STUDY, SHORT, HIDDEN }

	public enum AiTag { HAND, HAND_THEN_AI, AI }

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long id;
	public String slug;
	@Enumerated(EnumType.STRING)
	public Tier tier;
	public String stage;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> title;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> pitch;
	@Enumerated(EnumType.STRING)
	public AiTag aiTag;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public List<String> stack;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> duration;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> note;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public List<String> githubRepos = List.of();
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> role;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> problem;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, List<ContentDto.Decision>> decisions;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> wall;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> takeaway;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> aiNote;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> metaTitle;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public Map<String, String> metaDescription;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	public VideoData video;
	public String demoUrl;
	public int sortOrder;

	/** Forme stockée du clip (plan-v2 §4.5, D44) : sans {@code mp4}/{@code poster}, les URL sont dérivées du nom (ADR 0003). */
	public record VideoData(String name, String mp4, String poster, int width, int height, Map<String, String> caption) {}
}
