package com.miniplm.repository;

import com.miniplm.model.BomLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BomLineRepository extends JpaRepository<BomLine, UUID> {
    List<BomLine> findByParentRevision_IdOrderBySequenceNumberAsc(UUID parentRevisionId);
    List<BomLine> findByChildRevision_Id(UUID childRevisionId);
    List<BomLine> findByParentRevision_IdAndChildRevision_Id(UUID parentRevisionId, UUID childRevisionId);
}
