package com.ah.web.service;

import com.ah.web.entity.Product;
import com.ah.web.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Manages the product vector index in pgvector.
 *
 * Each product is stored as a Document whose text is a rich natural-language
 * description built from all Ayurvedic fields (name, ingredients, benefits,
 * usage, category). This gives semantic search far more signal than a simple
 * ILIKE query.
 *
 * Document IDs use the deterministic format "product-{id}" so that update and
 * delete operations are idempotent.
 */
@Service
public class ProductEmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(ProductEmbeddingService.class);

    private final VectorStore vectorStore;
    private final ApprovedKnowledge knowledge;
    private final org.springframework.context.ApplicationEventPublisher events;
    public record IndexEvent(Long id, boolean deleted) {}
    private final ProductRepository productRepository;

    @Autowired
    public ProductEmbeddingService(VectorStore vectorStore, ProductRepository productRepository, ApprovedKnowledge knowledge, org.springframework.context.ApplicationEventPublisher events) {
        this.vectorStore = vectorStore;
        this.knowledge = knowledge;
        this.events = events;
        this.productRepository = productRepository;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    public void indexProduct(Product product) { events.publishEvent(new IndexEvent(product.getId(),false)); }
    public void removeProduct(Long productId) { events.publishEvent(new IndexEvent(productId,true)); }
    @Async
    @org.springframework.transaction.event.TransactionalEventListener(phase=org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT,fallbackExecution=true)
    @org.springframework.transaction.annotation.Transactional(propagation=org.springframework.transaction.annotation.Propagation.REQUIRES_NEW,readOnly=true)
    public void onIndexEvent(IndexEvent event) {
        try {
            if(event.deleted()) vectorStore.delete(List.of(documentId(event.id())));
            else productRepository.findById(event.id()).ifPresent(p->vectorStore.add(List.of(toDocument(p))));
        } catch(Exception e) { log.warn("Catalog index update failed for {}; use admin reindex to retry",event.id()); }
    }

    /**
     * Re-indexes every product in the database.
     * Called once on startup (via AdminController endpoint) or whenever the
     * embedding model changes.
     */
    @org.springframework.transaction.annotation.Transactional(readOnly=true)
    public void reindexAll() {
        log.info("Starting full product re-index...");
        List<Product> products = productRepository.findAll();
        List<Document> docs = new ArrayList<>(products.size());
        for (Product p : products) {
            docs.add(toDocument(p));
        }
        // Batch in groups of 100 to avoid oversized embedding requests
        int batchSize = 100;
        for (int i = 0; i < docs.size(); i += batchSize) {
            List<Document> batch = docs.subList(i, Math.min(i + batchSize, docs.size()));
            vectorStore.add(batch);
        }
        vectorStore.add(knowledge.documents());
        log.info("Re-indexed {} products and approved knowledge.", docs.size());
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private static String documentId(Long productId) {
        return java.util.UUID.nameUUIDFromBytes(("product-" + productId).getBytes(java.nio.charset.StandardCharsets.UTF_8)).toString();
    }

    /**
     * Builds a rich natural-language document from all Ayurvedic product fields.
     * The quality of this text directly drives retrieval accuracy.
     */
    private static Document toDocument(Product product) {
        StringBuilder sb = new StringBuilder();
        sb.append("Product: ").append(product.getName());

        if (product.getCategory() != null) {
            sb.append(" | Category: ").append(product.getCategory().getName());
        }
        if (product.getShortDescription() != null) {
            sb.append(" | ").append(product.getShortDescription());
        }
        if (product.getDescription() != null) {
            sb.append(" | ").append(product.getDescription());
        }
        if (product.getIngredients() != null) {
            sb.append(" | Ingredients: ").append(product.getIngredients());
        }
        if (product.getBenefits() != null) {
            sb.append(" | Benefits: ").append(product.getBenefits());
        }
        if (product.getUsage() != null) {
            sb.append(" | How to use: ").append(product.getUsage());
        }
        if (product.getPrice() != null) {
            sb.append(" | Price: ₹").append(product.getPrice());
        }

        Map<String, Object> metadata = Map.of(
            "collection",        "ah-approved-v1",
            "kind",              "product",
            "productId",         product.getId(),
            "name",              product.getName(),
            "imageUrl",          product.getImageUrl() != null ? product.getImageUrl() : "",
            "price",             product.getPrice() != null ? product.getPrice().toString() : "0",
            "rating",            product.getRating() != null ? product.getRating() : 0.0,
            "shortDescription",  product.getShortDescription() != null ? product.getShortDescription() : "",
            "inStock",           product.getStock() != null && product.getStock() > 0
        );

        return new Document(documentId(product.getId()), sb.toString(), metadata);
    }
}
