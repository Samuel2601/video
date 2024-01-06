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
        if(response.listaPath){
          response.listaPath.forEach((element:any) => {
            console.log(element.nombre);
            this.descargarArchivo(element.nombre);
          });
        }   
      },
      (error) => {
        console.error('Error durante la extracción de audio', error);
      }
    );
  }

  descargarArchivo(archivo: string): void {
    const archivoPath = archivo; // Reemplaza esto con la ruta correcta
    this._adminService.descargarArchivo(archivoPath).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = archivoPath;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.borrar(archivoPath);
      },
      error => {
        console.error('Error al descargar el archivo:', error);
      }
    );
  }
  borrar(archivo: string){
    this._adminService.borrarArchivo(archivo).subscribe(reposne=>{
      console.log(reposne);
    });
  }
}
