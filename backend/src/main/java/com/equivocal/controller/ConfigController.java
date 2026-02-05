package com.equivocal.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${app.name:Equivocal Legal}")
    private String appName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${openai.default-model:gpt-3.5-turbo}")
    private String defaultModel;

    @Value("${email.verification.enabled:true}")
    private boolean emailVerificationEnabled;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("appName", appName);
        config.put("appVersion", appVersion);
        config.put("defaultModel", defaultModel);
        config.put("emailVerificationEnabled", emailVerificationEnabled);

        Map<String, Object> features = new HashMap<>();
        features.put("chat", true);
        features.put("emailVerification", emailVerificationEnabled);
        features.put("admin", true);
        config.put("features", features);

        return ResponseEntity.ok(config);
    }
}
