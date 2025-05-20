package com.example.senseiVoix.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.node.TextNode;
import java.io.IOException;

public class S3UrlDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        TextNode node = p.getCodec().readTree(p);
        String value = node.asText();

        // Optionally, you can validate if it starts with "s3://" and handle accordingly
        if (value.startsWith("s3://")) {
            return value;
        } else {
            // Handle case where it's not a valid S3 URL
            return value;
        }
    }
}
