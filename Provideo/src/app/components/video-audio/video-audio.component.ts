import { Component, OnInit} from '@angular/core';
import { AdminService } from 'src/app/admin.service';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-video-audio',
  templateUrl: './video-audio.component.html',
  styleUrls: ['./video-audio.component.scss']
})
export class VideoAudioComponent implements OnInit {
  rangoSeleccionado: number =1;
  formatoSeleccionado: number =1;
  plataformaSeleccionada: string ='pc';
  videoUrl: string = '';
  onlist=false;

  constructor(private _adminService: AdminService,private platform: Platform) {}

  ngOnInit(): void {
    this.verificarTipoDispositivo();
  }
  descargarAudio(): void {
    if(this.videoUrl){
      const videoPath = this.videoUrl; // Reemplaza esto con la ruta correcta
      this._adminService.descargarAudio(videoPath,this.rangoSeleccionado,this.formatoSeleccionado,this.plataformaSeleccionada).subscribe(
        (response) => {
          console.log('Extracción de audio completa', response);
          if(response.listaPath){
            response.listaPath.forEach((element:any) => {
              
              this.descargarArchivo(element.nombre);
            });
          }   
        },
        (error) => {
          console.error('Error durante la extracción de audio', error);
        }
      );
    }    
  }

  verificarTipoDispositivo() {
    if (this.platform.isBrowser) {
      this.plataformaSeleccionada == 'pc';
    } else {
      this.plataformaSeleccionada == 'movil';
    }
  }

  onUrlChange(){
    const url = new URL(this.videoUrl);
    if (url.searchParams.get('start_radio')||url.searchParams.get('index')) {
      this.onlist=true;
    } else {
      this.onlist=false;
    }
  }

  descargarArchivo(archivo: string): void {
    const archivoPath = archivo; // Reemplaza esto con la ruta correcta
    this._adminService.descargarArchivo(archivoPath).subscribe(
      (data: Blob) => {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = decodeURIComponent(archivoPath) ;
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
    console.log(archivo);
    this._adminService.borrarArchivo(archivo).subscribe(reposne=>{
      console.log(reposne);
    });
  }
}
