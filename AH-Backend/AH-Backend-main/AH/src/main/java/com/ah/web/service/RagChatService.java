package com.ah.web.service;

import com.ah.web.dto.request.ChatRequest;
import com.ah.web.dto.response.ChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * RAG (Retrieval-Augmented Generation) service for the Ayurvedic product assistant.
 *
 * Flow:
 *  1. Embed the user's question
 *  2. Retrieve the top-5 most semantically similar product documents from pgvector
 *  3. Compose a prompt with product context + conversation history
 *  4. Call Claude (claude-3-5-haiku) for a grounded, helpful response
 *  5. Return the reply + structured product suggestion cards
 */
@Service
public class RagChatService {

    private static final Logger log = LoggerFactory.getLogger(RagChatService.class);

    private static final String SYSTEM_PROMPT = """
        You are Vaidya, a knowledgeable and friendly Ayurvedic wellness assistant for Anjaneya Herbals,
        a trusted store for authentic Ayurvedic products, spices, dry fruits, and herbal remedies.

        Your job is to:
        - Help customers find the right products for their health and wellness goals
        - Explain Ayurvedic concepts, ingredients, and their benefits in simple language
        - Suggest products from the catalog that match the customer's needs
        - Answer questions about usage, dosage, ingredients, and suitability
        - Provide honest guidance — if a product is not suitable, say so

        Guidelines:
        - Keep responses concise (3-5 sentences) unless a detailed explanation is needed
        - Always ground your answers in the provided product context
        - Do not invent products that are not in the context
        - If the question is unrelated to Ayurveda or our products, politely redirect
        - Use warm, supportive language — you are like a trusted wellness advisor
        - When recommending products, mention them by exact name from the context
        - Add a disclaimer for serious medical conditions: "Please consult a qualified Ayurvedic practitioner"

        Respond in the same language the customer uses. Default to English.
        """;

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public RagChatService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }

    public ChatResponse chat(ChatRequest request) {
        String userMessage = request.getMessage();

        // 1. Retrieve top-5 relevant product documents
        // Wrapped in try/catch: on corporate networks the SSL inspection proxy can block
        // outbound HTTPS to Jina AI, causing PKIX failures. Fall back to chat-only mode
        // (no RAG context) rather than returning a 500 to the user.
        List<Document> relevantDocs;
        try {
            relevantDocs = vectorStore.similaritySearch(
                SearchRequest.builder()
                    .query(userMessage)
                    .topK(5)
                    .similarityThreshold(0.3)
                    .build()
            );
        } catch (Exception e) {
            log.warn("Vector search unavailable (SSL/network issue?), using chat-only mode: {}", e.getMessage());
            relevantDocs = List.of();
        }

        log.debug("RAG retrieved {} documents for query: {}", relevantDocs.size(), userMessage);

        // 2. Build context string from retrieved documents
        String productContext = relevantDocs.isEmpty()
            ? "No specific products found for this query."
            : relevantDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        // 3. Build conversation history for multi-turn support
        List<Message> history = buildHistory(request.getHistory());

        // 4. Compose the user prompt with injected context
        String promptWithContext = """
            Customer question: %s

            Relevant products from our catalog:
            %s
            """.formatted(userMessage, productContext);

        // 5. Call Claude with system prompt + history + context-enriched user message
        String reply = chatClient.prompt()
            .system(SYSTEM_PROMPT)
            .messages(history)
            .user(promptWithContext)
            .call()
            .content();

        // 6. Extract structured product suggestion cards from retrieved docs
        List<ChatResponse.ProductSuggestion> suggestions = relevantDocs.stream()
            .filter(doc -> {
                Map<String, Object> meta = doc.getMetadata();
                return Boolean.TRUE.equals(meta.get("inStock"));
            })
            .limit(3)
            .map(RagChatService::toSuggestion)
            .collect(Collectors.toList());

        return new ChatResponse(reply, suggestions);
    }

    /**
     * Perform a semantic product search without a chat response.
     * Used by the AllProductsPage for hybrid search (keyword + vector).
     */
    public List<ChatResponse.ProductSuggestion> semanticSearch(String query) {
        List<Document> docs;
        try {
            docs = vectorStore.similaritySearch(
                SearchRequest.builder()
                    .query(query)
                    .topK(8)
                    .similarityThreshold(0.35)
                    .build()
            );
        } catch (Exception e) {
            log.warn("Semantic search unavailable: {}", e.getMessage());
            return List.of();
        }
        return docs.stream()
            .filter(doc -> Boolean.TRUE.equals(doc.getMetadata().get("inStock")))
            .map(RagChatService::toSuggestion)
            .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private List<Message> buildHistory(List<ChatRequest.ChatTurn> history) {
        if (history == null || history.isEmpty()) return List.of();
        List<Message> messages = new ArrayList<>();
        for (ChatRequest.ChatTurn turn : history) {
            if ("user".equalsIgnoreCase(turn.role())) {
                messages.add(new UserMessage(turn.content()));
            } else if ("assistant".equalsIgnoreCase(turn.role())) {
                messages.add(new AssistantMessage(turn.content()));
            }
        }
        return messages;
    }

    private static ChatResponse.ProductSuggestion toSuggestion(Document doc) {
        Map<String, Object> meta = doc.getMetadata();
        Long id = meta.get("productId") instanceof Number n ? n.longValue() : null;
        String name = (String) meta.getOrDefault("name", "");
        String imageUrl = (String) meta.getOrDefault("imageUrl", "");
        String priceStr = (String) meta.getOrDefault("price", "0");
        Double rating = meta.get("rating") instanceof Number n ? n.doubleValue() : 0.0;
        String shortDesc = (String) meta.getOrDefault("shortDescription", "");

        BigDecimal price;
        try {
            price = new BigDecimal(priceStr);
        } catch (NumberFormatException e) {
            price = BigDecimal.ZERO;
        }

        return new ChatResponse.ProductSuggestion(id, name, imageUrl, price, rating, shortDesc);
    }
}
