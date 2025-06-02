package com.kpop.Clz.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể tạo thư mục để lưu trữ file tải lên. Đường dẫn: " + this.fileStorageLocation.toString(), ex);
        }
    }

    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";

        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new RuntimeException("Tên file gốc không hợp lệ hoặc rỗng.");
        }

        if (originalFileName.contains("..")) {
            throw new RuntimeException("Tên file chứa chuỗi đường dẫn không hợp lệ: " + originalFileName);
        }

        if (originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        if (extension.length() > 10) {
            extension = extension.substring(0, Math.min(extension.length(), 10));
        }


        String fileName = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            String baseUrl = "http://localhost:8080";
            return baseUrl + "/uploads/" + fileName;

        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu trữ file " + originalFileName + " (đã đổi tên thành " + fileName + "). Vui lòng thử lại!", ex);
        }
    }
}