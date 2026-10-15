package dev.zofolio.shared;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** Ajoute la propriété {@code code} (plan §4.1) à tous les ProblemDetail ; aucun texte localisé, aucune pile. */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

	public record FieldError(String field, String code) {}

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		ProblemDetail pd = ex.getBody();
		pd.setProperty("code", "VALIDATION_FAILED");
		List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
				.map(e -> new FieldError(e.getField(), e.getCode())).toList();
		pd.setProperty("errors", errors);
		return handleExceptionInternal(ex, pd, headers, status, request);
	}

	@Override
	protected ResponseEntity<Object> createResponseEntity(@Nullable Object body, HttpHeaders headers,
			HttpStatusCode status, WebRequest request) {
		if (body instanceof ProblemDetail pd && (pd.getProperties() == null || !pd.getProperties().containsKey("code"))) {
			pd.setProperty("code", codeFor(status));
		}
		// detail générique, non localisé : ne reprend jamais le message Spring (pas de fuite)
		if (body instanceof ProblemDetail pd) {
			pd.setDetail(switch ((String) pd.getProperties().get("code")) {
				case "VALIDATION_FAILED" -> "Validation failed";
				case "MALFORMED_REQUEST" -> "Malformed request";
				case "NOT_FOUND" -> "Not found";
				case "RATE_LIMITED" -> "Rate limit exceeded";
				case "MAIL_DELIVERY_FAILED" -> "Mail delivery failed";
				default -> "Internal error";
			});
		}
		return super.createResponseEntity(body, headers, status, request);
	}

	@ExceptionHandler(ApiException.class)
	ResponseEntity<Object> handleApi(ApiException ex, WebRequest request) {
		ProblemDetail pd = ProblemDetail.forStatus(ex.status());
		pd.setProperty("code", ex.code());
		HttpHeaders headers = new HttpHeaders();
		if (ex.retryAfterSeconds() != null) {
			headers.set(HttpHeaders.RETRY_AFTER, ex.retryAfterSeconds().toString());
		}
		return handleExceptionInternal(ex, pd, headers, ex.status(), request);
	}

	@ExceptionHandler(Exception.class)
	ResponseEntity<Object> handleAny(Exception ex, WebRequest request) {
		logger.error("Unhandled exception", ex);
		ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
		return handleExceptionInternal(ex, pd, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
	}

	private static String codeFor(HttpStatusCode status) {
		return switch (status.value()) {
			case 400 -> "MALFORMED_REQUEST";
			case 404 -> "NOT_FOUND";
			default -> status.is5xxServerError() ? "INTERNAL_ERROR" : "MALFORMED_REQUEST";
		};
	}
}
