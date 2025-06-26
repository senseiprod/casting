package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.client.ClientRequest;
import com.example.senseiVoix.dtos.client.ClientResponse;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.services.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;

    /**
     * Obtenir la liste de tous les clients.
     */
    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        List<ClientResponse> clients = clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }

    /**
     * Obtenir un client par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        Optional<Client> client = clientService.getClientById(id);
        return client.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Obtenir un client par son UUID.
     */
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<ClientResponse> getClientByUuid(@PathVariable String uuid) {
        ClientResponse clientResponse = clientService.getClientByUuid(uuid);
        return ResponseEntity.ok(clientResponse);
    }

    /**
     * Obtenir un client par son e-mail.
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ClientResponse> getClientByEmail(@PathVariable String email) {
        ClientResponse clientResponse = clientService.getClientByEmail(email);
        return ResponseEntity.ok(clientResponse);
    }

    /**
     * Obtenir un client par son niveau de fidélité.
     */
    @GetMapping("/fidelite/{fidelite}")
    public ResponseEntity<ClientResponse> getClientByFidelite(@PathVariable String fidelite) {
        ClientResponse clientResponse = clientService.getClientByFidelite(fidelite);
        return ResponseEntity.ok(clientResponse);
    }

    /**
     * Obtenir la liste de tous les clients non supprimés.
     */
    @GetMapping("/not-deleted")
    public ResponseEntity<List<ClientResponse>> getClientsNotDeleted() {
        List<ClientResponse> clients = clientService.getClientsNotDeleted();
        return ResponseEntity.ok(clients);
    }

    /**
     * Obtenir la liste de tous les clients supprimés (soft delete).
     */
    @GetMapping("/deleted")
    public ResponseEntity<List<ClientResponse>> getClientsDeleted() {
        List<ClientResponse> clientsDeleted = clientService.getClientsDeleted();
        return ResponseEntity.ok(clientsDeleted);
    }

    /**
     * Créer un nouveau client.
     */
    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@RequestBody ClientRequest clientRequest) {
        ClientResponse newClient = clientService.createClient(clientRequest);
        return ResponseEntity.ok(newClient);
    }

    /**
     * Mettre à jour un client existant via son UUID.
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<ClientResponse> updateClient(@PathVariable String uuid, @RequestBody ClientRequest clientRequest) {
        ClientResponse updatedClient = clientService.updateClient(uuid, clientRequest);
        if (updatedClient != null) {
            return ResponseEntity.ok(updatedClient);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Supprimer (soft delete) un client via son UUID.
     */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteClient(@PathVariable String uuid) {
        try {
            clientService.deleteClient(uuid);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
