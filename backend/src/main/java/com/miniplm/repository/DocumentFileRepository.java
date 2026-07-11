package com.miniplm.repository;

import com.miniplm.model.DocumentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DocumentFileRepository extends JpaRepository<DocumentFile, UUID> {
    List<DocumentFile> findByItemRevision_IdOrderByUploadDateDesc(UUID itemRevisionId);
}
