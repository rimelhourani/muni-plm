package com.miniplm.controller;

import com.miniplm.dto.CreateFolderRequestDto;
import com.miniplm.dto.FolderResponseDto;
import com.miniplm.model.Folder;
import com.miniplm.model.User;
import com.miniplm.service.AuthService;
import com.miniplm.service.FolderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/folders")
public class FolderController {

    private final FolderService folderService;
    private final AuthService authService;

    public FolderController(FolderService folderService, AuthService authService) {
        this.folderService = folderService;
        this.authService = authService;
    }

    @GetMapping("/root")
    public ResponseEntity<FolderResponseDto> getRootFolder() {
        User user = authService.getCurrentUser();
        Folder folder = folderService.getOrCreateRootFolder(user);
        return ResponseEntity.ok(new FolderResponseDto(folder));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FolderResponseDto> getFolder(@PathVariable UUID id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(folderService.getFolder(id, user));
    }

    @PostMapping
    public ResponseEntity<FolderResponseDto> createFolder(@Valid @RequestBody CreateFolderRequestDto request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(folderService.createFolder(request, user));
    }

    @PostMapping("/{id}/items/{itemId}")
    public ResponseEntity<FolderResponseDto> moveItem(@PathVariable UUID id, @PathVariable UUID itemId) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(folderService.moveItemToFolder(id, itemId, user));
    }
}
