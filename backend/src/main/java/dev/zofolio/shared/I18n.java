package dev.zofolio.shared;

import java.util.Map;

/** Résolution unique des contenus traduisibles : {@code map[lang] ?? map["fr"]} (ADR 0001, D14). */
public final class I18n {

	private I18n() {}

	public static <T> T pick(Map<String, T> texts, String lang) {
		if (texts == null) {
			return null;
		}
		T v = texts.get(lang);
		return v != null ? v : texts.get("fr");
	}
}
