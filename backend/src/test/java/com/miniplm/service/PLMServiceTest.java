package com.miniplm.service;

import com.miniplm.dto.AddBomLineRequestDto;
import com.miniplm.exception.BadRequestException;
import com.miniplm.model.*;
import com.miniplm.repository.BomLineRepository;
import com.miniplm.repository.ItemRevisionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PLMServiceTest {

    @Mock
    private BomLineRepository bomLineRepository;

    @Mock
    private ItemRevisionRepository itemRevisionRepository;

    @Mock
    private ItemService itemService;

    @InjectMocks
    private BomService bomService;

    private User engineer;
    private ItemRevision revisionA;
    private ItemRevision revisionB;
    private ItemRevision revisionC;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        engineer = new User("engineer", "pass", "eng@plm.com", Role.ENGINEER);
        engineer.setId(UUID.randomUUID());

        // Create Item A (Assembly)
        Item itemA = new Item("ASM-000001", "Assembly A", "Root", ItemType.ASSEMBLY, engineer, null);
        itemA.setId(UUID.randomUUID());
        revisionA = new ItemRevision(itemA, "A", LifecycleState.WORKING, engineer);
        revisionA.setId(UUID.randomUUID());

        // Create Item B (Assembly)
        Item itemB = new Item("ASM-000002", "Assembly B", "Mid", ItemType.ASSEMBLY, engineer, null);
        itemB.setId(UUID.randomUUID());
        revisionB = new ItemRevision(itemB, "A", LifecycleState.WORKING, engineer);
        revisionB.setId(UUID.randomUUID());

        // Create Item C (Part)
        Item itemC = new Item("PRT-000003", "Part C", "Leaf", ItemType.PART, engineer, null);
        itemC.setId(UUID.randomUUID());
        revisionC = new ItemRevision(itemC, "A", LifecycleState.WORKING, engineer);
        revisionC.setId(UUID.randomUUID());
    }

    @Test
    public void testItemTypeRestriction() {
        // Trying to add components to a PART (revisionC) should fail
        AddBomLineRequestDto request = new AddBomLineRequestDto();
        request.setChildRevisionId(revisionA.getId());
        request.setQuantity(2);

        when(itemRevisionRepository.findById(revisionC.getId())).thenReturn(Optional.of(revisionC));
        when(itemRevisionRepository.findById(revisionA.getId())).thenReturn(Optional.of(revisionA));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            bomService.addBomLine(revisionC.getId(), request, engineer);
        });

        assertTrue(exception.getMessage().contains("Seuls les items de type ASSEMBLAGE peuvent contenir d'autres composants"));
    }

    @Test
    public void testAddBomLineCycleDetection() {
        // Scenario: A contains B, B contains C.
        // We mock the database relationships:
        // - Parent of C is B (BomLine: parent=B, child=C)
        // - Parent of B is A (BomLine: parent=A, child=B)
        // Attempting to add A as child of C: parent=C, child=A -> Should trigger cycle.

        BomLine lineBC = new BomLine(revisionB, revisionC, 1, 10);
        BomLine lineAB = new BomLine(revisionA, revisionB, 1, 10);

        // When finding parents for revisionC -> returns B
        when(bomLineRepository.findByChildRevision_Id(revisionC.getId())).thenReturn(List.of(lineBC));
        // When finding parents for revisionB -> returns A
        when(bomLineRepository.findByChildRevision_Id(revisionB.getId())).thenReturn(List.of(lineAB));
        // When finding parents for revisionA -> returns empty
        when(bomLineRepository.findByChildRevision_Id(revisionA.getId())).thenReturn(new ArrayList<>());

        when(itemRevisionRepository.findById(revisionC.getId())).thenReturn(Optional.of(revisionC));
        when(itemRevisionRepository.findById(revisionA.getId())).thenReturn(Optional.of(revisionA));

        // Mock revisionC to act as an assembly for this test just to test isAncestor recursion
        revisionC.getItem().setType(ItemType.ASSEMBLY);

        // Assert isAncestor logic directly
        assertTrue(bomService.isAncestor(revisionA.getId(), revisionC.getId()), "A should be recognized as ancestor of C");
        assertTrue(bomService.isAncestor(revisionB.getId(), revisionC.getId()), "B should be recognized as ancestor of C");
        assertFalse(bomService.isAncestor(revisionC.getId(), revisionA.getId()), "C should NOT be recognized as ancestor of A");

        // Attempting to add A as child of C
        AddBomLineRequestDto request = new AddBomLineRequestDto();
        request.setChildRevisionId(revisionA.getId());
        request.setQuantity(1);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            bomService.addBomLine(revisionC.getId(), request, engineer);
        });

        assertTrue(exception.getMessage().contains("est déjà un ancêtre de cet assemblage"), "Should report cycle detection failure");
    }
}
