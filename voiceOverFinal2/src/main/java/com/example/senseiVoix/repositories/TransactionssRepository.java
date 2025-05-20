package com.example.senseiVoix.repositories;
import com.example.senseiVoix.entities.Transactionss;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionssRepository extends JpaRepository<Transactionss, Long> {

    @Query("select t from Transactionss t where t.facture.uuid=:uuid")
    List<Transactionss> findByFacture(@Param("uuid") String uuid);
    @Query("select t from Transactionss t where t.uuid=:uuid")
    Transactionss findByUuid(@Param("uuid") String uuid);
    @Query("select t from Transactionss t where t.facture.speaker.uuid=:uuid")
    List<Transactionss> findBySpeaker(@Param("uuid") String uuid);

}
