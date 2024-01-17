import { Component, OnInit} from '@angular/core';
import { AdminService } from 'src/app/admin.service';
import { Platform } from '@angular/cdk/platform';
import iziToast from 'izitoast';

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
  listformat:Array<any>=[];
  selectformat:any;
  info:any;
  constructor(private _adminService: AdminService,private platform: Platform) {

  }

  ngOnInit(): void {
    this.verificarTipoDispositivo();
  }

  descargarAudio(): void {
    if(this.videoUrl){
      const videoPath = this.videoUrl; // Reemplaza esto con la ruta correcta
      this._adminService.descargarAudio(videoPath,this.rangoSeleccionado).subscribe(
        (response) => {
          console.log('Extracción de audio completa', response);
          if (response.info && response.info.entries) {
            this.info = response.info;
          
            // Obtener los formatos de la primera entrada
            const firstEntryFormats = new Set<string>(this.info.entries[0]?.formats || []);
          
            // Iterar sobre las demás entradas
            for (let i = 1; i < this.info.entries.length; i++) {
              const entryFormats = new Set<string>(this.info.entries[i]?.formats || []);
          
              // Intersectar los formatos con los de la primera entrada
              firstEntryFormats.forEach((firstFormat:any) => {
                // Buscar un formato en entryFormats que tenga el mismo format_id
                const matchingFormat = Array.from(entryFormats).find((entryFormat:any) => 
                entryFormat.format_id == firstFormat.format_id);
              
                // Si no se encuentra un formato coincidente, eliminarlo de firstEntryFormats
                if (!matchingFormat) {
                  console.log(firstFormat);
                  firstEntryFormats.delete(firstFormat);
                }
              });
            }
          
            // Convertir el conjunto de formatos comunes a un array
            this.listformat = Array.from(firstEntryFormats);
            this.listformat.push({format_id:'',format:'Mejor Video',ext:'mp4'},{format_id:'',format:'Mejor Video',ext:'webm'});
            console.log(this.listformat);
            /*
            response.listaPath.forEach((element:any) => {
              console.log(element.nombre);
              this.descargarArchivo(element.nombre);
            });
            */
          }else if(response.info && response.info.formats){
            this.info = response.info;
          
            // Obtener los formatos de la primera entrada
            const firstEntryFormats = new Set<string>(this.info.formats || []);
            this.listformat = Array.from(firstEntryFormats); 
            this.listformat.push({format_id:'',format:'Mejor Video',ext:'mp4'},{format_id:'',format:'Mejor Video',ext:'webm'});           
            console.log(this.listformat);
          }           
        },
        (error) => {
          console.error('Error durante la extracción de audio', error);
        }
      );
    }    
  }
  loaddw=false;
  listpath:any={}
  descarga(): void {
    this.loaddw = true;
    if (this.info && this.selectformat) {
      this._adminService.descargar(this.info, this.listformat[this.selectformat], this.plataformaSeleccionada).subscribe((response) => {
        if (response.listaPath) {
          console.log(response);
          this.listpath = response.listaPath;
          this.descargarYBorrarArchivos();
        }
      });
    }
  }
  async descargarYBorrarArchivos(): Promise<void> {
    try {
      let i=0;
      for (const element of this.listpath) {
        this.descargarArchivo(element.nombre,i);
        i++;
      }
  
      // this.borrar();
    } catch (error) {
      console.error('Error en la descarga o borrado de archivos:', error);
    } finally {
      //this.borrar();
      this.loaddw = false;
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

  convertirBytesAMegabytes(bytes: number): string {
    const megabytes = bytes / (1024 * 1024);
    return megabytes.toFixed(2) + ' MB';
  }

  descargarArchivo(archivo: string,count:number): void {
    console.log(count);
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
        if(count==this.listpath.length-1){
          this.borrar();
        }
      },
      error => {
        console.error('Error al descargar el archivo:', error);
      }
    );
  }

  borrar(){
    if(this.listpath){
      this._adminService.borrarArchivo(this.listpath).subscribe(response=>{
        console.log(response);
        iziToast.show({
          title: 'SUCCESS',
          class: 'iziToast-success',
          position: 'topRight',
          message: response,
        });
      });
    }  
  }

}
