import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private backendDomain = 'https://1rp5mk0w-4201.use2.devtunnels.ms/api';//'http://127.0.0.1:4201/api'//'https://ptw2325t-4201.use2.devtunnels.ms/api'//; // Reemplaza esto con el dominio de tu servidor

  constructor(private http: HttpClient) {}

  descargarAudio(
    videoPath: string,
    rangoSeleccionado:number): Observable<any> {
    const endpoint = `${this.backendDomain}/descargarAudio`;
    return this.http.post(endpoint, { videoPath:videoPath,rangoSeleccionado:rangoSeleccionado });
  }
  descargar(info: any,formato:any,dispositivo:any): Observable<any> {
    const endpoint = `${this.backendDomain}/descargar`;
    return this.http.post(endpoint, { info:info, formato:formato,dispositivo:dispositivo});
  }
  
  descargarArchivo(nombreArchivo: string): Observable<Blob> {
    const url = `${this.backendDomain}/descargarArchivo/${nombreArchivo}`;
    return this.http.get(url, { responseType: 'blob' });
  }
  borrarArchivo(nombreArchivo: string): Observable<any> {
    const url = `${this.backendDomain}/borrarArchivo/${nombreArchivo}`;
    return this.http.delete(url);
  }
}
