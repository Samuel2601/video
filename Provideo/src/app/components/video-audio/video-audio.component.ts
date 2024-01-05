import { Component } from '@angular/core';
import { AdminService } from 'src/app/admin.service';

@Component({
  selector: 'app-video-audio',
  templateUrl: './video-audio.component.html',
  styleUrls: ['./video-audio.component.scss']
})
export class VideoAudioComponent {
  videoUrl: string = '';
  constructor(private _adminService: AdminService) {}
  descargarAudio(): void {
    const videoPath = this.videoUrl; // Reemplaza esto con la ruta correcta
    this._adminService.descargarAudio(videoPath).subscribe(
      (response) => {
        console.log('Extracción de audio completa', response);
      },
      (error) => {
        console.error('Error durante la extracción de audio', error);
      }
    );
  }

  descargarArchivo(archivo: string): void {
    const archivoPath = '/ruta/al/archivo.mp3'; // Reemplaza esto con la ruta correcta
    this._adminService.descargarArchivo(archivoPath).subscribe(
      (response) => {
        console.log('Descarga de archivo completa', response);
      },
      (error) => {
        console.error('Error durante la descarga del archivo', error);
      }
    );
  }
}
