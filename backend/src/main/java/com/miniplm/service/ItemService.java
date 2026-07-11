package com.miniplm.service;

import com.miniplm.dto.*;
import com.miniplm.exception.BadRequestException;
import com.miniplm.exception.ResourceNotFoundException;
import com.miniplm.model.*;
import com.miniplm.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemRevisionRepository itemRevisionRepository;
    private final FolderRepository folderRepository;
    private final LifecycleHistoryRepository lifecycleHistoryRepository;
    private final DocumentFileRepository documentFileRepository;
    private final FolderService folderService;
    private final BomLineRepository bomLineRepository;

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public ItemService(ItemRepository itemRepository, ItemRevisionRepository itemRevisionRepository,
                       FolderRepository folderRepository, LifecycleHistoryRepository lifecycleHistoryRepository,
                       DocumentFileRepository documentFileRepository, FolderService folderService,
                       BomLineRepository bomLineRepository) {
        this.itemRepository = itemRepository;
        this.itemRevisionRepository = itemRevisionRepository;
        this.folderRepository = folderRepository;
        this.lifecycleHistoryRepository = lifecycleHistoryRepository;
        this.documentFileRepository = documentFileRepository;
        this.folderService = folderService;
        this.bomLineRepository = bomLineRepository;

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de créer le dossier d'upload", ex);
        }
    }

    @Transactional
    public ItemResponseDto createItem(CreateItemRequestDto request, User user) {
        Folder folder;
        if (request.getFolderId() != null) {
            folder = folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dossier d'accueil non trouvé"));
        } else {
            folder = folderService.getOrCreateRootFolder(user);
        }

        String businessId = request.getItemId();
        if (businessId == null || businessId.trim().isEmpty()) {
            long count = itemRepository.count();
            String prefix = switch (request.getType()) {
                case PART -> "PRT-";
                case ASSEMBLY -> "ASM-";
                case DOCUMENT -> "DOC-";
            };
            businessId = prefix + String.format("%06d", count + 1);
        }

        if (itemRepository.existsByItemId(businessId)) {
            throw new BadRequestException("L'identifiant unique métier '" + businessId + "' existe déjà");
        }

        Item item = new Item(businessId, request.getName(), request.getDescription(), request.getType(), user, folder);
        item = itemRepository.save(item);

        // Auto-create initial revision A
        ItemRevision revision = new ItemRevision(item, "A", LifecycleState.WORKING, user);
        revision = itemRevisionRepository.save(revision);

        item.getRevisions().add(revision);

        // Record history
        LifecycleHistory history = new LifecycleHistory(revision, null, LifecycleState.WORKING, user, "Initialisation de l'item");
        lifecycleHistoryRepository.save(history);

        return new ItemResponseDto(item);
    }

    @Transactional(readOnly = true)
    public ItemResponseDto getItem(UUID id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trouvé"));
        return new ItemResponseDto(item);
    }

    @Transactional(readOnly = true)
    public List<ItemResponseDto> searchItems(String query) {
        List<Item> items;
        if (query == null || query.trim().isEmpty()) {
            items = itemRepository.findAll();
        } else {
            items = itemRepository.findByNameContainingIgnoreCaseOrItemIdContainingIgnoreCase(query, query);
        }
        return items.stream().map(ItemResponseDto::new).collect(Collectors.toList());
    }

    @Transactional
    public ItemRevisionResponseDto createNewRevision(UUID itemId, CreateRevisionRequestDto request, User user) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trouvé"));

        // Get latest revision to check if it's released
        List<ItemRevision> revisions = itemRevisionRepository.findByItem_Id(itemId);
        if (revisions.isEmpty()) {
            throw new BadRequestException("Aucune révision existante trouvée pour cet item");
        }

        // Get latest revision (based on creation date or simple alphanumeric sorting)
        ItemRevision latestRevision = revisions.get(revisions.size() - 1);

        if (latestRevision.getLifecycleState() != LifecycleState.RELEASED) {
            throw new BadRequestException("Impossible de réviser un item dont la dernière version n'est pas Libérée (RELEASED)");
        }

        // Check if revisionId already exists
        boolean revisionExists = revisions.stream()
                .anyMatch(r -> r.getRevisionId().equalsIgnoreCase(request.getRevisionId()));
        if (revisionExists) {
            throw new BadRequestException("La révision '" + request.getRevisionId() + "' existe déjà");
        }

        ItemRevision newRevision = new ItemRevision(item, request.getRevisionId(), LifecycleState.WORKING, user);
        newRevision = itemRevisionRepository.save(newRevision);

        // Pedigree copy of BOM (deep copy of direct children from the old assembly revision)
        if (item.getType() == ItemType.ASSEMBLY) {
            List<BomLine> oldBomLines = bomLineRepository.findByParentRevision_IdOrderBySequenceNumberAsc(latestRevision.getId());
            for (BomLine line : oldBomLines) {
                BomLine newLine = new BomLine(newRevision, line.getChildRevision(), line.getQuantity(), line.getSequenceNumber());
                bomLineRepository.save(newLine);
            }
        }

        // Record history
        LifecycleHistory history = new LifecycleHistory(newRevision, null, LifecycleState.WORKING, user, "Création de la révision " + request.getRevisionId() + " depuis la révision " + latestRevision.getRevisionId());
        lifecycleHistoryRepository.save(history);

        return new ItemRevisionResponseDto(newRevision);
    }

    @Transactional(readOnly = true)
    public ItemRevisionResponseDto getRevision(UUID id) {
        ItemRevision revision = itemRevisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Révision non trouvée"));
        return new ItemRevisionResponseDto(revision);
    }

    @Transactional
    public ItemRevisionResponseDto updateRevision(UUID id, UpdateRevisionRequestDto request, User user) {
        ItemRevision revision = itemRevisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Révision non trouvée"));

        // Validation Checkout
        validateModificationAccess(revision, user);

        // Update master item metadata (Item name and description are modified)
        Item item = revision.getItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        itemRepository.save(item);

        return new ItemRevisionResponseDto(revision);
    }

    @Transactional
    public ItemRevisionResponseDto checkoutRevision(UUID id, User user) {
        ItemRevision revision = itemRevisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Révision non trouvée"));

        if (revision.getCheckedOutBy() != null) {
            throw new BadRequestException("Cette révision est déjà verrouillée (checkout) par " + revision.getCheckedOutBy().getUsername());
        }

        if (revision.getLifecycleState() == LifecycleState.RELEASED || revision.getLifecycleState() == LifecycleState.OBSOLETE) {
            throw new BadRequestException("Impossible de modifier ou verrouiller une révision dans l'état " + revision.getLifecycleState());
        }

        revision.setCheckedOutBy(user);
        revision.setCheckedOutDate(LocalDateTime.now());
        revision = itemRevisionRepository.save(revision);

        LifecycleHistory history = new LifecycleHistory(revision, revision.getLifecycleState(), revision.getLifecycleState(), user, "Checkout - Verrouillage par l'utilisateur");
        lifecycleHistoryRepository.save(history);

        return new ItemRevisionResponseDto(revision);
    }

    @Transactional
    public ItemRevisionResponseDto checkinRevision(UUID id, User user) {
        ItemRevision revision = itemRevisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Révision non trouvée"));

        if (revision.getCheckedOutBy() == null) {
            throw new BadRequestException("Cette révision n'est pas verrouillée");
        }

        if (!revision.getCheckedOutBy().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Seul l'utilisateur possédant le verrou (" + revision.getCheckedOutBy().getUsername() + ") ou un Administrateur peut faire le checkin");
        }

        revision.setCheckedOutBy(null);
        revision.setCheckedOutDate(null);
        revision = itemRevisionRepository.save(revision);

        LifecycleHistory history = new LifecycleHistory(revision, revision.getLifecycleState(), revision.getLifecycleState(), user, "Checkin - Enregistrement et déverrouillage");
        lifecycleHistoryRepository.save(history);

        return new ItemRevisionResponseDto(revision);
    }

    @Transactional
    public ItemRevisionResponseDto cancelCheckoutRevision(UUID id, User user) {
        ItemRevision revision = itemRevisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Révision non trouvée"));

        if (revision.getCheckedOutBy() == null) {
            throw new BadRequestException("Cette révision n'est pas verrouillée");
        }

        if (!revision.getCheckedOutBy().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Seul l'utilisateur possédant le verrou ou un Administrateur peut annuler le checkout");
        }

        revision.setCheckedOutBy(null);
        revision.setCheckedOutDate(null);
        revision = itemRevisionRepository.save(revision);

        LifecycleHistory history = new LifecycleHistory(revision, revision.getLifecycleState(), revision.getLifecycleState(), user, "Checkout annulé");
        lifecycleHistoryRepository.save(history);

        return new ItemRevisionResponseDto(revision);
    }

    @Transactional
    public ItemRevisionResponseDto promoteLifecycle(UUID id, PromoteLifecycleRequestDto request, User user) {
        ItemRevision revision = itemRevisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Révision non trouvée"));

        if (revision.getCheckedOutBy() != null) {
            throw new BadRequestException("Impossible de changer le statut d'une révision verrouillée (checked out). Faites d'abord un checkin.");
        }

        LifecycleState currentState = revision.getLifecycleState();
        LifecycleState targetState = request.getNewState();

        if (currentState == targetState) {
            throw new BadRequestException("La révision est déjà dans l'état " + targetState);
        }

        // --- Machine à états explicite ---
        // OBSOLETE est un état terminal : aucune transition possible depuis cet état
        if (currentState == LifecycleState.OBSOLETE) {
            throw new BadRequestException(
                "La révision est dans l'état OBSOLETE (état terminal). Aucune modification n'est possible. " +
                "Créez une nouvelle révision si vous souhaitez reprendre le travail.");
        }

        // RELEASED → seul OBSOLETE est autorisé (pas de retour en arrière)
        if (currentState == LifecycleState.RELEASED) {
            if (targetState != LifecycleState.OBSOLETE) {
                throw new BadRequestException(
                    "Une révision LIBÉRÉE (RELEASED) ne peut pas revenir à l'état " + targetState + ". " +
                    "Créez une nouvelle révision (ex: B, 02) pour reprendre les modifications.");
            }
            // RELEASED → OBSOLETE : OK, pas de restriction de rôle particulière
        }
        // WORKING → seul UNDER_REVIEW est autorisé (pas de saut vers RELEASED)
        else if (currentState == LifecycleState.WORKING) {
            if (targetState != LifecycleState.UNDER_REVIEW) {
                throw new BadRequestException(
                    "Transition de cycle de vie impossible : " + currentState + " → " + targetState + ". " +
                    "Depuis WORKING, seul UNDER_REVIEW est autorisé.");
            }
            // WORKING → UNDER_REVIEW : OK, tout rôle
        }
        // UNDER_REVIEW → RELEASED (approbation) ou WORKING (rejet/renvoi en WIP)
        else if (currentState == LifecycleState.UNDER_REVIEW) {
            if (targetState != LifecycleState.RELEASED && targetState != LifecycleState.WORKING) {
                throw new BadRequestException(
                    "Transition de cycle de vie impossible : " + currentState + " → " + targetState + ". " +
                    "Depuis UNDER_REVIEW, seuls RELEASED (approbation) ou WORKING (rejet) sont autorisés.");
            }
            // Seul APPROVER ou ADMIN peut décider
            if (user.getRole() != Role.APPROVER && user.getRole() != Role.ADMIN) {
                throw new BadRequestException(
                    "Seul un APPROBATEUR (ou Administrateur) peut faire la transition UNDER_REVIEW → " + targetState + ". " +
                    "Votre rôle actuel : " + user.getRole());
            }
        }

        revision.setLifecycleState(targetState);
        revision = itemRevisionRepository.save(revision);

        String logComment = (request.getComment() != null && !request.getComment().trim().isEmpty())
            ? request.getComment()
            : "Transition de cycle de vie : " + currentState + " → " + targetState;
        LifecycleHistory history = new LifecycleHistory(revision, currentState, targetState, user, logComment);
        lifecycleHistoryRepository.save(history);

        return new ItemRevisionResponseDto(revision);
    }

    @Transactional(readOnly = true)
    public List<LifecycleHistoryResponseDto> getHistory(UUID id) {
        return lifecycleHistoryRepository.findByItemRevision_IdOrderByChangeDateDesc(id).stream()
                .map(LifecycleHistoryResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponseDto> getDocuments(UUID id) {
        return documentFileRepository.findByItemRevision_IdOrderByUploadDateDesc(id).stream()
                .map(DocumentResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponseDto attachDocument(UUID revisionId, MultipartFile file, User user) {
        ItemRevision revision = itemRevisionRepository.findById(revisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Révision non trouvée"));

        // Validation Checkout
        validateModificationAccess(revision, user);

        try {
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null) {
                originalFileName = "unnamed_file";
            }
            String extension = "";
            int i = originalFileName.lastIndexOf('.');
            if (i > 0) {
                extension = originalFileName.substring(i);
            }

            // Create a unique file name on storage disk
            String storedFileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Version number of files
            List<DocumentFile> existingDocs = documentFileRepository.findByItemRevision_IdOrderByUploadDateDesc(revisionId);
            int newVersion = 1;
            if (!existingDocs.isEmpty()) {
                newVersion = existingDocs.get(0).getVersion() + 1;
            }

            DocumentFile documentFile = new DocumentFile(
                    revision,
                    originalFileName,
                    targetLocation.toString(),
                    file.getContentType(),
                    file.getSize(),
                    newVersion
            );

            documentFile = documentFileRepository.save(documentFile);
            return new DocumentResponseDto(documentFile);

        } catch (IOException ex) {
            throw new BadRequestException("Une erreur est survenue lors de l'enregistrement du fichier: " + ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Path loadDocumentFile(UUID documentId) {
        DocumentFile doc = documentFileRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document non trouvé"));
        return Paths.get(doc.getFilePath());
    }

    public void validateModificationAccess(ItemRevision revision, User user) {
        if (revision.getLifecycleState() == LifecycleState.RELEASED || revision.getLifecycleState() == LifecycleState.OBSOLETE) {
            throw new BadRequestException("Impossible de modifier une révision libérée ou obsolète");
        }
        if (revision.getCheckedOutBy() == null) {
            throw new BadRequestException("Vous devez verrouiller (checkout) cet item avant de pouvoir le modifier");
        }
        if (!revision.getCheckedOutBy().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Cet item est verrouillé par un autre utilisateur : " + revision.getCheckedOutBy().getUsername());
        }
    }
}
