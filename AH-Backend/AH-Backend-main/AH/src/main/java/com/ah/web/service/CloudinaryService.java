package com.ah.web.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.ApiResponse;
import com.cloudinary.Transformation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CloudinaryService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder}")
    private String rootFolder; // still used ONLY for uploads

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /* ---------------------------------------------------
       UPLOAD (BACKEND-ONLY)
       --------------------------------------------------- */

    /**
     * Upload image with tags (category/product/etc.)
     */
    public String uploadImage(
            MultipartFile file,
            String folder,
            List<String> tags
    ) throws IOException {
        return uploadImage(file.getBytes(), folder, tags);
    }

    public String uploadImage(
            byte[] fileBytes,
            String folder,
            List<String> tags
    ) throws IOException {
        return uploadImageWithPublicId(fileBytes, folder, null, tags);
    }

    public String uploadImageWithPublicId(
            byte[] fileBytes,
            String folder,
            String publicId,
            List<String> tags
    ) throws IOException {
        Map<String, Object> options = new HashMap<>();
        options.put("resource_type", "image");
        options.put("folder", rootFolder + "/" + folder);
        if (publicId != null) {
            options.put("public_id", publicId);
        }
        options.put("tags", tags);

        Map uploadResult = cloudinary.uploader()
                .upload(fileBytes, options);

        return (String) uploadResult.get("secure_url");
    }

    /* ---------------------------------------------------
       CATEGORY IMAGES (TAG-BASED)
       --------------------------------------------------- */

    /**
     * Get all images for a category using tag
     * Example tag: "health", "wellness"
     */
    @SuppressWarnings("unchecked")
    public List<String> getImagesByCategoryTag(String categoryTag) {
        try {
            ApiResponse response = cloudinary.api().resourcesByTag(
                    categoryTag,
                    Map.of(
                            "resource_type", "image",
                            "max_results", 100
                    )
            );

            List<Map<String, Object>> resources =
                    (List<Map<String, Object>>) response.get("resources");

            if (resources == null || resources.isEmpty()) {
                log.warn("No images found for category tag: {}", categoryTag);
                return Collections.emptyList();
            }

            return resources.stream()
                    .map(res -> cloudinary.url()
                            .secure(true)
                            .generate((String) res.get("public_id")))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to fetch images for tag: {}", categoryTag, e);
            return Collections.emptyList();
        }
    }

    /* ---------------------------------------------------
       IMAGE DETAILS
       --------------------------------------------------- */

    @SuppressWarnings("unchecked")
    public Map<String, Object> getImageDetails(String publicId) {
        try {
            return cloudinary.api().resource(publicId, Map.of());
        } catch (Exception e) {
            log.error("Failed to fetch image details: {}", publicId, e);
            return Collections.emptyMap();
        }
    }

    /* ---------------------------------------------------
       DELETE
       --------------------------------------------------- */

    public boolean deleteImage(String publicId) {
        try {
            Map result = cloudinary.uploader()
                    .destroy(publicId, Map.of());
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            log.error("Failed to delete image: {}", publicId, e);
            return false;
        }
    }

    /* ---------------------------------------------------
       OPTIMIZED URL (USED BY FRONTEND)
       --------------------------------------------------- */

    public String getOptimizedImageUrl(
            String publicId,
            int width,
            int height
    ) {
        return cloudinary.url()
                .secure(true)
                .transformation(new Transformation()
                        .width(width)
                        .height(height)
                        .crop("fill")
                        .quality("auto")
                        .fetchFormat("auto"))
                .generate(publicId);
    }

    /* ---------------------------------------------------
       DEBUG (OPTIONAL)
       --------------------------------------------------- */

    @SuppressWarnings("unchecked")
    public void debugListResources() {
        try {
            ApiResponse response = cloudinary.api().resources(
                    Map.of("resource_type", "image", "max_results", 20)
            );

            List<Map<String, Object>> resources =
                    (List<Map<String, Object>>) response.get("resources");

            if (resources != null) {
                resources.forEach(res ->
                        log.info("Image → public_id={}, tags={}",
                                res.get("public_id"),
                                res.get("tags"))
                );
            }
        } catch (Exception e) {
            log.error("Debug resource listing failed", e);
        }
    }
}
