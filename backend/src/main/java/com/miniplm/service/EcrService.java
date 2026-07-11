package com.miniplm.service;

import com.miniplm.dto.ChangeRequestResponseDto;
import com.miniplm.dto.CreateChangeRequestDto;
import com.miniplm.exception.BadRequestException;
import com.miniplm.exception.ResourceNotFoundException;
import com.miniplm.model.ChangeRequest;
import com.miniplm.model.ChangeRequestStatus;
import com.miniplm.model.ItemRevision;
import com.miniplm.model.Role;
import com.miniplm.model.User;
import com.miniplm.repository.ChangeRequestRepository;
import com.miniplm.repository.ItemRevisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EcrService {

    private final ChangeRequestRepository changeRequestRepository;
    private final ItemRevisionRepository itemRevisionRepository;

    public EcrService(ChangeRequestRepository changeRequestRepository, ItemRevisionRepository itemRevisionRepository) {
        this.changeRequestRepository = changeRequestRepository;
        this.itemRevisionRepository = itemRevisionRepository;
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestResponseDto> getAllEcrs() {
        return changeRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ChangeRequestResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChangeRequestResponseDto getEcr(UUID id) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de changement (ECR) non trouvée"));
        return new ChangeRequestResponseDto(cr);
    }

    @Transactional
    public ChangeRequestResponseDto createEcr(CreateChangeRequestDto request, User user) {
        ChangeRequest cr = new ChangeRequest(request.getTitle(), request.getDescription(), ChangeRequestStatus.OPEN, user);

        if (request.getImpactedRevisionIds() != null && !request.getImpactedRevisionIds().isEmpty()) {
            List<ItemRevision> revisions = itemRevisionRepository.findAllById(request.getImpactedRevisionIds());
            cr.setImpactedRevisions(revisions);
        }

        cr = changeRequestRepository.save(cr);
        return new ChangeRequestResponseDto(cr);
    }

    @Transactional
    public ChangeRequestResponseDto updateEcrStatus(UUID id, ChangeRequestStatus targetStatus, User user) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de changement (ECR) non trouvée"));

        ChangeRequestStatus currentStatus = cr.getStatus();

        if (currentStatus == targetStatus) {
            throw new BadRequestException("L'ECR est déjà dans le statut " + targetStatus);
        }

        // Validate transitions and Roles
        // OPEN -> IN_PROGRESS (Engineers/Approver/Admin)
        // IN_PROGRESS -> APPROVED or REJECTED (Only APPROVER or ADMIN)
        // APPROVED/REJECTED -> CLOSED (Engineers/Approver/Admin)
        if (currentStatus == ChangeRequestStatus.OPEN && targetStatus == ChangeRequestStatus.IN_PROGRESS) {
            // OK
        } else if (currentStatus == ChangeRequestStatus.IN_PROGRESS && (targetStatus == ChangeRequestStatus.APPROVED || targetStatus == ChangeRequestStatus.REJECTED)) {
            if (user.getRole() != Role.APPROVER && user.getRole() != Role.ADMIN) {
                throw new BadRequestException("Seul un APPROBATEUR (ou Administrateur) peut Approuver ou Rejeter une demande de changement");
            }
        } else if ((currentStatus == ChangeRequestStatus.APPROVED || currentStatus == ChangeRequestStatus.REJECTED) && targetStatus == ChangeRequestStatus.CLOSED) {
            // OK
        } else {
            throw new BadRequestException("Transition de statut d'ECR impossible : " + currentStatus + " -> " + targetStatus);
        }

        cr.setStatus(targetStatus);
        cr = changeRequestRepository.save(cr);

        return new ChangeRequestResponseDto(cr);
    }
}
