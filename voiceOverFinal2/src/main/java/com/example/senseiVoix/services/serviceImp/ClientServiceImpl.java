package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.IMapClassWithDto;

import com.example.senseiVoix.dtos.client.ClientRequest;
import com.example.senseiVoix.dtos.client.ClientResponse;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.services.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientServiceImpl implements ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private IMapClassWithDto<Client, ClientRequest> requestMapper;

    @Override
    public List<ClientResponse> getAllClients() {
        List<Client> clients = clientRepository.findAll();
        List<ClientResponse> listclient = new ArrayList<>();
        for(Client client : clients){
            ClientResponse clientResponse = new ClientResponse(client.getUuid(), client.getCode(), client.getNom(), client.getPrenom(), client.getEmail(), client.getMotDePasse(), client.getPhone(), client.getUsername(), client.getRole(), client.getBalance(), client.getFidilite());
            listclient.add(clientResponse);
        }
        return listclient;
    }

    @Override
    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    @Override
    public ClientResponse getClientByUuid(String uuid) {
        Client client = clientRepository.findByUuid(uuid);
        ClientResponse clientResponse = new ClientResponse(client.getUuid(), client.getCode(), client.getNom(), client.getPrenom(), client.getEmail(), client.getMotDePasse(), client.getPhone(), client.getUsername(), client.getRole(), client.getBalance(), client.getFidilite());
        return clientResponse;
    }

    @Override
    public ClientResponse getClientByEmail(String email) {
        Client client = clientRepository.findByEmail(email);
        ClientResponse clientResponse = new ClientResponse(client.getUuid(), client.getCode(), client.getNom(), client.getPrenom(), client.getEmail(), client.getMotDePasse(), client.getPhone(), client.getUsername(), client.getRole(), client.getBalance(), client.getFidilite());
        return clientResponse;    }

    @Override
    public ClientResponse getClientByFidelite(String fidilite) {
        Client client = clientRepository.findByfidelite(fidilite);
        ClientResponse clientResponse = new ClientResponse(client.getUuid(), client.getCode(), client.getNom(), client.getPrenom(), client.getEmail(), client.getMotDePasse(), client.getPhone(), client.getUsername(), client.getRole(), client.getBalance(), client.getFidilite());
        return clientResponse;    }

    @Override
    public List<ClientResponse> getClientsNotDeleted() {
        List<Client> clients = clientRepository.findAllNotDeleted();
        List<ClientResponse> listclient = new ArrayList<>();
        for(Client client : clients){
            ClientResponse clientResponse = new ClientResponse(client.getUuid(), client.getCode(), client.getNom(), client.getPrenom(), client.getEmail(), client.getMotDePasse(), client.getPhone(), client.getUsername(), client.getRole(), client.getBalance(), client.getFidilite());
            listclient.add(clientResponse);
        }
        return listclient;
    }

    @Override
    public List<ClientResponse> getClientsDeleted() {
        List<Client> clients = clientRepository.findAllDeleted();
        List<ClientResponse> listclient = new ArrayList<>();
        for(Client client : clients){
            ClientResponse clientResponse = new ClientResponse(client.getUuid(), client.getCode(), client.getNom(), client.getPrenom(), client.getEmail(), client.getMotDePasse(), client.getPhone(), client.getUsername(), client.getRole(), client.getBalance(), client.getFidilite());
            listclient.add(clientResponse);
        }
        return listclient;    }

    @Override
    public ClientResponse createClient(ClientRequest clientRequest) {
        if (clientRequest != null) {
            Client client = requestMapper.convertToEntity(clientRequest, Client.class);
            Client savedClient = clientRepository.save(client);
            ClientResponse clientResponse = new ClientResponse(savedClient.getUuid(), savedClient.getCode(), savedClient.getNom(), savedClient.getPrenom(), savedClient.getEmail(), savedClient.getMotDePasse(), savedClient.getPhone(), savedClient.getUsername(), savedClient.getRole(), savedClient.getBalance(), savedClient.getFidilite());
            return clientResponse;        }
        return null;
    }

    @Override
    public ClientResponse updateClient(String uuid, ClientRequest clientRequest) {
        Client client = clientRepository.findByUuid(uuid);
        if (client != null) {
            client.setEmail(clientRequest.getEmail());
            client.setFidilite(clientRequest.getFidilite());
            Client updatedClient = clientRepository.save(client);
            ClientResponse clientResponse = new ClientResponse(updatedClient.getUuid(), updatedClient.getCode(), updatedClient.getNom(), updatedClient.getPrenom(), updatedClient.getEmail(), updatedClient.getMotDePasse(), updatedClient.getPhone(), updatedClient.getUsername(), updatedClient.getRole(), updatedClient.getBalance(), updatedClient.getFidilite());
            return clientResponse;        }
        return null;
    }

    @Override
    public void deleteClient(String uuid) {
        Client client = clientRepository.findByUuid(uuid);
        if (client != null) {
            client.setDeleted(true);
            clientRepository.save(client);
        } else {
            throw new RuntimeException("Client not found with uuid: " + uuid);
        }
    }
}
