package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.record.RecordRequest;
import com.example.senseiVoix.dtos.record.RecordResponse;

import jakarta.mail.MessagingException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

public interface RecordService {
    RecordResponse createRecord(RecordRequest request) throws MessagingException, IOException;

    RecordResponse getRecordByUuid(String uuid);

    List<RecordResponse> getRecordsByDate(String date);

    List<RecordResponse> getRecordsByDateRange(String start, String end);

    List<RecordResponse> getRecordsByUserId(String userId);

    List<RecordResponse> getAllActiveRecords();

    List<RecordResponse> getAllDeletedRecords();

    void deleteRecord(String uuid);

    void deleteRecordFinitivement(String uuid);

    RecordResponse updateRecord(String uuid, LocalDateTime start,LocalDateTime end);
}
