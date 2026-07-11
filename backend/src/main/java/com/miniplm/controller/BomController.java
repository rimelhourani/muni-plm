package com.miniplm.controller;

import com.miniplm.dto.AddBomLineRequestDto;
import com.miniplm.dto.BomLineResponseDto;
import com.miniplm.dto.ItemRevisionResponseDto;
import com.miniplm.model.User;
import com.miniplm.service.AuthService;
import com.miniplm.service.BomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/revisions/{revisionId}")
public class BomController {

    private final BomService bomService;
    private final AuthService authService;

    public BomController(BomService bomService, AuthService authService) {
        this.bomService = bomService;
        this.authService = authService;
    }

    @GetMapping("/bom")
    public ResponseEntity<List<BomLineResponseDto>> getBom(@PathVariable UUID revisionId) {
        return ResponseEntity.ok(bomService.getBomLines(revisionId));
    }

    @PostMapping("/bom")
    public ResponseEntity<BomLineResponseDto> addBomComponent(@PathVariable UUID revisionId, @Valid @RequestBody AddBomLineRequestDto request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(bomService.addBomLine(revisionId, request, user));
    }

    @DeleteMapping("/bom/{bomLineId}")
    public ResponseEntity<Void> removeBomComponent(@PathVariable UUID revisionId, @PathVariable UUID bomLineId) {
        User user = authService.getCurrentUser();
        bomService.deleteBomLine(revisionId, bomLineId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/where-used")
    public ResponseEntity<List<ItemRevisionResponseDto>> getWhereUsed(@PathVariable UUID revisionId) {
        return ResponseEntity.ok(bomService.getWhereUsed(revisionId));
    }
}
