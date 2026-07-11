package com.miniplm.repository;

import com.miniplm.model.Folder;
import com.miniplm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {
    Optional<Folder> findByOwnerAndParentFolderIsNull(User owner);
    List<Folder> findByParentFolderAndOwner(Folder parentFolder, User owner);
}
