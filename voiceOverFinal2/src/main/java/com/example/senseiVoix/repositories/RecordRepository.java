package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Record;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecordRepository extends JpaRepository<Record, Long> {
    @Query("select r from Record  r where r.uuid=:uuid")
    Record findByUuid(@Param("uuid") String uuid);
    @Query("select r from Record r where r.startDateTime =:date")
    List<Record> findByDate(@Param("date") String date);
    @Query("select r from Record r where r.startDateTime BETWEEN :start AND :end")
    List<Record> findByDateRange(@Param("start") String start, @Param("end") String end);
    @Query("select r from Record r where r.utilisateur.uuid =:userId")
    List<Record> findByUserId(@Param("userId") String userId);
    @Query("select d from Record d where d.deleted = false ")
    List<Record> findAllByDeletedFalse();
    @Query("select d from Record d where d.deleted = true ")
    List<Record> findAllByDeletedTrue();

}
