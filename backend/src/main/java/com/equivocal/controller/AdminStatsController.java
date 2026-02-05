package com.equivocal.controller;

import com.equivocal.repository.ChatMessageRepository;
import com.equivocal.repository.ChatSessionRepository;
import com.equivocal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminStatsController {

    private final UserRepository userRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    /**
     * 获取统计数据
     * @param quick 如果为 true，只返回核心用户统计（2次查询），否则返回完整统计（7次查询）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "true") boolean quick) {
        long startTime = System.currentTimeMillis();
        Map<String, Object> stats = new HashMap<>();

        // 核心统计：只需要 2 次查询
        long adminUsers = userRepository.countAdminUsers();
        long regularUsers = userRepository.countRegularUsers();
        long totalUsers = adminUsers + regularUsers;
        
        stats.put("totalUsers", totalUsers);
        stats.put("adminUsers", adminUsers);
        stats.put("regularUsers", regularUsers);

        // 快速模式：只返回核心统计，跳过其他查询
        if (!quick) {
            // 活跃用户和今日统计
            long activeUsers = userRepository.countByEmailVerified(true);
            LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            long todayNewUsers = userRepository.countByCreatedAtAfter(todayStart);

            // 聊天统计
            long totalSessions = chatSessionRepository.count();
            long totalMessages = chatMessageRepository.count();
            long todaySessions = chatSessionRepository.countByCreatedAtAfter(todayStart);

            stats.put("activeUsers", activeUsers);
            stats.put("todayNewUsers", todayNewUsers);

            Map<String, Object> chatStats = new HashMap<>();
            chatStats.put("totalSessions", totalSessions);
            chatStats.put("totalMessages", totalMessages);
            chatStats.put("todaySessions", todaySessions);
            stats.put("chat", chatStats);
        }

        long endTime = System.currentTimeMillis();
        log.debug("[PERF] AdminStatsController.getStats(quick={}) 耗时: {}ms", quick, (endTime - startTime));

        return ResponseEntity.ok(stats);
    }
}
