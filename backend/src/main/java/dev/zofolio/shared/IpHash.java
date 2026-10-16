package dev.zofolio.shared;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** Hash salé d'une IP (D7), commun au contact et au blocage de connexion admin : jamais d'IP en clair en base. */
public final class IpHash {

	private IpHash() {}

	public static String of(String salt, String ip) {
		try {
			byte[] d = MessageDigest.getInstance("SHA-256").digest((salt + ip).getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(d);
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}
}
