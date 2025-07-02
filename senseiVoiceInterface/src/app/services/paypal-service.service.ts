import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private baseUrl = `${environment.apiUrl}/api/payment`;

  constructor(private http: HttpClient) {}

  chargeBalance(uuid: string, amount: number) {
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('amount', amount.toString());

    return this.http.post<{ redirectUrl: string }>(
      `${this.baseUrl}/charge-balance`,
      null,
      { params }
    );
  }
}
