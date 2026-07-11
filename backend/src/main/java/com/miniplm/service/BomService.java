package com.miniplm.service;

import com.miniplm.dto.AddBomLineRequestDto;
import com.miniplm.dto.BomLineResponseDto;
import com.miniplm.dto.ItemRevisionResponseDto;
import com.miniplm.exception.BadRequestException;
import com.miniplm.exception.ResourceNotFoundException;
import com.miniplm.model.BomLine;
import com.miniplm.model.ItemRevision;
import com.miniplm.model.ItemType;
import com.miniplm.model.User;
import com.miniplm.repository.BomLineRepository;
import com.miniplm.repository.ItemRevisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BomService {

    private final BomLineRepository bomLineRepository;
    private final ItemRevisionRepository itemRevisionRepository;
    private final ItemService itemService;

    public BomService(BomLineRepository bomLineRepository, ItemRevisionRepository itemRevisionRepository, ItemService itemService) {
        this.bomLineRepository = bomLineRepository;
        this.itemRevisionRepository = itemRevisionRepository;
        this.itemService = itemService;
    }

    @Transactional(readOnly = true)
    public List<BomLineResponseDto> getBomLines(UUID parentRevisionId) {
        return bomLineRepository.findByParentRevision_IdOrderBySequenceNumberAsc(parentRevisionId).stream()
                .map(BomLineResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public BomLineResponseDto addBomLine(UUID parentRevisionId, AddBomLineRequestDto request, User user) {
        if (parentRevisionId.equals(request.getChildRevisionId())) {
            throw new BadRequestException("Un composant ne peut pas être son propre enfant (anti-cycle direct)");
        }

        ItemRevision parent = itemRevisionRepository.findById(parentRevisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Révision parent non trouvée"));

        ItemRevision child = itemRevisionRepository.findById(request.getChildRevisionId())
                .orElseThrow(() -> new ResourceNotFoundException("Révision enfant non trouvée"));

        // Validation: Parent must be an ASSEMBLY
        if (parent.getItem().getType() != ItemType.ASSEMBLY) {
            throw new BadRequestException("Seuls les items de type ASSEMBLAGE peuvent contenir d'autres composants");
        }

        // Validation Checkout sur le parent (seul le parent est modifié en ajoutant un enfant)
        itemService.validateModificationAccess(parent, user);

        // Validation anti-cycle récursive
        if (isAncestor(child.getId(), parent.getId())) {
            throw new BadRequestException("Ajout refusé : ce composant (" + child.getItem().getItemId() + ") est déjà un ancêtre de cet assemblage (" + parent.getItem().getItemId() + "). Cela créerait une boucle infinie.");
        }

        // Check duplicate child in parent BOM
        List<BomLine> duplicates = bomLineRepository.findByParentRevision_IdAndChildRevision_Id(parent.getId(), child.getId());
        if (!duplicates.isEmpty()) {
            throw new BadRequestException("Ce composant existe déjà dans la nomenclature");
        }

        int seqNum = request.getSequenceNumber() != null ? request.getSequenceNumber() : 
                     (bomLineRepository.findByParentRevision_IdOrderBySequenceNumberAsc(parent.getId()).size() + 1) * 10;

        BomLine line = new BomLine(parent, child, request.getQuantity(), seqNum);
        line = bomLineRepository.save(line);

        return new BomLineResponseDto(line);
    }

    @Transactional
    public void deleteBomLine(UUID parentRevisionId, UUID bomLineId, User user) {
        ItemRevision parent = itemRevisionRepository.findById(parentRevisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Révision parent non trouvée"));

        // Validation Checkout
        itemService.validateModificationAccess(parent, user);

        BomLine line = bomLineRepository.findById(bomLineId)
                .orElseThrow(() -> new ResourceNotFoundException("Ligne de nomenclature non trouvée"));

        if (!line.getParentRevision().getId().equals(parent.getId())) {
            throw new BadRequestException("La ligne de nomenclature n'appartient pas à l'assemblage parent spécifié");
        }

        bomLineRepository.delete(line);
    }

    @Transactional(readOnly = true)
    public List<ItemRevisionResponseDto> getWhereUsed(UUID childRevisionId) {
        List<BomLine> lines = bomLineRepository.findByChildRevision_Id(childRevisionId);
        return lines.stream()
                .map(line -> new ItemRevisionResponseDto(line.getParentRevision()))
                .collect(Collectors.toList());
    }

    /**
     * Méthode récursive pour vérifier si une révision est un ancêtre d'une autre révision.
     */
    public boolean isAncestor(UUID potentialAncestorId, UUID currentId) {
        if (potentialAncestorId.equals(currentId)) {
            return true;
        }
        List<BomLine> parentRelations = bomLineRepository.findByChildRevision_Id(currentId);
        for (BomLine line : parentRelations) {
            if (isAncestor(potentialAncestorId, line.getParentRevision().getId())) {
                return true;
            }
        }
        return false;
    }
}
