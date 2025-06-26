package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.record.RecordRequest;
import com.example.senseiVoix.dtos.record.RecordResponse;
import com.example.senseiVoix.services.RecordService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class RecordController {

    @Autowired
    private  RecordService recordService;

    @PostMapping
    public ResponseEntity<RecordResponse> createRecord(@RequestBody RecordRequest request) throws MessagingException, IOException {
        RecordResponse response = recordService.createRecord(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<RecordResponse> getRecordByUuid(@PathVariable String uuid) {
        RecordResponse response = recordService.getRecordByUuid(uuid);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<RecordResponse>> getRecordsByDate(@PathVariable String date) {
        return ResponseEntity.ok(recordService.getRecordsByDate(date));
    }

    @GetMapping("/range")
    public ResponseEntity<List<RecordResponse>> getRecordsByDateRange(@RequestParam String start, @RequestParam String end) {
        return ResponseEntity.ok(recordService.getRecordsByDateRange(start, end));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RecordResponse>> getRecordsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(recordService.getRecordsByUserId(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<RecordResponse>> getAllActiveRecords() {
        return ResponseEntity.ok(recordService.getAllActiveRecords());
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<RecordResponse>> getAllDeletedRecords() {
        return ResponseEntity.ok(recordService.getAllDeletedRecords());
    }
    @DeleteMapping("/soft-delete/{uuid}")
    public ResponseEntity<String> softDeleteRecord(@PathVariable String uuid) {
        recordService.deleteRecord(uuid);
        return ResponseEntity.ok("Record marqué comme supprimé avec succès.");
    }

    @DeleteMapping("/permanent-delete/{uuid}")
    public ResponseEntity<String> permanentDeleteRecord(@PathVariable String uuid) {
        recordService.deleteRecordFinitivement(uuid);
        return ResponseEntity.ok("Record supprimé définitivement avec succès.");
    }
    @PutMapping("/{uuid}")
    public ResponseEntity<RecordResponse> updateRecord(@PathVariable String uuid, @RequestBody LocalDateTime start,@RequestBody LocalDateTime end) {
        RecordResponse response = recordService.updateRecord(uuid, start,end);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
