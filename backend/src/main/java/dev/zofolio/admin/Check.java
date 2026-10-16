package dev.zofolio.admin;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import dev.zofolio.shared.ApiException;
import dev.zofolio.shared.ApiExceptionHandler.FieldError;

/** Accumule les erreurs de validation (champ en notation pointée + code) puis lève un 400 VALIDATION_FAILED. */
final class Check {
	static final Set<String> LANGS = Set.of("fr", "en");

	private final List<FieldError> errors = new ArrayList<>();

	void add(String field, String code) {
		errors.add(new FieldError(field, code));
	}

	void throwIfAny() {
		if (!errors.isEmpty()) {
			throw ApiException.validation(List.copyOf(errors));
		}
	}

	/** Clés ⊆ {fr,en} ; valeurs vides ignorées ; si le champ est présent, {@code fr} est obligatoire. Renvoie la forme nettoyée. */
	Map<String, String> text(String field, Map<String, String> in, int max, boolean required) {
		Map<String, String> out = new LinkedHashMap<>();
		if (in != null) {
			in.forEach((k, v) -> {
				if (!LANGS.contains(k)) {
					add(field + "." + k, "InvalidKey");
				} else if (v != null && !v.isBlank()) {
					if (v.length() > max) {
						add(field + "." + k, "Size");
					}
					out.put(k, v.strip());
				}
			});
		}
		if (out.isEmpty() && !required) {
			return null;
		}
		if (!out.containsKey("fr")) {
			add(field + ".fr", "NotBlank");
		}
		return out;
	}

	boolean matches(String field, String value, Pattern p) {
		if (value == null || !p.matcher(value).matches()) {
			add(field, "Pattern");
			return false;
		}
		return true;
	}

	/** Nombre facultatif : absent accepté, présent borné. */
	void optRange(String field, Number v, double min, double max) {
		if (v != null) {
			range(field, v, min, max);
		}
	}

	void range(String field, Number v, double min, double max) {
		if (v == null || v.doubleValue() < min || v.doubleValue() > max) {
			add(field, "Range");
		}
	}
}
