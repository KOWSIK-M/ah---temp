package com.ah.web.service;
import com.ah.web.dto.request.ChatRequest;
import com.ah.web.dto.response.ChatResponse;
import com.ah.web.entity.Product;
import com.ah.web.repository.ProductRepository;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service
public class RagChatService {
    private final VectorStore vectors;
    private final ProductRepository products;
    private final ApprovedKnowledge knowledge;
    public RagChatService(VectorStore vectors,ProductRepository products,ApprovedKnowledge knowledge) {
        this.vectors=vectors; this.products=products; this.knowledge=knowledge;
    }
    @Transactional(readOnly=true)
    public ChatResponse chat(ChatRequest request) {
        String question=request.getMessage();
        String refusal=ChatBoundary.refusal(question);
        if(refusal!=null) return answer(refusal);
        var entries=new LinkedHashMap<String,ApprovedKnowledge.Entry>();
        for(var entry:knowledge.match(question)) entries.put(entry.id(),entry);
        var suggestions=new LinkedHashMap<Long,ChatResponse.ProductSuggestion>();
        // Retrieval is restricted to an explicitly versioned, locally managed collection.
        // Rehydrate every result from the DB or approved file; vector payloads are not trusted facts.
        for(Document doc:retrieve(question)) {
            if("knowledge".equals(doc.getMetadata().get("kind"))) {
                knowledge.find(String.valueOf(doc.getMetadata().get("knowledgeId"))).ifPresent(e->{
                    if(e.keywords().stream().anyMatch(ChatBoundary.normalized(question)::contains)) entries.put(e.id(),e);
                });
            } else if("product".equals(doc.getMetadata().get("kind"))) {
                Object id=doc.getMetadata().get("productId");
                if(id instanceof Number n) products.findById(n.longValue()).filter(p->matchesCatalogIntent(question,p)).ifPresent(p->suggestions.put(p.getId(),card(p)));
            }
        }
        // A keyword fallback keeps factual catalog lookup useful during embedding-provider outages.
        if(suggestions.isEmpty()) for(Product product:products.findAll()) {
            if(matchesCatalogIntent(question,product) && suggestions.size()<3) suggestions.put(product.getId(),card(product));
        }
        if(entries.isEmpty() && suggestions.isEmpty()) return answer(ChatBoundary.SCOPE+" I do not have an approved answer for that question.");
        // Answers are assembled directly from reviewed passages. This makes the
        // safety boundary deterministic and removes any local chat-model need.
        List<ApprovedKnowledge.Entry> selected=new ArrayList<>(entries.values());
        StringBuilder reply=new StringBuilder();
        for(var entry:selected.stream().limit(2).toList()) reply.append(entry.text()).append("\nSource: ").append(entry.source()).append("\n\n");
        if(!suggestions.isEmpty()) reply.append("These catalog matches show current prices and availability. Check each product page and package label for details. Product listings are not evidence of medical effectiveness.");
        return new ChatResponse(reply.toString().trim(),suggestions.values().stream().limit(3).toList());
    }
    private boolean matchesCatalogIntent(String question, Product product) {
        String q=ChatBoundary.normalized(question);
        if(ChatBoundary.refusal(product.getName())!=null) return false;
        String name=product.getName().toLowerCase(Locale.ROOT);
        return Arrays.stream(name.split("[^a-z]+"))
            .filter(word->word.length()>3 && !Set.of("organic","premium","powder","natural","pure").contains(word))
            .anyMatch(word->q.matches("(?s).*\\b"+java.util.regex.Pattern.quote(word)+"s?\\b.*"));
    }
    private List<Document> retrieve(String q) {
        try { return vectors.similaritySearch(SearchRequest.builder().query(q).topK(8).similarityThreshold(0.55)
            .filterExpression("collection == 'ah-approved-v1'").build()); }
        catch(Exception ignored) { return List.of(); }
    }
    @Transactional(readOnly=true)
    public List<ChatResponse.ProductSuggestion> semanticSearch(String query) {
        if(query==null || query.length()>1000 || ChatBoundary.refusal(query)!=null) return List.of();
        var found=new LinkedHashMap<Long,ChatResponse.ProductSuggestion>();
        for(var doc:retrieve(query)) {
            Object id=doc.getMetadata().get("productId");
            if("product".equals(doc.getMetadata().get("kind")) && id instanceof Number n)
                products.findById(n.longValue()).filter(p->ChatBoundary.refusal(p.getName())==null).ifPresent(p->found.put(p.getId(),card(p)));
        }
        if(found.isEmpty()) products.findAll().stream().filter(p->matchesCatalogIntent(query,p)).limit(8).forEach(p->found.put(p.getId(),card(p)));
        return found.values().stream().limit(8).toList();
    }
    private ChatResponse.ProductSuggestion card(Product p) {
        return new ChatResponse.ProductSuggestion(p.getId(),p.getName(),p.getImageUrl(),p.getPrice(),p.getRating(),
            p.getStock()!=null && p.getStock()>0 ? "In stock" : "Out of stock");
    }
    private ChatResponse answer(String text) { return new ChatResponse(text,List.of()); }
}
