package com.equivocal.security;

import com.equivocal.entity.User;
import com.equivocal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            final String jwt = authHeader.substring(7);
            log.info("[JwtAuthFilter] 开始解析 JWT...");
            final String userId = jwtService.extractUserId(jwt);
            log.info("[JwtAuthFilter] 解析到 userId: {}", userId);
            
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.info("[JwtAuthFilter] 开始查询用户...");
                Optional<User> userOpt = userRepository.findById(userId);
                log.info("[JwtAuthFilter] 用户查询完成: {}", userOpt.isPresent());
                
                if (userOpt.isPresent() && jwtService.isTokenValid(jwt)) {
                    User user = userOpt.get();
                    
                    // role >= 10 为管理员，否则为普通用户
                    String role = user.isAdmin() ? "ROLE_ADMIN" : "ROLE_USER";
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(role))
                    );
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("[JwtAuthFilter] 用户认证成功: userId={}, role={}", userId, role);
                }
            }
        } catch (Exception e) {
            log.warn("[JwtAuthFilter] JWT 验证失败: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}