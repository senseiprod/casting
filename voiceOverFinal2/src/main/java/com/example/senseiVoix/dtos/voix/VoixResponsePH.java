package com.example.senseiVoix.dtos.voix;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VoixResponsePH {

        private String id;
        private String name;
        private String type;
    @JsonProperty("voice_engine")
    private String voice_engine;

        // Constructeur par défaut
        public VoixResponsePH() {}

        // Constructeur avec paramètres
        public VoixResponsePH(String id, String name, String type, String voice_engine) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.voice_engine = voice_engine;
        }

        // Getters et Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getVoiceEngine() {
            return voice_engine;
        }

        public void setVoiceEngine(String voiceEngine) {
            this.voice_engine = voiceEngine;
        }

        @Override
        public String toString() {
            return "VoixResponse{" +
                    "id='" + id + '\'' +
                    ", name='" + name + '\'' +
                    ", type='" + type + '\'' +
                    ", voiceEngine='" + voice_engine + '\'' +
                    '}';
        }
    }
