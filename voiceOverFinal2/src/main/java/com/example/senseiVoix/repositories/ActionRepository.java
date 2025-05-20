package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActionRepository extends JpaRepository<Action, Long> {
    @Query("select a from Action  a where a.uuid=:uuid")
    Action findByUuid(@Param("uuid") String uuid);
    @Query("select a from Action  a where a.voice.speaker.uuid=:uuid")
    List<Action> findBySpeakerUuid(@Param("uuid") String uuid);
    @Query("select a from Action  a where a.project.uuid=:uuid")
    List<Action> findByProject(@Param("uuid") String uuid);
}
