package com.blog.insightblog.repository;

import com.blog.insightblog.model.ModerationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModerationLogRepository extends JpaRepository<ModerationLog, Long> {

    List<ModerationLog> findByUsernameOrderByCheckedAtDesc(String username);

    List<ModerationLog> findByAllowedFalseOrderByCheckedAtDesc();

    List<ModerationLog> findAllByOrderByCheckedAtDesc();
}
