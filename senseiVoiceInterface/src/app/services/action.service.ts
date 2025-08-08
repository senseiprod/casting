import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- INTERFACES ---
export interface Action {
  id: number;
  text: string;
  statutAction: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'LOCKED' | 'GENERE' | string;
  language: string;
  audioGenerated: string; // Base64 string from backend
  dateCreation: string;
  voice?: any;
  project?: any;
  utilisateur?: any;
}
export class ActionRequest {
  text: string;
  statutAction: string;
  voiceUuid: string;
  utilisateurUuid: string;
  language: string;
  projectUuid: string;
  audioGenerated: Blob;
  constructor( text: string, statutAction: string, voiceUuid: string, utilisateurUuid: string, language: string, projectUuid: string, audioGenerated: Blob ) {
    this.text = text;
    this.statutAction = statutAction;
    this.voiceUuid = voiceUuid;
    this.utilisateurUuid = utilisateurUuid;
    this.language = language;
    this.projectUuid = projectUuid;
    this.audioGenerated = audioGenerated;
  }
}
export interface ActionRequestLahajati {
  text: string;
  voiceUuid: string;
  utilisateurUuid: string;
  language: string;
  projectUuid: string;
  dialectId?: string;
  performanceId?: string;
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
  audioGenerated: string; // Base64 string
}
export interface LockedActionResponse {
  id: number;
  uuid: string;
  status: string;
  message: string;
}
export interface UnlockPaymentResponse {
  actionId: number;
  approvalUrl: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  private apiUrl = `${environment.apiUrl}/api/actions`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  
  // --- METHODS FOR LOCKED AUDIO WORKFLOW ---

  createLockedAction(request: ActionRequestLahajati): Observable<LockedActionResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<LockedActionResponse>(`${this.apiUrl}/create-locked-action`, request, { headers });
  }

  initiateUnlockPayment(actionId: number): Observable<UnlockPaymentResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<UnlockPaymentResponse>(`${this.apiUrl}/${actionId}/initiate-unlock-payment`, {}, { headers });
  }

  getActionStatus(actionId: number): Observable<Action> {
    const headers = this.getAuthHeaders();
    return this.http.get<Action>(`${this.apiUrl}/status/${actionId}`, { headers });
  }

  /**
   * THIS IS THE METHOD THAT FIXES THE ERROR.
   * Sets up a bank transfer for an existing LOCKED action.
   * @param actionId The database ID of the locked action.
   */
  setupBankTransferForUnlock(actionId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/${actionId}/setup-bank-transfer-unlock`, {}, { headers });
  }

  // --- EXISTING METHODS ---

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

  paymentSuccess(actionId: number, paymentId: string, payerId: string): Observable<any> {
    const params = new HttpParams()
      .set('paymentId', paymentId)
      .set('PayerID', payerId);
    return this.http.get(`${this.apiUrl}/payment/success/${actionId}`, { params });
  }

  paymentCancel(actionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/cancel/${actionId}`);
  }

  testSuccess(actionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/test-success/${actionId}`);
  }

  createActionWithBankTransfer(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-action-bank-transfer`, request);
  }

  createActionLahajatiWithBankTransfer(actionRequest: ActionRequestLahajati): Observable<any> {
    const url = `${this.apiUrl}/lahajati/create-action-bank-transfer`;
    return this.http.post<any>(url, actionRequest);
  }

  createActionWithPaypal(actionRequest: ActionRequestLahajati): Observable<any> {
    const url = `${this.apiUrl}/lahajati/create-action-paypal`;
    return this.http.post<any>(url, actionRequest);
  }

  generateElevenLabsAudioWithBalance(
    text: string,
    statutAction: string,
    voiceUuid: string,
    utilisateurUuid: string,
    language: string,
    projectUuid: string,
    audioFile: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('statutAction', statutAction);
    formData.append('voiceUuid', voiceUuid);
    formData.append('utilisateurUuid', utilisateurUuid);
    formData.append('language', language);
    formData.append('projectUuid', projectUuid);
    formData.append('audioFile', audioFile);
    return this.http.post(`${this.apiUrl}/generate-elevenlabs-audio-with-balance`, formData);
  }

  generateLahajatiAudioWithBalance(
    text: string,
    statutAction: string,
    voiceUuid: string,
    utilisateurUuid: string,
    language: string,
    projectUuid: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('text', text)
      .set('statutAction', statutAction)
      .set('voiceUuid', voiceUuid)
      .set('utilisateurUuid', utilisateurUuid)
      .set('language', language)
      .set('projectUuid', projectUuid);
    return this.http.post(`${this.apiUrl}/lahajati-generate-audio-with-balance`, params);
  }
}