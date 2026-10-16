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
class Project {
	enum Tier { CASE_STUDY, SHORT, HIDDEN }

	enum AiTag { HAND, HAND_THEN_AI, AI }

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String slug;
	@Enumerated(EnumType.STRING)
	Tier tier;
	String stage;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> title;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> pitch;
	@Enumerated(EnumType.STRING)
	AiTag aiTag;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	List<String> stack;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> duration;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> note;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	List<String> githubRepos = List.of();
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> role;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> problem;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, List<ContentDto.Decision>> decisions;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> wall;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> takeaway;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> aiNote;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> metaTitle;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> metaDescription;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	VideoData video;
	String demoUrl;
	int sortOrder;

	/** Forme stockée du clip (plan-v2 §4.5) ; les URL sont dérivées du nom (ADR 0003). */
	record VideoData(String name, int width, int height, Map<String, String> caption) {}
}
