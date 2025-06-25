import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface Action {
  id: number;
  text: string;
  statutAction: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | string;
  language: string;
  audioGenerated: string; // ou `Blob` selon ce que tu reçois
  dateCreation: string;
  voice?: any; // tu peux créer une interface Voix si nécessaire
}

export class ActionRequest {
  text: string;
  statutAction: string; // Enum string value
  voiceUuid: string;
  utilisateurUuid: string;
  language: string;
  projectUuid: string;
  audioGenerated: Blob;

  constructor(
    text: string,
    statutAction: string,
    voiceUuid: string,
    utilisateurUuid: string,
    language: string,
    projectUuid: string,
    audioGenerated: Blob
  ) {
    this.text = text;
    this.statutAction = statutAction;
    this.voiceUuid = voiceUuid;
    this.utilisateurUuid = utilisateurUuid;
    this.language = language;
    this.projectUuid = projectUuid;
    this.audioGenerated = audioGenerated;
  }
}

export interface ActionResponse {
  uuid: string;
  code: string;
  text: string;
  statutAction: string;
  language: string;
  voiceUuid: string;
  dateCreation: Date;
  utilisateurUuid: string;
  audioGenerated: string;
}


@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private apiUrl = `${environment.apiUrl}/api/actions`;

  constructor(private http: HttpClient) {}

  getActionBySpeakerUuid(uuid: string | null): Observable<ActionResponse[]> {
    return this.http.get<ActionResponse[]>(`${this.apiUrl}/speaker/${uuid}`);
  }
  createAction(actionFormData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, actionFormData);
  }


  validateAction(uuid: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate/${uuid}`, {});
  }

  deleteAction(uuid: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${uuid}`);
  }

  sendNotification(utilisateurUuid: string, speakerUuid: string, actionUuid: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, null, {
      params: { utilisateurUuid, speakerUuid, actionUuid }
    });
  }

  rejectAction(uuid: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reject/${uuid}`, {});
  }

  processPayment(clientUuid: string, actionUuid: string, amount: number, paypalId: string, paypalPayerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-payment`, null, {
      params: { clientUuid, actionUuid, amount: amount.toString(), paypalId, paypalPayerId }
    });
  }
  getActionsByProject(uuid: string): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/by-project/${uuid}`);
  }

  getActionByUuid(uuid: string): Observable<ActionResponse> {
    return this.http.get<ActionResponse>(`${this.apiUrl}/uuid/${uuid}`);
  }
  createActionPayed(requestBody: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-action`, requestBody);
  }

  // Called on PayPal success
  paymentSuccess(actionId: number, paymentId: string, payerId: string): Observable<any> {
    const params = new HttpParams()
      .set('paymentId', paymentId)
      .set('PayerID', payerId);
    return this.http.get(`${this.apiUrl}/payment/success/${actionId}`, { params });
  }

  // Called on PayPal cancel
  paymentCancel(actionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/cancel/${actionId}`);
  }

  // Used for testing success endpoint manually (bypass PayPal)
  testSuccess(actionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/test-success/${actionId}`);
  }

  // Get temporary voice storage (debug)
  getVoiceStorage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/debug/voice-storage`);
  }

  // Clear temporary voice storage (debug)
  clearVoiceStorage(): Observable<any> {
    return this.http.post(`${this.apiUrl}/debug/clear-voice-storage`, {});
  }
}
