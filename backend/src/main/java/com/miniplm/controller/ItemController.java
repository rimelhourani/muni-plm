package com.miniplm.controller;

import com.miniplm.dto.*;
import com.miniplm.exception.BadRequestException;
import com.miniplm.model.User;
import com.miniplm.service.AuthService;
import com.miniplm.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ItemController {

    private final ItemService itemService;
    private final AuthService authService;

    public ItemController(ItemService itemService, AuthService authService) {
        this.itemService = itemService;
        this.authService = authService;
    }

    // --- Items ---

    @GetMapping("/items")
    public ResponseEntity<List<ItemResponseDto>> searchItems(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(itemService.searchItems(query));
    }

    @PostMapping("/items")
    public ResponseEntity<ItemResponseDto> createItem(@Valid @RequestBody CreateItemRequestDto request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.createItem(request, user));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<ItemResponseDto> getItem(@PathVariable UUID id) {
        return ResponseEntity.ok(itemService.getItem(id));
    }

    @PostMapping("/items/{id}/revisions")
    public ResponseEntity<ItemRevisionResponseDto> createRevision(@PathVariable UUID id, @Valid @RequestBody CreateRevisionRequestDto request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.createNewRevision(id, request, user));
    }

    // --- Revisions ---

    @GetMapping("/revisions/{id}")
    public ResponseEntity<ItemRevisionResponseDto> getRevision(@PathVariable UUID id) {
        return ResponseEntity.ok(itemService.getRevision(id));
    }

    @PutMapping("/revisions/{id}")
    public ResponseEntity<ItemRevisionResponseDto> updateRevision(@PathVariable UUID id, @Valid @RequestBody UpdateRevisionRequestDto request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.updateRevision(id, request, user));
    }

    @PostMapping("/revisions/{id}/checkout")
    public ResponseEntity<ItemRevisionResponseDto> checkout(@PathVariable UUID id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.checkoutRevision(id, user));
    }

    @PostMapping("/revisions/{id}/checkin")
    public ResponseEntity<ItemRevisionResponseDto> checkin(@PathVariable UUID id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.checkinRevision(id, user));
    }

    @PostMapping("/revisions/{id}/cancel-checkout")
    public ResponseEntity<ItemRevisionResponseDto> cancelCheckout(@PathVariable UUID id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.cancelCheckoutRevision(id, user));
    }

    @PostMapping("/revisions/{id}/lifecycle")
    public ResponseEntity<ItemRevisionResponseDto> promoteLifecycle(@PathVariable UUID id, @Valid @RequestBody PromoteLifecycleRequestDto request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.promoteLifecycle(id, request, user));
    }

    @GetMapping("/revisions/{id}/history")
    public ResponseEntity<List<LifecycleHistoryResponseDto>> getHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(itemService.getHistory(id));
    }

    // --- Documents ---

    @GetMapping("/revisions/{id}/documents")
    public ResponseEntity<List<DocumentResponseDto>> getDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(itemService.getDocuments(id));
    }

    @PostMapping("/revisions/{id}/documents")
    public ResponseEntity<DocumentResponseDto> uploadDocument(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(itemService.attachDocument(id, file, user));
    }

    @GetMapping("/documents/{docId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID docId) {
        Path filePath = itemService.loadDocumentFile(docId);
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                String originalFileName = resource.getFilename();
                // strip UUID if possible, but standard is fine
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFileName + "\"")
                        .body(resource);
            } else {
                throw new BadRequestException("Impossible de lire le fichier");
            }
        } catch (MalformedURLException e) {
            throw new BadRequestException("Chemin du fichier invalide: " + e.getMessage());
        }
    }
}
