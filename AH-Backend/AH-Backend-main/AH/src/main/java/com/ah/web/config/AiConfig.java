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
 * Manually wires the embedding client for the selected environment. Jina and
 * Ollama expose OpenAI-compatible embedding endpoints. The configured pgvector
 * dimension must match the selected embedding model.
 */
@Configuration
@org.springframework.context.annotation.Profile("!test")
public class AiConfig {

    @Value("${ai.embedding.api-key:}")
    private String embeddingApiKey;

    @Value("${ai.embedding.base-url}")
    private String embeddingBaseUrl;

    @Value("${ai.embedding.model}")
    private String embeddingModel;

    /**
     * EmbeddingModel backed by Jina AI's OpenAI-compatible endpoint.
     * Marked @Primary so pgvector's auto-configuration picks this over any
     * fallback bean Spring AI might create.
     */
    @Bean
    @Primary
    public OpenAiEmbeddingModel embeddingModel() {
        // The base URL intentionally omits /v1 because Spring AI appends it.
        OpenAiApi embeddingApi = OpenAiApi.builder()
                .baseUrl(embeddingBaseUrl)
                .apiKey(embeddingApiKey)
                .build();

        OpenAiEmbeddingOptions options = OpenAiEmbeddingOptions.builder()
                .model(embeddingModel)
                .build();

        return new OpenAiEmbeddingModel(embeddingApi, MetadataMode.EMBED, options);
    }
}
