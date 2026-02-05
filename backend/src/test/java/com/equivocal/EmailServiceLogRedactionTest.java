package com.equivocal;

import com.equivocal.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import static org.junit.jupiter.api.Assertions.assertFalse;

@ExtendWith(OutputCaptureExtension.class)
class EmailServiceLogRedactionTest {

    @Test
    void sendVerificationCode_doesNotLogApiKeyPrefixOrLength(CapturedOutput output) {
        EmailService service = new EmailService(WebClient.builder());
        ReflectionTestUtils.setField(service, "resendApiKey", "");
        ReflectionTestUtils.setField(service, "fromEmail", "noreply@example.com");

        service.sendVerificationCode("user@example.com", "123456");

        String logs = output.getAll();
        assertFalse(logs.contains("Resend API Key 长度"));
        assertFalse(logs.contains("Resend API Key 前10字符"));
    }
}

