package dev.zofolio.cv;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import dev.zofolio.shared.ApiException;

@RestController
class CvController {
	private final CvDownloadRepository repository;
	private final Resource pdf;
	private final Resource pdfEn;

	CvController(CvDownloadRepository repository,
			@Value("${zofolio.cv.location:classpath:cv/Enzo-Leveque-CV-FR.pdf}") Resource pdf,
			@Value("${zofolio.cv.location-en:classpath:cv/Enzo-Leveque-CV-EN.pdf}") Resource pdfEn) {
		this.repository = repository;
		this.pdf = pdf;
		this.pdfEn = pdfEn;
	}

	@GetMapping("/api/{lang}/cv")
	ResponseEntity<Resource> cv(@PathVariable String lang) {
		if (!lang.equals("fr") && !lang.equals("en")) throw ApiException.notFound();
		if (!pdf.exists()) throw ApiException.notFound();
		repository.save(new CvDownload(lang));
		// EN absent : repli sur le CV FR (D9)
		boolean en = lang.equals("en") && pdfEn.exists();
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_PDF)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename(en ? "Enzo-Leveque-CV-EN.pdf" : "Enzo-Leveque-CV-FR.pdf").build().toString())
				.body(en ? pdfEn : pdf);
	}
}
