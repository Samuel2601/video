//var AdminInstituto = require('../models/AdminInstituto');
var fs = require('fs');
var path = require('path');

var mongoose = require('mongoose');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = path.resolve(__dirname, '../ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe');
ffmpeg.setFfmpegPath(ffmpegPath);
// Función para descargar el audio de un video
const logger = require('progress-estimator')();
const youtubedl = require('youtube-dl-exec');

const descargarAudio = async function (req, res) {
  const videoPath = req.body.videoPath; // Suponiendo que el path del video se pasa en el cuerpo de la solicitud
  const listaPath= await obtenerInformacionVideo(videoPath);
  res.status(200).json({listaPath:listaPath});
};

async function obtenerInformacionVideo(videoUrl) {
  try {
    //const info = await youtubedl(videoUrl, { skipDownload: true, format: 'bestaudio/best' });
    const playlistRange = '1-10';

    const outputPath = '../descargas/';
    //await youtubedl(videoUrl, {playlistItems: playlistRange, format: 'bestaudio/best' });
    // Obtiene la información sin descargar
    const info = await youtubedl(videoUrl, {playlistItems: playlistRange,dumpSingleJson: true , format: 'bestaudio/best' });
    //const result = await logger(info, `Obteniendo información para ${videoUrl}`);
    if(info && info.entries){
      const listaPath = [];

      // Iterar sobre los elementos de la lista de reproducción
      for (const entry of info.entries) {
        const entryUrl = entry.webpage_url;
        const nombreDeseado=encodeURIComponent(entry.title);
        const options = {
          format: 'bestaudio/best',
          output: outputPath+nombreDeseado,
        };
        // Descargar el video
        await youtubedl(entryUrl, options)
        .then(async (output) => {
            // La descarga ha concluido, ahora puedes obtener el nombre del archivo
            const matches = output.match(/\[download\] Destination: (.+)/);
            if (matches && matches[1]) {
                nombreArchivo = matches[1];
                //const encodedFileName = encodeURIComponent(nombreArchivo);
                listaPath.push({ nombre: nombreArchivo });
            }
        })
        .catch((error) => {
            console.error('Error al descargar:', error);
        });

    }
      return listaPath;
    }else if(info && info.title){
      const listaPath = [];
      const entryUrl = info.webpage_url;
      const nombreDeseado=encodeURIComponent(info.title);
      const options = {
        format: 'bestaudio/best',
        output: outputPath+nombreDeseado,
      };
      await youtubedl(entryUrl, options)
      .then(async (output) => {
          // La descarga ha concluido, ahora puedes obtener el nombre del archivo
          const matches = output.match(/\[download\] Destination: (.+)/);
          if (matches && matches[1]) {
              nombreArchivo = matches[1];
              //const encodedFileName = encodeURIComponent(nombreArchivo);
              listaPath.push({ nombre: nombreArchivo });
          }
      })
      .catch((error) => {
          console.error('Error al descargar:', error);
      });

      return listaPath;
    }
/*

    const outputPath = '../descargas/';
    const promise = youtubedl(videoUrl, {playlistItems: playlistRange,format: 'bestaudio/best'}).save(outputPath, { cwd: outputPath });

    const result = await logger(promise, `Obteniendo información para ${videoUrl}`);

    // Imprime el resultado después de completar la descarga
    //console.log(result);
    let info =result;
    if (info && info.entries) {
      // Recorre cada elemento de la lista de reproducción
      info.entries.forEach(entry => {
        console.log('Información del elemento:');
        console.log('Título:', entry.title);
        
        // Verifica si la propiedad 'formats' existe en la respuesta de cada elemento
        if (entry.formats) {
          // Imprime la información de cada formato disponible para el elemento   
          entry.formats.forEach(format => {
            //console.log( format);
            console.log('Formato:', format.format_id);
            console.log('NOTA:',format.format_note);
            console.log('Extensión:', format.ext);
            console.log('Resolución:', format.resolution);
            console.log('Bitrate:', format.tbr);
            console.log('------------------------');
          });
          const mejorFormato = entry.formats.find(format => format.format_id === entry.format_id);
          console.log('Mejor formato:', mejorFormato);
        } else {
          console.error('El elemento no contiene la propiedad "formats".');
        }
      });
    }*/
  } catch (error) {
    console.error('Error al obtener información del video:', error);
  }
}

async function descarga(info){
  if (info && info.formats) {
    // Obtén la URL del formato con mejor calidad de audio
    const audioFormat = info.formats.find(format => format.ext === 'mp3');

    // Verifica si se encontró un formato de audio
    if (audioFormat) {
      const audioUrl = audioFormat.url;

      // Utiliza fluent-ffmpeg para extraer y guardar el audio
      console.log('Iniciando proceso de extracción de audio...');
      ffmpeg()
        .input(audioUrl)
        .audioCodec('libmp3lame')
        .audioBitrate(192)
        .on('end', function () {
          console.log('Extracción de audio completa. El archivo MP3 ha sido guardado.');
        })
        .on('error', function (err) {
          console.error('Error durante la extracción de audio:', err);
        })
        .save('audio_descargado.mp3');
    } else {
      console.error('No se encontró un formato de audio.');
    }
  } else {
    console.error('La respuesta de youtube-dl-exec no contiene la propiedad "formats".');
  }
}

// Función para descargar un archivo
const descargarArchivo = function (req, res) {
  console.log(req.params.nombre);
  if(req.params.nombre){
    const archivoPath = req.params.nombre; // Suponiendo que la ruta del archivo se pasa en el cuerpo de la solicitud
    const decodedFileName = decodeURIComponent(archivoPath);
    const rutaArchivo = path.join(__dirname,'../', decodedFileName);
    
    // Verificar si el archivo existe
    fs.access(rutaArchivo, fs.constants.F_OK, (err) => {
      if (err) {
          // El archivo no existe
          console.error('El archivo no existe:', err);
          res.status(404).send('Archivo no encontrado');
      } else {
        console.log('Existe',rutaArchivo);
          // El archivo existe, proceder con la descarga
          res.download(rutaArchivo, (err) => {
              if (err) {
                  console.error('Error al descargar el archivo:', err);
                  res.status(500).send('Error interno del servidor');
              }
          });
        }
    });
  }  
};

const borrarArchivo = function (req, res) {
  if(req.params.nombre){
    const nombreArchivo = req.params.nombre;
    const rutaArchivo = path.join(__dirname, '../', nombreArchivo);
  
    // Verificar si el archivo existe
    fs.access(rutaArchivo, fs.constants.F_OK, (err) => {
        if (err) {
            // El archivo no existe
            console.error('El archivo no existe:', err);
            res.status(404).send('Archivo no encontrado');
        } else {
          console.error('El archivo existe:');
            // El archivo existe, proceder con la eliminación
            fs.unlink(rutaArchivo, (err) => {
                if (err) {
                    console.error('Error al borrar el archivo:', err);
                    res.status(500).send('Error interno del servidor al borrar el archivo');
                } else {
                  console.error('Archivo borrado exitosamente');
                    // Archivo eliminado con éxito
                    res.status(200).send('Archivo borrado exitosamente');
                }
            });
        }
    });
  }  
};

module.exports = {
  descargarAudio,
  descargarArchivo,
  borrarArchivo,
};

