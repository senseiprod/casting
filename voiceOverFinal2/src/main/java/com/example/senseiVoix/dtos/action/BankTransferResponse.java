package com.example.senseiVoix.dtos.action;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankTransferResponse {
    private Long actionId;
    private String libelle;
    private String rib;
    private double price;
    private String message;
    private String bankName;
    private String accountHolder;

    
}
