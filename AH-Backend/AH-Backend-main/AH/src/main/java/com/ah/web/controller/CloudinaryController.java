package com.ah.web.controller;

import com.ah.web.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public endpoint to get Cloudinary images for categories
 * This allows the frontend to fetch product images directly
 */
@RestController
@RequestMapping("/api/cloudinary")
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    public CloudinaryController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Get all images from a specific category tag
     * Example: GET /api/cloudinary/images/spices
     */
    @GetMapping("/images/{tag}")
    public ResponseEntity<List<String>> getImagesFromFolder(@PathVariable String tag) {
        List<String> images = cloudinaryService.getImagesByCategoryTag(tag);
        return ResponseEntity.ok(images);
    }

    /**
     * Get all categories (folders concept replaced by tags/categories)
     */
    @GetMapping("/folders")
    public ResponseEntity<List<String>> listFolders() {
        // Return fixed list of categories as "folders"
        List<String> folders = List.of("spices", "dry-fruits", "hair-care", "face-care", "body-care", "health-wellness");
        return ResponseEntity.ok(folders);
    }

    /**
     * Get images for all categories in one call
     */
    @GetMapping("/all-images")
    public ResponseEntity<Map<String, List<String>>> getAllCategoryImages() {
        List<String> categories = List.of("spices", "dry-fruits", "hair-care", "face-care", "body-care", "health-wellness");
        Map<String, List<String>> allImages = new java.util.HashMap<>();
        
        for (String cat : categories) {
            List<String> images = cloudinaryService.getImagesByCategoryTag(cat);
            allImages.put(cat, images);
        }
        
        return ResponseEntity.ok(allImages);
    }
}
