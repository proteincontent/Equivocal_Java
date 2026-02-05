package com.equivocal;

import com.equivocal.controller.UploadController;
import com.equivocal.service.AgentService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UploadControllerValidationTest {

    @Test
    void uploadFile_rejectsDisallowedContentType() throws Exception {
        AgentService agentService = mock(AgentService.class);
        UploadController controller = new UploadController(agentService);

        MultipartFile file = mock(MultipartFile.class);
        when(file.getContentType()).thenReturn("application/x-msdownload");
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(10L);
        when(file.getOriginalFilename()).thenReturn("evil.exe");
        when(file.getBytes()).thenReturn(new byte[]{1});

        ResponseEntity<Map<String, Object>> response = controller.uploadFile(file);

        assertEquals(400, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(false, response.getBody().get("success"));
        verify(agentService, never()).uploadFile(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }
}
