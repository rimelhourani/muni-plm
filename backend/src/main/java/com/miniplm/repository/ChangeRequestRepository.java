package com.miniplm.repository;

import com.miniplm.model.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, UUID> {
    List<ChangeRequest> findByRequester_Id(UUID requesterId);
    List<ChangeRequest> findAllByOrderByCreatedAtDesc();
}
