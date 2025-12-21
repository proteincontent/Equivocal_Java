package com.equivocal.repository;

import com.equivocal.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.email LIKE %:search%")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    /**
     * 查找管理员用户（role >= 10）
     */
    @Query("SELECT u FROM User u WHERE u.role >= 10")
    Page<User> findAdminUsers(Pageable pageable);
    
    /**
     * 查找普通用户（role < 10）
     */
    @Query("SELECT u FROM User u WHERE u.role < 10")
    Page<User> findRegularUsers(Pageable pageable);

    /**
     * 搜索管理员用户（role >= 10）
     */
    @Query("SELECT u FROM User u WHERE u.email LIKE %:search% AND u.role >= 10")
    Page<User> searchAdminUsers(@Param("search") String search, Pageable pageable);
    
    /**
     * 搜索普通用户（role < 10）
     */
    @Query("SELECT u FROM User u WHERE u.email LIKE %:search% AND u.role < 10")
    Page<User> searchRegularUsers(@Param("search") String search, Pageable pageable);
    
    /**
     * 统计管理员数量（role >= 10）
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role >= 10")
    long countAdminUsers();
    
    /**
     * 统计普通用户数量（role < 10）
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role < 10")
    long countRegularUsers();
    
    long countByEmailVerified(boolean emailVerified);
    
    long countByCreatedAtAfter(LocalDateTime dateTime);
}