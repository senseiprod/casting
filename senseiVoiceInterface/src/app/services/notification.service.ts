import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationResponse {
  id: number;
  uuid: string;
  title: string;
  message: string;
  type: string;
  status: string;
  senderName: string;
  relatedEntityId: string;
  relatedEntityType: string;
  actionUrl: string;
  createdAt: string;
  readAt: string | null;
  metadata: string;
}
export interface NotificationRequest {
  title: string;
  message: string;
  type: string;
  recipientUuid: string;
  relatedEntityId: string;
  relatedEntityType: string;
  actionUrl: string;
  metadata: string;
  sendPush: boolean;
}
export interface PushSubscriptionRequest {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent: string;
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/notifications'; // À adapter selon ton backend

  constructor(private http: HttpClient) {}

  getUserNotifications(userUuid: string, page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user/${userUuid}`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getFilteredNotifications(userUuid: string, type?: string, status?: string, page = 0, size = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.baseUrl}/user/${userUuid}/filtered`, { params });
  }

  getRecentNotifications(userUuid: string, hours = 24): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.baseUrl}/user/${userUuid}/recent`, {
      params: new HttpParams().set('hours', hours)
    });
  }

  getUnreadCount(userUuid: string): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.baseUrl}/user/${userUuid}/unread-count`);
  }

  createNotification(request: NotificationRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}`, request, { responseType: 'text' });
  }

  markAsRead(notificationId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/${notificationId}/read`, {}, { responseType: 'text' });
  }

  markAllAsRead(userUuid: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/user/${userUuid}/read-all`, {}, { responseType: 'text' });
  }

  deleteNotification(notificationId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${notificationId}`, { responseType: 'text' });
  }

  subscribeToPush(userUuid: string, request: PushSubscriptionRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/push/subscribe/${userUuid}`, request, { responseType: 'text' });
  }

  unsubscribeFromPush(userUuid: string, endpoint: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/push/unsubscribe/${userUuid}`, null, {
      params: new HttpParams().set('endpoint', endpoint),
      responseType: 'text'
    });
  }

  sendPushToUser(userUuid: string, title: string, message: string): Observable<string> {
    const params = new HttpParams().set('title', title).set('message', message);
    return this.http.post(`${this.baseUrl}/push/send/${userUuid}`, null, {
      params,
      responseType: 'text'
    });
  }

  sendPushToAll(title: string, message: string): Observable<string> {
    const params = new HttpParams().set('title', title).set('message', message);
    return this.http.post(`${this.baseUrl}/push/broadcast`, null, {
      params,
      responseType: 'text'
    });
  }
}
