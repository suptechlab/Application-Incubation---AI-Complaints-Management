package com.seps.admin.repository;

import com.seps.admin.domain.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    @Query("SELECT p.id FROM Permission p JOIN p.module m WHERE m.userType = :userType")
    List<Long> findValidPermissionIdsByUserType(@Param("userType") String userType);

}
