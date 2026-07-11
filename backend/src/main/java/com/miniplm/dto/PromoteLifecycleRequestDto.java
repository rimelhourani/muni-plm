package com.miniplm.dto;

import com.miniplm.model.LifecycleState;
import jakarta.validation.constraints.NotNull;

public class PromoteLifecycleRequestDto {
    @NotNull(message = "Le nouvel état de cycle de vie est requis")
    private LifecycleState newState;

    private String comment;

    public PromoteLifecycleRequestDto() {
    }

    public LifecycleState getNewState() {
        return newState;
    }

    public void setNewState(LifecycleState newState) {
        this.newState = newState;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
