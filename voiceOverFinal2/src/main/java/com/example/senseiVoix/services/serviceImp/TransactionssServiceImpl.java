package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.transaction.TransactionssDto;
import com.example.senseiVoix.dtos.transaction.TransactionssResponse;
import com.example.senseiVoix.entities.Transactionss;
import com.example.senseiVoix.repositories.FactureRepository;
import com.example.senseiVoix.repositories.TransactionssRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionssServiceImpl {

    @Autowired
    private TransactionssRepository transactionssRepository;
    @Autowired
    private FactureRepository factureRepository;

    /**
     * Ajouter une nouvelle transaction.
     */
    public TransactionssResponse ajouterTransaction(TransactionssDto transaction) {
        Transactionss newTransaction = new Transactionss();
        newTransaction.setFacture(factureRepository.findByUuid(transaction.getFactureUuid()));
        newTransaction.setMontant(transaction.getMontant());
        newTransaction.setDateTransaction(LocalDateTime.now());
        Transactionss insertedTransaction =  transactionssRepository.save(newTransaction);
        return new TransactionssResponse(
                insertedTransaction.getUuid(),
                insertedTransaction.getCode(),
                insertedTransaction.getMontant(),
                insertedTransaction.getDateTransaction(),
                insertedTransaction.getFacture().getUuid()
        );
    }

    /**
     * Récupérer une transaction par UUID.
     */
    public TransactionssResponse getTransactionByUuid(String uuid) {
        Transactionss insertedTransaction = transactionssRepository.findByUuid(uuid);
        return new TransactionssResponse(
                insertedTransaction.getUuid(),
                insertedTransaction.getCode(),
                insertedTransaction.getMontant(),
                insertedTransaction.getDateTransaction(),
                insertedTransaction.getFacture().getUuid()
        );
    }

    /**
     * Récupérer toutes les transactions.
     */
    public List<TransactionssResponse> getAllTransactions() {
        List<Transactionss>  transactions =  transactionssRepository.findAll();
        return transactions.stream().map(insertedTransaction ->new TransactionssResponse(
                insertedTransaction.getUuid(),
                insertedTransaction.getCode(),
                insertedTransaction.getMontant(),
                insertedTransaction.getDateTransaction(),
                insertedTransaction.getFacture().getUuid()
        ) ).collect(Collectors.toList());
    }

    /**
     * Récupérer les transactions associées à une facture donnée.
     */
    public List<TransactionssResponse> getTransactionsByFacture(String factureUuid) {
        List<Transactionss>  transactions =  transactionssRepository.findByFacture(factureUuid);
        return transactions.stream().map(insertedTransaction ->new TransactionssResponse(
                insertedTransaction.getUuid(),
                insertedTransaction.getCode(),
                insertedTransaction.getMontant(),
                insertedTransaction.getDateTransaction(),
                insertedTransaction.getFacture().getUuid()
        ) ).collect(Collectors.toList());
    }

    /**
     * Récupérer les transactions d'un speaker donné.
     */
    public List<TransactionssResponse> getTransactionsBySpeaker(String speakerUuid) {
        List<Transactionss>  transactions =  transactionssRepository.findBySpeaker(speakerUuid);
        return transactions.stream().map(insertedTransaction ->new TransactionssResponse(
                insertedTransaction.getUuid(),
                insertedTransaction.getCode(),
                insertedTransaction.getMontant(),
                insertedTransaction.getDateTransaction(),
                insertedTransaction.getFacture().getUuid()
        ) ).collect(Collectors.toList());
    }

    /**
     * Mettre à jour une transaction existante.
     */
    public TransactionssResponse updateTransaction(String id, TransactionssDto updatedTransaction) {
       Transactionss existingTransaction = transactionssRepository.findByUuid(id);
            existingTransaction.setMontant(updatedTransaction.getMontant());
            existingTransaction.setDateTransaction(updatedTransaction.getDateTransaction());
            existingTransaction.setFacture(factureRepository.findByUuid(updatedTransaction.getFactureUuid()));
        Transactionss insertedTransaction = transactionssRepository.save(existingTransaction);
        return new TransactionssResponse(
                insertedTransaction.getUuid(),
                insertedTransaction.getCode(),
                insertedTransaction.getMontant(),
                insertedTransaction.getDateTransaction(),
                insertedTransaction.getFacture().getUuid()
        );

    }

    /**
     * Supprimer une transaction par ID.
     */
    public void deleteTransaction(String id) {
        Transactionss existingTransaction = transactionssRepository.findByUuid(id);
        if (existingTransaction!= null) {
            existingTransaction.setDeleted(true);
            transactionssRepository.save(existingTransaction);
        }
    }
}
