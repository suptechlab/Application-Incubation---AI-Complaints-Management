package com.seps.admin.repository;

import com.seps.admin.domain.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    @Query("select m from Module m left join fetch m.permissions")
    List<Module> findAllWithPermissions();

    @Query("SELECT DISTINCT m FROM Module m LEFT JOIN FETCH m.permissions p WHERE m.userType = :userType ORDER BY m.sortOrder ASC")
    List<Module> findAllWithPermissions(@Param("userType") String userType);

}
