package com.equivocal;

import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class NoSecretsInResourcesTest {

    private static final Pattern ENV_DEFAULT_PATTERN =
            Pattern.compile("\\$\\{(?<key>[A-Z0-9_]+):(?<def>[^}]*)\\}");

    @Test
    void applicationYml_doesNotContainHardcodedSecretsOrRemoteDefaults() throws Exception {
        String yml = readClasspathResource("/application.yml");

        assertFalse(yml.contains("tidbcloud.com"), "application.yml must not hardcode remote DB host");
        assertFalse(yml.contains("gateway01."), "application.yml must not hardcode remote DB host");

        assertEnvDefaultEquals(yml, "SPRING_DATASOURCE_PASSWORD", "");
        assertEnvDefaultEquals(yml, "SPRING_DATASOURCE_USERNAME", "root");
        assertEnvDefaultEquals(yml, "RESEND_API_KEY", "");
        assertEnvDefaultEquals(yml, "JWT_SECRET", "");

        assertFalse(yml.contains("eyJhbGci"), "application.yml must not contain JWT-like tokens");
        assertFalse(yml.contains("pat_"), "application.yml must not contain token-like prefixes");
        assertFalse(yml.contains("sk-"), "application.yml must not contain token-like prefixes");
        assertFalse(yml.contains("BEGIN PRIVATE KEY"), "application.yml must not contain private keys");
    }

    private static void assertEnvDefaultEquals(String yml, String key, String expectedDefault) {
        Matcher matcher = ENV_DEFAULT_PATTERN.matcher(yml);
        while (matcher.find()) {
            if (key.equals(matcher.group("key"))) {
                assertEquals(expectedDefault, matcher.group("def"), "unexpected default for " + key);
                return;
            }
        }
        throw new AssertionError("missing env var default: " + key);
    }

    private static String readClasspathResource(String path) throws Exception {
        try (InputStream is = NoSecretsInResourcesTest.class.getResourceAsStream(path)) {
            assertNotNull(is, "missing resource: " + path);
            byte[] bytes = is.readAllBytes();
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }
}
