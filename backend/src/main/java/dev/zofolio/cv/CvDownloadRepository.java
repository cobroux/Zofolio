package dev.zofolio.cv;

import org.springframework.data.jpa.repository.JpaRepository;

interface CvDownloadRepository extends JpaRepository<CvDownload, Long> {}
