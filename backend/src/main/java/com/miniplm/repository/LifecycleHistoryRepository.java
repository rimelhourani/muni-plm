package com.miniplm.repository;

import com.miniplm.model.LifecycleHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LifecycleHistoryRepository extends JpaRepository<LifecycleHistory, UUID> {
    List<LifecycleHistory> findByItemRevision_IdOrderByChangeDateDesc(UUID itemRevisionId);
}
