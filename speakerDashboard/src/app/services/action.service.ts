import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
