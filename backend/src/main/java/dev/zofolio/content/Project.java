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
	Integer commits;
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	Map<String, String> note;
	String repoUrl;
	String demoUrl;
	int sortOrder;
}
