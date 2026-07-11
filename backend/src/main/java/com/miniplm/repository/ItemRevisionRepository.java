package com.miniplm.repository;

import com.miniplm.model.ItemRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemRevisionRepository extends JpaRepository<ItemRevision, UUID> {
    Optional<ItemRevision> findByItem_IdAndRevisionId(UUID itemId, String revisionId);
    List<ItemRevision> findByItem_Id(UUID itemId);
}
