package com.miniplm.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CreateChangeRequestDto {
    @NotBlank(message = "Le titre de la demande de changement est requis")
    private String title;

    private String description;

    private List<UUID> impactedRevisionIds = new ArrayList<>();

    public CreateChangeRequestDto() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<UUID> getImpactedRevisionIds() {
        return impactedRevisionIds;
    }

    public void setImpactedRevisionIds(List<UUID> impactedRevisionIds) {
        this.impactedRevisionIds = impactedRevisionIds;
    }
}
