package dev.zofolio.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import dev.zofolio.admin.AdminDto.MediaAdmin;

@RestController
@RequestMapping("/api/admin/media")
class MediaController {

	private final MediaService service;

	MediaController(MediaService service) {
		this.service = service;
	}

	@PostMapping(consumes = "multipart/form-data")
	ResponseEntity<MediaAdmin> upload(@RequestPart("file") MultipartFile file) {
		var r = service.upload(file);
		return ResponseEntity.status(r.created() ? 201 : 200).body(r.media());
	}

	@GetMapping
	List<MediaAdmin> list() {
		return service.list();
	}

	@DeleteMapping("/{id}")
	ResponseEntity<Void> delete(@PathVariable long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}
}
