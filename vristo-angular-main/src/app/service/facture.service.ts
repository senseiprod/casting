import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';



@Injectable({
    providedIn: 'root'
  })

  export class FactureService {
    constructor(private http: HttpClient) {}


    getFactureById(factureId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/api/factures/${factureId}`);
    }

    getFacturePdf(uuid: string): Observable<Blob> {
        return this.http.get(`${environment.apiUrl}/api/factures/${uuid}/downloadPdf`, { responseType: 'blob' });
      }

  }
