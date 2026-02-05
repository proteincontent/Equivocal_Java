package com.equivocal;

import com.equivocal.controller.ConfigController;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ConfigControllerCozeRemovalTest {

    @Test
    void getConfig_doesNotExposeCozeFlags() {
        ConfigController controller = new ConfigController();
        ReflectionTestUtils.setField(controller, "appName", "Equivocal Legal");
        ReflectionTestUtils.setField(controller, "appVersion", "1.0.0");
        ReflectionTestUtils.setField(controller, "defaultModel", "gpt-4o-mini");
        ReflectionTestUtils.setField(controller, "emailVerificationEnabled", true);

        ResponseEntity<Map<String, Object>> response = controller.getConfig();
        assertNotNull(response);
        Map<String, Object> config = response.getBody();
        assertNotNull(config);

        assertFalse(config.containsKey("cozeEnabled"));

        Object featuresObj = config.get("features");
        assertNotNull(featuresObj);
        @SuppressWarnings("unchecked")
        Map<String, Object> features = (Map<String, Object>) featuresObj;
        assertFalse(features.containsKey("cozeChat"));
    }
}
