package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Audio;
import com.example.senseiVoix.enumeration.TypeAudio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AudioRepository extends JpaRepository<Audio, Long> {
     @Query("SELECT a FROM Audio a WHERE a.speaker.uuid = :speakerId")
    List<Audio> findBySpeakerId(@Param("speakerId")String speakerId);

        @Query("SELECT a FROM Audio a WHERE a.typeAudio = :typeAudio AND a.deleted = false")
    List<Audio> findByTypeAudio(@Param("typeAudio") TypeAudio typeAudio);
    
    @Query("SELECT a FROM Audio a WHERE a.speaker.uuid = :speakerUuid AND a.deleted = false")
    List<Audio> findBySpeakerUuid(@Param("speakerUuid") String speakerUuid);
    
    @Query("SELECT a FROM Audio a WHERE a.speaker.uuid = :speakerUuid AND a.typeAudio = :typeAudio AND a.deleted = false")
    List<Audio> findBySpeakerUuidAndTypeAudio(@Param("speakerUuid") String speakerUuid, @Param("typeAudio") TypeAudio typeAudio);
    
    @Query("SELECT a FROM Audio a WHERE a.format = :format AND a.deleted = false")
    List<Audio> findByFormat(@Param("format") String format);
    
    @Query("SELECT COUNT(a) FROM Audio a WHERE a.speaker.uuid = :speakerUuid AND a.deleted = false")
    Integer countBySpeakerUuid(@Param("speakerUuid") String speakerUuid);
    
    @Query("SELECT a FROM Audio a WHERE a.deleted = false")
    List<Audio> findAllNotDeleted();
}
