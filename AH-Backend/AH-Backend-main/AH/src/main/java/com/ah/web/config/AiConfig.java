package com.ah.web.config;

import org.springframework.ai.document.MetadataMode;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Manually wires two separate OpenAI-compatible API clients:
 *
 *   Chat model  → Groq  (https://api.groq.com/openai)   FREE key from console.groq.com
 *   Embeddings  → Jina  (https://api.jina.ai/v1)        FREE key from jina.ai
 *
 * Spring AI's auto-configured OpenAiChatModel (from application.yml) handles the
 * ChatClient/ChatModel bean pointing to Groq. This class overrides only the
 * EmbeddingModel bean to point to Jina instead, avoiding any ONNX downloads.
 *
 * Dimensions: jina-embeddings-v3 outputs 1024-dimensional vectors.
 */
@Configuration
public class AiConfig {

    @Value("${jina.api-key:}")
    private String jinaApiKey;

    /**
     * EmbeddingModel backed by Jina AI's OpenAI-compatible endpoint.
     * Marked @Primary so pgvector's auto-configuration picks this over any
     * fallback bean Spring AI might create.
     */
    @Bean
    @Primary
    public OpenAiEmbeddingModel jinaEmbeddingModel() {
        // Spring AI 1.0.0 requires the builder — no 2-arg constructor exists
        // Base URL must NOT include /v1 — Spring AI appends /v1/embeddings itself.
        // Setting it to https://api.jina.ai/v1 produces the broken double-path
        // https://api.jina.ai/v1/v1/embeddings
        OpenAiApi jinaApi = OpenAiApi.builder()
                .baseUrl("https://api.jina.ai")
                .apiKey(jinaApiKey)
                .build();

        OpenAiEmbeddingOptions options = OpenAiEmbeddingOptions.builder()
                .model("jina-embeddings-v3")
                .build();

        return new OpenAiEmbeddingModel(jinaApi, MetadataMode.EMBED, options);
    }
}
