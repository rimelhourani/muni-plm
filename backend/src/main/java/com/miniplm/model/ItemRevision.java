package com.miniplm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "item_revisions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"item_id", "revision_id"})
})
public class ItemRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(name = "revision_id", nullable = false)
    private String revisionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "lifecycle_state", nullable = false)
    private LifecycleState lifecycleState;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_out_by_id")
    private User checkedOutBy;

    @Column(name = "checked_out_date")
    private LocalDateTime checkedOutDate;

    @OneToMany(mappedBy = "parentRevision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BomLine> bomLines = new ArrayList<>();

    @OneToMany(mappedBy = "itemRevision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentFile> documents = new ArrayList<>();

    @OneToMany(mappedBy = "itemRevision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LifecycleHistory> history = new ArrayList<>();

    public ItemRevision() {
    }

    public ItemRevision(Item item, String revisionId, LifecycleState lifecycleState, User createdBy) {
        this.item = item;
        this.revisionId = revisionId;
        this.lifecycleState = lifecycleState;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public String getRevisionId() {
        return revisionId;
    }

    public void setRevisionId(String revisionId) {
        this.revisionId = revisionId;
    }

    public LifecycleState getLifecycleState() {
        return lifecycleState;
    }

    public void setLifecycleState(LifecycleState lifecycleState) {
        this.lifecycleState = lifecycleState;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getCheckedOutBy() {
        return checkedOutBy;
    }

    public void setCheckedOutBy(User checkedOutBy) {
        this.checkedOutBy = checkedOutBy;
    }

    public LocalDateTime getCheckedOutDate() {
        return checkedOutDate;
    }

    public void setCheckedOutDate(LocalDateTime checkedOutDate) {
        this.checkedOutDate = checkedOutDate;
    }

    public List<BomLine> getBomLines() {
        return bomLines;
    }

    public void setBomLines(List<BomLine> bomLines) {
        this.bomLines = bomLines;
    }

    public List<DocumentFile> getDocuments() {
        return documents;
    }

    public void setDocuments(List<DocumentFile> documents) {
        this.documents = documents;
    }

    public List<LifecycleHistory> getHistory() {
        return history;
    }

    public void setHistory(List<LifecycleHistory> history) {
        this.history = history;
    }
}
