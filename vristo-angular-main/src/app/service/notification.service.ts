// notification.service.ts
import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private stompClient: Client;
    private messageCallback: ((msg: any) => void) | null = null;

    constructor() {
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
        reconnectDelay: 5000,
      });

      this.stompClient.onConnect = () => {
        this.stompClient.subscribe('/topic/admin', (message: Message) => {
          const notif = JSON.parse(message.body);
          if (this.messageCallback) {
            this.messageCallback(notif);
          }
        });
      };

      this.stompClient.activate();
    }

    onMessage(callback: (msg: any) => void) {
      this.messageCallback = callback;
    }
  }

