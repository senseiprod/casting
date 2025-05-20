package com.example.senseiVoix.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class AuthorityDeserializer extends JsonDeserializer<List<GrantedAuthority>> {
    @Override
    public List<GrantedAuthority> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        List<GrantedAuthority> authorities = new ArrayList<>();
        ArrayNode node = p.getCodec().readTree(p);

        for (int i = 0; i < node.size(); i++) {
            authorities.add(new SimpleGrantedAuthority(node.get(i).asText()));
        }

        return authorities;
    }
}

