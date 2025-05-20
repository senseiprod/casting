package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.IMapClassWithDto;
import com.example.senseiVoix.dtos.record.RecordRequest;
import com.example.senseiVoix.dtos.record.RecordResponse;
import com.example.senseiVoix.entities.Record;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.repositories.RecordRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import com.example.senseiVoix.services.RecordService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {
    @Autowired
    private  RecordRepository recordRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private  IMapClassWithDto<Record,RecordRequest> requestMapper;

    @Autowired
    private EmailService emailService; 

    @Override
    public RecordResponse createRecord(RecordRequest request) throws MessagingException, IOException {
        Record record = requestMapper.convertToEntity(request, Record.class);
        Utilisateur utilisateur = utilisateurRepository.findByUuid(request.getUtilisateurUuid());
        record.setUtilisateur(utilisateur);
        Record savedRecord = recordRepository.save(record);
        emailService.sendCalendarInvitation("studio@senseiprod.ma", "record voix off pour   " + utilisateur.getNom() +" " + utilisateur.getPrenom(), "invitation pour record voix off pour la platform ", request.getStartDateTime(), request.getEndDateTime(), "https://www.google.com/maps?q=33.5850647,-7.6411818");
        emailService.sendCalendarInvitation(utilisateur.getEmail(), "record voix off pour la platform ", "invitation pour record voix off pour la platform ", request.getStartDateTime(), request.getEndDateTime(), "https://www.google.com/maps?q=33.5850647,-7.6411818");
        RecordResponse recordResponse = new RecordResponse(savedRecord.getUuid(), savedRecord.getCode(), savedRecord.getUtilisateur().getUuid(), savedRecord.getStartDateTime(), savedRecord.getEndDateTime());
        return recordResponse;
    }

    @Override
    public RecordResponse getRecordByUuid(String uuid) {
        Record record = recordRepository.findByUuid(uuid);
        RecordResponse recordResponse = new RecordResponse(record.getUuid(), record.getCode(), record.getUtilisateur().getUuid(), record.getStartDateTime(), record.getEndDateTime());
        return recordResponse;    }

    @Override
    public List<RecordResponse> getRecordsByDate(String date) {
        List<Record> records = recordRepository.findByDate(date);
        List<RecordResponse> recordResponses = records.stream()
                .map(record -> new RecordResponse(record.getUuid(), record.getCode(), record.getUtilisateur().getUuid(), record.getStartDateTime(), record.getEndDateTime()))
                .collect(Collectors.toList());
                return recordResponses;
    }

    @Override
    public List<RecordResponse> getRecordsByDateRange(String start, String end) {
        List<Record> records = recordRepository.findByDateRange(start, end);
        List<RecordResponse> recordResponses = records.stream()
                .map(record -> new RecordResponse(record.getUuid(), record.getCode(), record.getUtilisateur().getUuid(), record.getStartDateTime(), record.getEndDateTime()))
                .collect(Collectors.toList());
                return recordResponses;
    }

    @Override
    public List<RecordResponse> getRecordsByUserId(String userId) {
        List<Record> records =  recordRepository.findByUserId(userId);
        List<RecordResponse> recordResponses = records.stream()
                .map(record -> new RecordResponse(record.getUuid(), record.getCode(), record.getUtilisateur().getUuid(), record.getStartDateTime(), record.getEndDateTime()))
                .collect(Collectors.toList());
                return recordResponses;
    }

    @Override
    public List<RecordResponse> getAllActiveRecords() {
        List<Record> records =  recordRepository.findAllByDeletedFalse();
        List<RecordResponse> recordResponses = records.stream()
                .map(record -> new RecordResponse(record.getUuid(), record.getCode(), record.getUtilisateur().getUuid(), record.getStartDateTime(), record.getEndDateTime()))
                .collect(Collectors.toList());
                return recordResponses;
    }

    @Override
    public List<RecordResponse> getAllDeletedRecords() {
        List<Record> records =  recordRepository.findAllByDeletedTrue();
        List<RecordResponse> recordResponses = records.stream()
                .map(record -> new RecordResponse(record.getUuid(), record.getCode(), record.getUtilisateur().getUuid(), record.getStartDateTime(), record.getEndDateTime()))
                .collect(Collectors.toList());
                return recordResponses;

    }
    @Override
    public void deleteRecord(String uuid) {
        Record record = recordRepository.findByUuid(uuid);
        if (record!= null) {
            record.setDeleted(true);
            recordRepository.save(record);
        }
    }
    @Override
    public void deleteRecordFinitivement(String uuid) {
        Record record = recordRepository.findByUuid(uuid);
        if (record!= null) {
            recordRepository.delete(record);
        }
    }
   @Override
    public RecordResponse updateRecord(String uuid, LocalDateTime start,LocalDateTime end) {
        Record record = recordRepository.findByUuid(uuid);
        if (record!= null) {
                record.setStartDateTime(start);
                record.setEndDateTime(end);
                Record recordInserted = recordRepository.save(record);
                RecordResponse recordResponse = new RecordResponse(recordInserted.getUuid(), recordInserted.getCode(), recordInserted.getUtilisateur().getUuid(), recordInserted.getStartDateTime(), recordInserted.getEndDateTime());
                return recordResponse;
        }

        return null;
    }
}
