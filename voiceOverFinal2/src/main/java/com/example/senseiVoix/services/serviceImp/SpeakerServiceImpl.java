package com.example.senseiVoix.services.serviceImp;
import com.example.senseiVoix.dtos.IMapClassWithDto;
import com.example.senseiVoix.dtos.speacker.SpeakerRequest;
import com.example.senseiVoix.dtos.speacker.SpeakerResponse;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.repositories.SpeakerRepository;
import com.example.senseiVoix.services.SpeakerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SpeakerServiceImpl implements SpeakerService {

    @Autowired
    private SpeakerRepository speakerRepository;

    @Autowired
    private IMapClassWithDto<Speaker, SpeakerRequest> requestMapper;


    @Override
    public List<SpeakerResponse> getAllSpeakers() {
        List<Speaker> speakers = speakerRepository.findAll();
        List<SpeakerResponse> speakerResponselist = new ArrayList<>();
        for (Speaker speaker : speakers) {
            SpeakerResponse speakerResponse = new SpeakerResponse();
            speakerResponse.setNom(speaker.getNom());
            speakerResponse.setPrenom(speaker.getPrenom());
            speakerResponse.setEmail(speaker.getEmail());
            speakerResponse.setEarnings(speaker.getEarnings());
            speakerResponse.setRole(speaker.getRole());
            speakerResponse.setPhone(speaker.getPhone());
            speakerResponse.setUuid(speaker.getUuid());
            speakerResponse.setUsername(speaker.getUsername());
            speakerResponse.setCode(speaker.getCode());
            speakerResponselist.add(speakerResponse);
        }

        return speakerResponselist;
    }

    @Override
    public Optional<Speaker> getSpeakerById(Long id) {
        return speakerRepository.findById(id);
    }

    @Override
    public SpeakerResponse getSpeakerByUuid(String uuid) {
        Speaker speaker = speakerRepository.findByUuid(uuid);
        SpeakerResponse speakerResponse = new SpeakerResponse();
        speakerResponse.setNom(speaker.getNom());
        speakerResponse.setAge(speaker.getAge());
        speakerResponse.setGender(speaker.getGender());
        speakerResponse.setPrenom(speaker.getPrenom());
        speakerResponse.setEmail(speaker.getEmail());
        speakerResponse.setEarnings(speaker.getEarnings());
        speakerResponse.setRole(speaker.getRole());
        speakerResponse.setPhone(speaker.getPhone());
        speakerResponse.setUuid(speaker.getUuid());
        speakerResponse.setUsername(speaker.getUsername());
        speakerResponse.setCode(speaker.getCode());
        return speakerResponse;
    }

    @Override
    public SpeakerResponse getSpeakerByEmail(String email) {
        Speaker speaker = speakerRepository.findByEmail(email);
        SpeakerResponse speakerResponse = new SpeakerResponse();
        speakerResponse.setNom(speaker.getNom());
        speakerResponse.setPrenom(speaker.getPrenom());
        speakerResponse.setEmail(speaker.getEmail());
        speakerResponse.setEarnings(speaker.getEarnings());
        speakerResponse.setRole(speaker.getRole());
        speakerResponse.setPhone(speaker.getPhone());
        speakerResponse.setUuid(speaker.getUuid());
        speakerResponse.setUsername(speaker.getUsername());
        speakerResponse.setCode(speaker.getCode());
        return speakerResponse;
    }

    @Override
    public List<SpeakerResponse> getSpeakersByEarnings(Double earnings) {
        List<Speaker> speakers = speakerRepository.findBysalair(earnings);
        List<SpeakerResponse> speakerResponselist = new ArrayList<>();
        for (Speaker speaker : speakers) {
            SpeakerResponse speakerResponse = new SpeakerResponse();
            speakerResponse.setNom(speaker.getNom());
            speakerResponse.setBanckRib(speaker.getBanckRib());
            speakerResponse.setAge(speaker.getAge());
            speakerResponse.setGender(speaker.getGender());
            speakerResponse.setPrenom(speaker.getPrenom());
            speakerResponse.setEmail(speaker.getEmail());
            speakerResponse.setEarnings(speaker.getEarnings());
            speakerResponse.setRole(speaker.getRole());
            speakerResponse.setPhone(speaker.getPhone());
            speakerResponse.setUuid(speaker.getUuid());
            speakerResponse.setUsername(speaker.getUsername());
            speakerResponse.setCode(speaker.getCode());
            speakerResponselist.add(speakerResponse);
        }

        return speakerResponselist;
    }

    @Override
    public List<SpeakerResponse> getSpeakersNotDeleted() {
        List<Speaker> speakers = speakerRepository.findAllNotDeleted();
        List<SpeakerResponse> speakerResponselist = new ArrayList<>();
        for (Speaker speaker : speakers) {
            SpeakerResponse speakerResponse = new SpeakerResponse();
            speakerResponse.setNom(speaker.getNom());
            speakerResponse.setPrenom(speaker.getPrenom());
            speakerResponse.setEmail(speaker.getEmail());
            speakerResponse.setBanckRib(speaker.getBanckRib());
            speakerResponse.setAge(speaker.getAge());
            speakerResponse.setGender(speaker.getGender());
            speakerResponse.setEarnings(speaker.getEarnings());
            speakerResponse.setRole(speaker.getRole());
            speakerResponse.setPhone(speaker.getPhone());
            speakerResponse.setUuid(speaker.getUuid());
            speakerResponse.setUsername(speaker.getUsername());
            speakerResponse.setCode(speaker.getCode());
            speakerResponselist.add(speakerResponse);
        }

        return speakerResponselist;
    }

    @Override
    public List<SpeakerResponse> getSpeakersDeleted() {
        List<Speaker> speakers = speakerRepository.findAllDeleted();
        List<SpeakerResponse> speakerResponselist = new ArrayList<>();
        for (Speaker speaker : speakers) {
            SpeakerResponse speakerResponse = new SpeakerResponse();
            speakerResponse.setNom(speaker.getNom());
            speakerResponse.setPrenom(speaker.getPrenom());
            speakerResponse.setEmail(speaker.getEmail());
            speakerResponse.setBanckRib(speaker.getBanckRib());
            speakerResponse.setAge(speaker.getAge());
            speakerResponse.setGender(speaker.getGender());
            speakerResponse.setEarnings(speaker.getEarnings());
            speakerResponse.setRole(speaker.getRole());
            speakerResponse.setPhone(speaker.getPhone());
            speakerResponse.setUuid(speaker.getUuid());
            speakerResponse.setUsername(speaker.getUsername());
            speakerResponse.setCode(speaker.getCode());
            speakerResponselist.add(speakerResponse);
        }

        return speakerResponselist;
    }

    @Override
    public SpeakerResponse createSpeaker(SpeakerRequest speakerRequest) {
        if (speakerRequest != null) {
            Speaker speaker = requestMapper.convertToEntity(speakerRequest, Speaker.class);
            Speaker savedSpeaker = speakerRepository.save(speaker);
            SpeakerResponse speakerResponse = new SpeakerResponse();
            speakerResponse.setNom(savedSpeaker.getNom());
            speakerResponse.setPrenom(savedSpeaker.getPrenom());
            speakerResponse.setEmail(savedSpeaker.getEmail());
            speakerResponse.setBanckRib(savedSpeaker.getBanckRib());
            speakerResponse.setEarnings(savedSpeaker.getEarnings());
            speakerResponse.setRole(savedSpeaker.getRole());
            speakerResponse.setPhone(savedSpeaker.getPhone());
            speakerResponse.setUuid(savedSpeaker.getUuid());
            speakerResponse.setAge(savedSpeaker.getAge());
            speakerResponse.setGender(savedSpeaker.getGender());
            speakerResponse.setUsername(savedSpeaker.getUsername());
            speakerResponse.setCode(savedSpeaker.getCode());
            return speakerResponse;
        }
        return null;
    }

    @Override
    public SpeakerResponse updateSpeaker(String uuid, SpeakerRequest speakerRequest) {
        Speaker speaker = speakerRepository.findByUuid(uuid);
        if (speaker != null) {
            speaker.setEmail(speakerRequest.getEmail());
            speaker.setEarnings(speakerRequest.getEarnings());
            Speaker updatedSpeaker = speakerRepository.save(speaker);
            SpeakerResponse speakerResponse = new SpeakerResponse();
            speakerResponse.setNom(updatedSpeaker.getNom());
            speakerResponse.setPrenom(updatedSpeaker.getPrenom());
            speakerResponse.setEmail(updatedSpeaker.getEmail());
            speakerResponse.setBanckRib(updatedSpeaker.getBanckRib());
            speakerResponse.setEarnings(updatedSpeaker.getEarnings());
            speakerResponse.setAge(updatedSpeaker.getAge());
            speakerResponse.setGender(updatedSpeaker.getGender());
            speakerResponse.setRole(updatedSpeaker.getRole());
            speakerResponse.setPhone(updatedSpeaker.getPhone());
            speakerResponse.setUuid(updatedSpeaker.getUuid());
            speakerResponse.setUsername(updatedSpeaker.getUsername());
            speakerResponse.setCode(updatedSpeaker.getCode());
            return speakerResponse;
        }
        return null;
    }
    @Override
    public List<SpeakerResponse> searchByName(String name) {
        List<Speaker> speakers = speakerRepository.findByFirstNameOrLastName(name);
        List<SpeakerResponse> speakerResponselist = new ArrayList<>();
        for (Speaker speaker : speakers) {
            SpeakerResponse speakerResponse = new SpeakerResponse();
            speakerResponse.setNom(speaker.getNom());
            speakerResponse.setPrenom(speaker.getPrenom());
            speakerResponse.setEmail(speaker.getEmail());
            speakerResponse.setBanckRib(speaker.getBanckRib());
            speakerResponse.setEarnings(speaker.getEarnings());
            speakerResponse.setRole(speaker.getRole());
            speakerResponse.setPhone(speaker.getPhone());
            speakerResponse.setAge(speaker.getAge());
            speakerResponse.setGender(speaker.getGender());
            speakerResponse.setUuid(speaker.getUuid());
            speakerResponse.setUsername(speaker.getUsername());
            speakerResponse.setCode(speaker.getCode());
            speakerResponselist.add(speakerResponse);
        }

        return speakerResponselist;

    }
    @Override
    public void deleteSpeaker(String uuid) {
        Speaker speaker = speakerRepository.findByUuid(uuid);
        if (speaker != null) {
            speaker.setDeleted(true);
            speakerRepository.save(speaker);
        } else {
            throw new RuntimeException("Speaker not found with uuid: " + uuid);
        }
    }
}
