package com.equivocal;

import com.equivocal.config.MethodSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringJUnitConfig(classes = {MethodSecurityConfig.class, MethodSecuritySmokeTest.TestBeans.class})
class MethodSecuritySmokeTest {

    @javax.annotation.Resource
    private SecuredTestBean securedTestBean;

    @Test
    void adminOnlyMethod_asRegularUser_isDenied() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "user",
                        "N/A",
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                )
        );

        assertThrows(AccessDeniedException.class, () -> securedTestBean.adminOnly());
    }

    @Test
    void adminOnlyMethod_asAdmin_isAllowed() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin",
                        "N/A",
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
                )
        );

        assertEquals("ok", securedTestBean.adminOnly());
    }

    @Configuration
    static class TestBeans {
        @Bean
        SecuredTestBean securedTestBean() {
            return new SecuredTestBean();
        }
    }

    static class SecuredTestBean {
        @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
        public String adminOnly() {
            return "ok";
        }
    }
}
