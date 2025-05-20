import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://localhost:8080/api/demandes/en-attente'; // Update with your actual API URL

  private paymentsUrl = 'http://localhost:8080/api/payments/completed';


  private validationUrl = 'http://localhost:8080/api/payments/completed'

  constructor(private http: HttpClient) { }

  // Method to fetch all payments from the backend
  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
