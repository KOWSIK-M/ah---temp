package com.ah.web.service;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;
public final class ChatBoundary {
    private ChatBoundary() {}
    public static final String SCOPE="I can help with Anjaneya Herbals products and reviewed general information about Ayurveda, herbs, nuts and dried fruits. Please ask a question within those topics.";
    public static final String SAFETY="I cannot provide instructions for harm, diagnosis, treatment, doses, or advice on replacing medicines. For personal health questions, consult a qualified healthcare professional. If there is immediate danger or a severe reaction, seek urgent local medical help.";
    private static final Pattern UNSAFE=Pattern.compile("(?iu)(poison|toxic dose|lethal|overdose|kill|suicid|self.?harm|weapon|explosive|bomb|abort|sedat|drug someone|incapacitat|cancer|diabet|pregnan|breastfeed|infant|child|dosage|dose|how much.{0,30}(take|consume)|cure|treat my|diagnos|prescri|stop.{0,20}medic|replace.{0,20}medic|chest pain|cannot breathe|can't breathe|anaphyl|interaction|blood thinner)");
    private static final Pattern INJECTION=Pattern.compile("(?iu)(ignore.{0,30}(instruction|rule|previous)|system prompt|developer message|jailbreak|bypass|act as|roleplay|base64|decode|execute|<script|https?://)");
    private static final Pattern UNRELATED=Pattern.compile("(?iu)(politic|election|president|bitcoin|crypto|stock market|programming|javascript|python|sql|football|cricket|porn|sex|hack|malware|religion|war|write.{0,20}(code|essay|poem))");
    public static String normalized(String q) { return Normalizer.normalize(q,Normalizer.Form.NFKC).replaceAll("[\\p{Cf}]", "").toLowerCase(Locale.ROOT); }
    public static String refusal(String question) {
        String q=normalized(question);
        if(UNSAFE.matcher(q).find()) return SAFETY;
        if(INJECTION.matcher(q).find() || UNRELATED.matcher(q).find()) return SCOPE;
        return null;
    }
}
