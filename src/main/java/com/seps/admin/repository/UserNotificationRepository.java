package com.seps.admin.repository;

import com.seps.admin.domain.UserNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserIdAndIsReadFalse(Long userId);

    Page<UserNotification> findAllByUserId(Long userId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM UserNotification n WHERE n.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
