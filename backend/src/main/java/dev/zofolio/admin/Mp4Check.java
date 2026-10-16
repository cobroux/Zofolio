package dev.zofolio.admin;

import java.nio.charset.StandardCharsets;
import java.util.Set;

import dev.zofolio.shared.ApiException;

/**
 * Parcours des boîtes ISO-BMFF (D43). Refuse tout {@code udta}/{@code meta} qui porte une donnée (coordonnées
 * {@code ©xyz} des téléphones, {@code ©too}, clés) et tout {@code uuid} (XMP) : le fichier doit venir de
 * {@code tools/clips/encode.sh} ({@code -map_metadata -1}). Les coquilles vides que ffmpeg écrit quand même
 * ({@code udta > meta > hdlr + ilst vide}) restent acceptées, sinon la sortie de {@code encode.sh} serait refusée.
 */
final class Mp4Check {

	private static final Set<String> CONTAINERS = Set.of("moov", "trak", "mdia", "minf", "stbl", "edts", "dinf");
	private static final int MAX_DEPTH = 6;

	private Mp4Check() {}

	static boolean looksLikeMp4(byte[] d) {
		return d.length >= 12 && "ftyp".equals(new String(d, 4, 4, StandardCharsets.ISO_8859_1));
	}

	/** @throws ApiException MEDIA_REJECTED (METADATA ou DECODE) */
	static void check(byte[] d) {
		boolean[] seen = new boolean[2]; // moov, mdat
		walk(d, 0, d.length, 0, seen);
		if (!seen[0] || !seen[1]) {
			throw ApiException.mediaRejected("DECODE");
		}
	}

	private static void walk(byte[] d, int start, int end, int depth, boolean[] seen) {
		if (depth > MAX_DEPTH) {
			throw ApiException.mediaRejected("DECODE");
		}
		int pos = start;
		while (pos < end) {
			if (end - pos < 8) {
				throw ApiException.mediaRejected("DECODE");
			}
			long size = u32(d, pos);
			String type = new String(d, pos + 4, 4, StandardCharsets.ISO_8859_1);
			int header = 8;
			if (size == 1) { // taille sur 64 bits
				if (end - pos < 16) {
					throw ApiException.mediaRejected("DECODE");
				}
				size = u32(d, pos + 8) << 32 | u32(d, pos + 12);
				header = 16;
			} else if (size == 0) { // jusqu'à la fin
				size = end - pos;
			}
			if (size < header || size > end - pos) {
				throw ApiException.mediaRejected("DECODE");
			}
			if (type.equals("uuid")) {
				throw ApiException.mediaRejected("METADATA");
			}
			if (type.equals("udta")) {
				onlyShells(d, pos + header, pos + (int) size, "meta");
			} else if (type.equals("meta")) {
				onlyShells(d, pos + header + 4, pos + (int) size, "hdlr", "ilst"); // FullBox : 4 octets version/flags
			}
			if (type.equals("moov")) {
				seen[0] = true;
			} else if (type.equals("mdat")) {
				seen[1] = true;
			}
			if (CONTAINERS.contains(type)) {
				walk(d, pos + header, pos + (int) size, depth + 1, seen);
			}
			pos += (int) size;
		}
	}

	/** Les enfants doivent être dans {@code allowed} ; une {@code ilst} ne doit contenir aucun élément ; sinon METADATA. */
	private static void onlyShells(byte[] d, int start, int end, String... allowed) {
		int pos = start;
		while (pos < end) {
			if (end - pos < 8) {
				throw ApiException.mediaRejected("DECODE");
			}
			long size = u32(d, pos);
			String type = new String(d, pos + 4, 4, StandardCharsets.ISO_8859_1);
			if (size < 8 || size > end - pos || !java.util.Arrays.asList(allowed).contains(type)) {
				throw ApiException.mediaRejected(size < 8 || size > end - pos ? "DECODE" : "METADATA");
			}
			if (type.equals("ilst") && size > 8) {
				throw ApiException.mediaRejected("METADATA");
			}
			if (type.equals("meta")) {
				onlyShells(d, pos + 12, pos + (int) size, "hdlr", "ilst");
			}
			pos += (int) size;
		}
	}

	private static long u32(byte[] d, int p) {
		return ((long) (d[p] & 0xff) << 24) | ((d[p + 1] & 0xff) << 16) | ((d[p + 2] & 0xff) << 8) | (d[p + 3] & 0xff);
	}
}
