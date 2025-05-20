import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root'
  })

  export class FactureService {
    constructor(private http: HttpClient) {}


    getFactureById(factureId: number): Observable<any> {
        return this.http.get<any>(`http://localhost:8080/api/factures/${factureId}`);
    }

    getFacturePdf(uuid: string): Observable<Blob> {
        return this.http.get(`http://localhost:8080/api/factures/${uuid}/downloadPdf`, { responseType: 'blob' });
      }

  }
