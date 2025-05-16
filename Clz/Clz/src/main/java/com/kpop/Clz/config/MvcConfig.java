package com.kpop.Clz.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class MvcConfig implements WebMvcConfigurer {
    @Value("${file.upload-dir:./gallery_uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPathObject = Paths.get(uploadDir);
        String absoluteUploadPath = uploadPathObject.toFile().getAbsolutePath();

        System.out.println("Serving static resources from: " + "file:/" + absoluteUploadPath + "/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absoluteUploadPath + "/");
    }
}