import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private backendDomain = 'http://127.0.0.1:4201/api'; // Reemplaza esto con el dominio de tu servidor

  constructor(private http: HttpClient) {}

  descargarAudio(videoPath: string): Observable<any> {
    const endpoint = `${this.backendDomain}/descargarAudio`;
    return this.http.post(endpoint, { videoPath });
  }

  descargarArchivo(archivoPath: string): Observable<any> {
    const endpoint = `${this.backendDomain}/descargarArchivo`;
    return this.http.post(endpoint, { archivoPath });
  }
}
