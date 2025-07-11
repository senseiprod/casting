package com.example.senseiVoix.controllers;
import com.example.senseiVoix.dtos.transaction.TransactionssDto;
import com.example.senseiVoix.dtos.transaction.TransactionssResponse;
import com.example.senseiVoix.services.serviceImp.TransactionssServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionssController {

    @Autowired
    private TransactionssServiceImpl transactionssService;

    /**
     * Ajouter une nouvelle transaction.
     */
    @PostMapping
    public ResponseEntity<TransactionssResponse> createTransaction(@RequestBody TransactionssDto transactionDto) {
        TransactionssResponse transaction = transactionssService.ajouterTransaction(transactionDto);
        return ResponseEntity.ok(transaction);
    }

    /**
     * Récupérer une transaction par UUID.
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<TransactionssResponse> getTransactionByUuid(@PathVariable String uuid) {
        TransactionssResponse transaction = transactionssService.getTransactionByUuid(uuid);
        return ResponseEntity.ok(transaction);
    }

    /**
     * Récupérer toutes les transactions.
     */
    @GetMapping
    public ResponseEntity<List<TransactionssResponse>> getAllTransactions() {
        List<TransactionssResponse> transactions = transactionssService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    /**
     * Récupérer les transactions associées à une facture donnée.
     */
    @GetMapping("/facture/{factureUuid}")
    public ResponseEntity<List<TransactionssResponse>> getTransactionsByFacture(@PathVariable String factureUuid) {
        List<TransactionssResponse> transactions = transactionssService.getTransactionsByFacture(factureUuid);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Récupérer les transactions d'un speaker donné.
     */
    @GetMapping("/speaker/{speakerUuid}")
    public ResponseEntity<List<TransactionssResponse>> getTransactionsBySpeaker(@PathVariable String speakerUuid) {
        List<TransactionssResponse> transactions = transactionssService.getTransactionsBySpeaker(speakerUuid);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Mettre à jour une transaction existante.
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<TransactionssResponse> updateTransaction(@PathVariable String uuid, @RequestBody TransactionssDto updatedTransaction) {
        TransactionssResponse transaction = transactionssService.updateTransaction(uuid, updatedTransaction);
        return ResponseEntity.ok(transaction);
    }

    /**
     * Supprimer une transaction par UUID (soft delete).
     */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<String> deleteTransaction(@PathVariable String uuid) {
        transactionssService.deleteTransaction(uuid);
        return ResponseEntity.ok("Transaction supprimée avec succès");
    }
}
