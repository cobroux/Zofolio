package dev.zofolio.shared;

import java.util.Map;

/** Résolution unique des textes traduisibles : {@code map[lang] ?? map["fr"]} (ADR 0001). */
public final class I18n {

	private I18n() {}

	public static String pick(Map<String, String> texts, String lang) {
		if (texts == null) {
			return null;
		}
		String v = texts.get(lang);
		return v != null ? v : texts.get("fr");
	}
}
