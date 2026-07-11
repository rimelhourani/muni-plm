package com.miniplm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AddBomLineRequestDto {
    @NotNull(message = "L'identifiant du composant enfant est requis")
    private UUID childRevisionId;

    @NotNull(message = "La quantité est requise")
    @Min(value = 1, message = "La quantité doit être supérieure ou égale à 1")
    private Integer quantity;

    private Integer sequenceNumber;

    public AddBomLineRequestDto() {
    }

    public UUID getChildRevisionId() {
        return childRevisionId;
    }

    public void setChildRevisionId(UUID childRevisionId) {
        this.childRevisionId = childRevisionId;
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
