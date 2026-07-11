package com.miniplm.service;

import com.miniplm.dto.CreateFolderRequestDto;
import com.miniplm.dto.FolderResponseDto;
import com.miniplm.exception.BadRequestException;
import com.miniplm.exception.ResourceNotFoundException;
import com.miniplm.model.Folder;
import com.miniplm.model.Item;
import com.miniplm.model.User;
import com.miniplm.repository.FolderRepository;
import com.miniplm.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final ItemRepository itemRepository;

    public FolderService(FolderRepository folderRepository, ItemRepository itemRepository) {
        this.folderRepository = folderRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Folder getOrCreateRootFolder(User user) {
        return folderRepository.findByOwnerAndParentFolderIsNull(user)
                .orElseGet(() -> {
                    Folder root = new Folder("Home", null, user);
                    return folderRepository.save(root);
                });
    }

    @Transactional(readOnly = true)
    public FolderResponseDto getFolder(UUID folderId, User user) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier non trouvé"));

        // check ownership (simple protection)
        if (!folder.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Vous n'êtes pas propriétaire de ce dossier");
        }

        return new FolderResponseDto(folder);
    }

    @Transactional
    public FolderResponseDto createFolder(CreateFolderRequestDto request, User user) {
        Folder parent = null;
        if (request.getParentFolderId() != null) {
            parent = folderRepository.findById(request.getParentFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dossier parent non trouvé"));
            if (!parent.getOwner().getId().equals(user.getId())) {
                throw new BadRequestException("Vous n'êtes pas propriétaire du dossier parent");
            }
        } else {
            parent = getOrCreateRootFolder(user);
        }

        Folder folder = new Folder(request.getName(), parent, user);
        folder = folderRepository.save(folder);
        return new FolderResponseDto(folder);
    }

    @Transactional
    public FolderResponseDto moveItemToFolder(UUID folderId, UUID itemId, User user) {
        Folder targetFolder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Dossier cible non trouvé"));
        
        if (!targetFolder.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("Vous n'êtes pas propriétaire du dossier cible");
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trouvé"));

        item.setFolder(targetFolder);
        itemRepository.save(item);

        return new FolderResponseDto(targetFolder);
    }
}
