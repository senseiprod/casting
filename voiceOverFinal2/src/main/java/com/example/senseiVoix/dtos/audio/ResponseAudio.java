package com.example.senseiVoix.dtos.audio;

import com.example.senseiVoix.enumeration.TypeAudio;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseAudio {
    private byte[] audioFile;
    private TypeAudio typeAudio;

}
