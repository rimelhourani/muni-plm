package com.miniplm.dto;

import com.miniplm.model.DocumentFile;
import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentResponseDto {
    private UUID id;
    private String fileName;
    private String filePath;
    private String contentType;
    private Long fileSize;
    private Integer version;
    private LocalDateTime uploadDate;

    public DocumentResponseDto() {
    }

    public DocumentResponseDto(DocumentFile doc) {
        this.id = doc.getId();
        this.fileName = doc.getFileName();
        this.filePath = doc.getFilePath();
        this.contentType = doc.getContentType();
        this.fileSize = doc.getFileSize();
        this.version = doc.getVersion();
        this.uploadDate = doc.getUploadDate();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
}
