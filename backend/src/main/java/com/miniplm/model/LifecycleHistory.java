package com.miniplm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lifecycle_history")
public class LifecycleHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_revision_id")
    private ItemRevision itemRevision;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_state")
    private LifecycleState previousState;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_state")
    private LifecycleState newState;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by_id")
    private User changedBy;

    @Column(name = "change_date", nullable = false)
    private LocalDateTime changeDate;

    @Column(length = 500)
    private String comment;

    public LifecycleHistory() {
    }

    public LifecycleHistory(ItemRevision itemRevision, LifecycleState previousState, LifecycleState newState, User changedBy, String comment) {
        this.itemRevision = itemRevision;
        this.previousState = previousState;
        this.newState = newState;
        this.changedBy = changedBy;
        this.comment = comment;
        this.changeDate = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ItemRevision getItemRevision() {
        return itemRevision;
    }

    public void setItemRevision(ItemRevision itemRevision) {
        this.itemRevision = itemRevision;
    }

    public LifecycleState getPreviousState() {
        return previousState;
    }

    public void setPreviousState(LifecycleState previousState) {
        this.previousState = previousState;
    }

    public LifecycleState getNewState() {
        return newState;
    }

    public void setNewState(LifecycleState newState) {
        this.newState = newState;
    }

    public User getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(User changedBy) {
        this.changedBy = changedBy;
    }

    public LocalDateTime getChangeDate() {
        return changeDate;
    }

    public void setChangeDate(LocalDateTime changeDate) {
        this.changeDate = changeDate;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
