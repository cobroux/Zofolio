package dev.zofolio.cv;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cv_download")
class CvDownload {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String lang;
	@Column(name = "downloaded_at")
	Instant downloadedAt = Instant.now();

	protected CvDownload() {}

	CvDownload(String lang) { this.lang = lang; }
}
