package com.miniplm.dto;

import com.miniplm.model.BomLine;
import java.util.UUID;

public class BomLineResponseDto {
    private UUID id;
    private UUID parentRevisionId;
    private ItemRevisionResponseDto childRevision;
    private Integer quantity;
    private Integer sequenceNumber;

    public BomLineResponseDto() {
    }

    public BomLineResponseDto(BomLine line) {
        this.id = line.getId();
        this.parentRevisionId = line.getParentRevision().getId();
        this.childRevision = new ItemRevisionResponseDto(line.getChildRevision());
        this.quantity = line.getQuantity();
        this.sequenceNumber = line.getSequenceNumber();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getParentRevisionId() {
        return parentRevisionId;
    }

    public void setParentRevisionId(UUID parentRevisionId) {
        this.parentRevisionId = parentRevisionId;
    }

    public ItemRevisionResponseDto getChildRevision() {
        return childRevision;
    }

    public void setChildRevision(ItemRevisionResponseDto childRevision) {
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
