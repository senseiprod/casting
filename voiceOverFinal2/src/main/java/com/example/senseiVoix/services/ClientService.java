package com.example.senseiVoix.services;


import com.example.senseiVoix.dtos.client.ClientRequest;
import com.example.senseiVoix.dtos.client.ClientResponse;
import com.example.senseiVoix.entities.Client;

import java.util.List;
import java.util.Optional;

public interface ClientService {
    List<ClientResponse> getAllClients();
    Optional<Client> getClientById(Long id);
    ClientResponse getClientByUuid(String uuid);
    ClientResponse getClientByEmail(String email);
    ClientResponse getClientByFidelite(String fidilite);
    List<ClientResponse> getClientsNotDeleted();
    List<ClientResponse> getClientsDeleted();
    ClientResponse createClient(ClientRequest client);
    ClientResponse updateClient(String uuid, ClientRequest client);
    void deleteClient(String uuid);
}
