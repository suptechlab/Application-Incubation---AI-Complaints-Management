package com.seps.ticket.repository;

import com.seps.ticket.domain.TicketSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketSequenceRepository extends JpaRepository<TicketSequence, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TicketSequence ts WHERE ts.prefix = :prefix AND ts.year = :year")
    Optional<TicketSequence> findAndLock(@Param("prefix") String prefix, @Param("year") int year);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TicketSequence ts WHERE ts.prefix = :prefix")
    List<TicketSequence> findAllByPrefixLocked(@Param("prefix") String prefix);
}
