package com.seps.admin.repository;

import com.seps.admin.domain.Role;
import com.seps.admin.enums.UserTypeEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>, JpaSpecificationExecutor<Role> {
    Page<Role> findByNameContainingIgnoreCase(String search, Pageable pageable);

    Page<Role> findByNameContainingIgnoreCaseAndDeletedFalse(String name, Pageable pageable);

    Page<Role> findByDeletedFalse(Pageable pageable);

    List<Role> findByDeletedFalse();

    List<Role> findByUserTypeAndDeletedFalse(String userType);

    Optional<Role> findByIdAndUserType(Long roleId, String userType);
}
