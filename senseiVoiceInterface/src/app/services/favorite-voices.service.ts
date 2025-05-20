import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FavoriteVoicesDto {
  userUuid: string;
  voiceUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteVoicesService {
  private baseUrl = 'http://localhost:8080/api/favorites'; // Adjust if using a different port or base path

  constructor(private http: HttpClient) {}

  getAllFavorites(): Observable<FavoriteVoicesDto[]> {
    return this.http.get<FavoriteVoicesDto[]>(this.baseUrl);
  }

  getFavoriteById(id: number): Observable<FavoriteVoicesDto> {
    return this.http.get<FavoriteVoicesDto>(`${this.baseUrl}/${id}`);
  }

  createFavorite(dto: FavoriteVoicesDto): Observable<FavoriteVoicesDto> {
    return this.http.post<FavoriteVoicesDto>(this.baseUrl, dto);
  }

  deleteFavorite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
