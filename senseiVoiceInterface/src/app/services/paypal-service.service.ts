import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private baseUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) {}

  /**
   * Créer un paiement PayPal et obtenir l'URL d'approbation
   * @param method Méthode de paiement (ex: PayPal)
   * @param amount Montant du paiement
   * @param currency Devise du paiement (ex: USD)
   * @param description Description du paiement
   * @param clientUuid Identifiant unique du client
   * @returns L'URL de redirection vers PayPal
   */
  createPayment(method: string, amount: number, currency: string, description: string, clientUuid: string): Observable<any> {
    const params = new HttpParams()
      .set('method', method)
      .set('amount', amount.toString())
      .set('currency', currency)
      .set('description', description)
      .set('clientUuid', clientUuid);

    return this.http.post(`${this.baseUrl}/create`, {}, { params, responseType: 'text' });
  }

  /**
   * Vérifier le succès d'un paiement
   * @param paymentId ID du paiement
   * @param payerId ID du payeur
   * @param clientUuid Identifiant unique du client
   * @returns Un message de succès ou d'échec
   */
  paymentSuccess(paymentId: string, payerId: string, clientUuid: string): Observable<string> {
    const params = new HttpParams()
      .set('paymentId', paymentId)
      .set('PayerID', payerId)
      .set('clientUuid', clientUuid);

    return this.http.get(`${this.baseUrl}/success`, { params, responseType: 'text' });
  }

  /**
   * Annulation d'un paiement
   * @returns Un message indiquant que le paiement a été annulé
   */
  paymentCancel(): Observable<string> {
    return this.http.get(`${this.baseUrl}/cancel`, { responseType: 'text' });
  }

  /**
   * Gérer les erreurs de paiement
   * @returns Un message d'erreur
   */
  paymentError(): Observable<string> {
    return this.http.get(`${this.baseUrl}/error`, { responseType: 'text' });
  }
}
