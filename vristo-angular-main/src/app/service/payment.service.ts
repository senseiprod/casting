import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = `${environment.apiUrl}/api/demandes/en-attente`; // Update with your actual API URL

  private paymentsUrl = `${environment.apiUrl}/api/payments/completed`;


  private validationUrl = `${environment.apiUrl}/api/payments/completed`;

  constructor(private http: HttpClient) { }

  // Method to fetch all payments from the backend
  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
