package com.example.senseiVoix.dtos.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PushSubscriptionRequest {
    private String endpoint;
    private String p256dhKey;
    private String authKey;
    private String userAgent;
}
