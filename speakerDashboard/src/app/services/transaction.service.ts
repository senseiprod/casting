import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TransactionssDto {
  code: string;
  montant: number;
  dateTransaction: string; // ISO format: '2025-04-11T10:00:00'
  factureUuid: string;
}

export interface TransactionssResponse {
  uuid: string;
  code: string;
  montant: number;
  dateTransaction: string;
  factureUuid: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'http://localhost:8080/api/transactions';

  constructor(private http: HttpClient) {}

  createTransaction(transaction: TransactionssDto): Observable<TransactionssResponse> {
    return this.http.post<TransactionssResponse>(this.apiUrl, transaction);
  }

  getTransactionByUuid(uuid: string): Observable<TransactionssResponse> {
    return this.http.get<TransactionssResponse>(`${this.apiUrl}/${uuid}`);
  }

  getAllTransactions(): Observable<TransactionssResponse[]> {
    return this.http.get<TransactionssResponse[]>(this.apiUrl);
  }

  getTransactionsByFacture(factureUuid: string): Observable<TransactionssResponse[]> {
    return this.http.get<TransactionssResponse[]>(`${this.apiUrl}/facture/${factureUuid}`);
  }

  getTransactionsBySpeaker(speakerUuid: string): Observable<TransactionssResponse[]> {
    return this.http.get<TransactionssResponse[]>(`${this.apiUrl}/speaker/${speakerUuid}`);
  }

  updateTransaction(uuid: string, updatedTransaction: TransactionssDto): Observable<TransactionssResponse> {
    return this.http.put<TransactionssResponse>(`${this.apiUrl}/${uuid}`, updatedTransaction);
  }

  deleteTransaction(uuid: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${uuid}`);
  }
}
