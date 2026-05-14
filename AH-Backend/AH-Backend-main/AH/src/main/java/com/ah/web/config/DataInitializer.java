package com.ah.web.config;

import com.ah.web.entity.Category;
import com.ah.web.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    private record CategoryConfig(String name, String slug, String description, int order) {}

    @Override
    public void run(String... args) {
        initializeCategories();
    }

    private void initializeCategories() {
        log.info("Initializing categories...");

        List<CategoryConfig> categories = List.of(
                new CategoryConfig("Spices", "spices", "Premium quality Indian spices", 1),
                new CategoryConfig("Dry Fruits", "dry-fruits", "Natural dry fruits and nuts", 2),
                new CategoryConfig("Hair Care", "hair-care", "Ayurvedic hair care products", 3),
                new CategoryConfig("Body Care", "body-care", "Herbal body care products", 4),
                new CategoryConfig("Face Care", "face-care", "Natural face care solutions", 5),
                new CategoryConfig("Health & Wellness", "health-wellness", "Health and immunity boosters", 6)
        );

        for (CategoryConfig data : categories) {
            Category category = categoryRepository.findBySlug(data.slug)
                    .orElse(Category.builder()
                            .slug(data.slug)
                            .build());

            // Update details
            category.setName(data.name);
            category.setDescription(data.description);
            category.setDisplayOrder(data.order);

            // Note: Image URLs are no longer fetched from Cloudinary automatically.
            // Explicit uploads/updates via Admin panel will handle images.

            categoryRepository.save(category);
            log.info("Processed category: {}", data.name);
        }

        log.info("Categories initialized successfully");
    }
}
