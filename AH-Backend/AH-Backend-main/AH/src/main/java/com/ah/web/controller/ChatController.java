package com.ah.web.controller;

import com.ah.web.dto.request.ChatRequest;
import com.ah.web.dto.response.ChatResponse;
import com.ah.web.service.ProductEmbeddingService;
import com.ah.web.service.RagChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final RagChatService ragChatService;
    private final ProductEmbeddingService productEmbeddingService;

    public ChatController(RagChatService ragChatService, ProductEmbeddingService productEmbeddingService) {
        this.ragChatService = ragChatService;
        this.productEmbeddingService = productEmbeddingService;
    }

    /**
     * Public chat endpoint — used by the floating Vaidya assistant widget.
     * No authentication required; rate limiting handled by RateLimitFilter.
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(ragChatService.chat(request));
    }

    /**
     * Semantic product search — returns ranked product suggestions without a
     * conversational reply. Used by AllProductsPage for hybrid search.
     */
    @GetMapping("/search/semantic")
    public ResponseEntity<List<ChatResponse.ProductSuggestion>> semanticSearch(
            @RequestParam String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(ragChatService.semanticSearch(q));
    }

    /**
     * Admin-only: trigger a full re-index of all products.
     * Call this once after first deployment, or after changing the embedding model.
     */
    @PostMapping("/admin/embeddings/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> reindexAll() {
        productEmbeddingService.reindexAll();
        return ResponseEntity.ok(Map.of("message", "Re-indexing complete"));
    }
}
