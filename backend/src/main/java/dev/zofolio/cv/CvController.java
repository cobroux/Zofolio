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

	CvController(CvDownloadRepository repository,
			@Value("${zofolio.cv.location:classpath:cv/Enzo-Leveque-CV-FR.pdf}") Resource pdf) {
		this.repository = repository;
		this.pdf = pdf;
	}

	@GetMapping("/api/{lang}/cv")
	ResponseEntity<Resource> cv(@PathVariable String lang) {
		if (!lang.equals("fr") && !lang.equals("en")) throw ApiException.notFound();
		if (!pdf.exists()) throw ApiException.notFound();
		repository.save(new CvDownload(lang));
		// V1 : EN absent, repli sur le CV FR (D9)
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_PDF)
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename("Enzo-Leveque-CV-FR.pdf").build().toString())
				.body(pdf);
	}
}
