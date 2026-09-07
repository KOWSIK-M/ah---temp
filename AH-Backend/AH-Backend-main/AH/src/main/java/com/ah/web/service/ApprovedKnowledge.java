package com.ah.web.service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.ai.document.Document;
import java.util.*;
import java.nio.charset.StandardCharsets;
@Component
public class ApprovedKnowledge {
    public record Entry(String id,String title,List<String> keywords,String text,String source) {}
    private final List<Entry> entries;
    public ApprovedKnowledge(ObjectMapper mapper) throws java.io.IOException {
        try(var input=new ClassPathResource("knowledge/approved.json").getInputStream()) {
            entries=List.copyOf(mapper.readValue(input,new TypeReference<List<Entry>>() {}));
        }
        for(var entry: entries) {
            String host=java.net.URI.create(entry.source()).getHost();
            if(!Set.of("www.nccih.nih.gov","www.fda.gov").contains(host)) throw new IllegalArgumentException("Unapproved knowledge source");
        }
    }
    public Optional<Entry> find(String id) { return entries.stream().filter(e->e.id().equals(id)).findFirst(); }
    public List<Entry> match(String query) {
        String q=query.toLowerCase(Locale.ROOT);
        return entries.stream().filter(e->e.keywords().stream().anyMatch(q::contains)).limit(3).toList();
    }
    public List<Document> documents() {
        return entries.stream().map(e->new Document(UUID.nameUUIDFromBytes(("knowledge:"+e.id()).getBytes(StandardCharsets.UTF_8)).toString(),
            e.title()+". "+e.text(),Map.of("collection","ah-approved-v1","kind","knowledge","knowledgeId",e.id()))).toList();
    }
}
