package com.miniplm.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "bom_lines")
public class BomLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_revision_id")
    private ItemRevision parentRevision;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_revision_id")
    private ItemRevision childRevision;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "sequence_number")
    private Integer sequenceNumber;

    public BomLine() {
    }

    public BomLine(ItemRevision parentRevision, ItemRevision childRevision, Integer quantity, Integer sequenceNumber) {
        this.parentRevision = parentRevision;
        this.childRevision = childRevision;
        this.quantity = quantity;
        this.sequenceNumber = sequenceNumber;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ItemRevision getParentRevision() {
        return parentRevision;
    }

    public void setParentRevision(ItemRevision parentRevision) {
        this.parentRevision = parentRevision;
    }

    public ItemRevision getChildRevision() {
        return childRevision;
    }

    public void setChildRevision(ItemRevision childRevision) {
        this.childRevision = childRevision;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Integer sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }
}
