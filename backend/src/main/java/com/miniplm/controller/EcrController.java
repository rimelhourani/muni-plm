package com.miniplm.controller;

import com.miniplm.dto.ChangeRequestResponseDto;
import com.miniplm.dto.CreateChangeRequestDto;
import com.miniplm.model.ChangeRequestStatus;
import com.miniplm.model.User;
import com.miniplm.service.AuthService;
import com.miniplm.service.EcrService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/change-requests")
public class EcrController {

    private final EcrService ecrService;
    private final AuthService authService;

    public EcrController(EcrService ecrService, AuthService authService) {
        this.ecrService = ecrService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<ChangeRequestResponseDto>> getAll() {
        return ResponseEntity.ok(ecrService.getAllEcrs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChangeRequestResponseDto> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(ecrService.getEcr(id));
    }

    @PostMapping
    public ResponseEntity<ChangeRequestResponseDto> create(@Valid @RequestBody CreateChangeRequestDto request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ecrService.createEcr(request, user));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ChangeRequestResponseDto> updateStatus(@PathVariable UUID id, @RequestParam ChangeRequestStatus status) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ecrService.updateEcrStatus(id, status, user));
    }
}
