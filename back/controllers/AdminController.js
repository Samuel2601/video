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
  obtenerInformacionVideo(videoPath);
};

async function obtenerInformacionVideo(videoUrl) {
  try {
    //const info = await youtubedl(videoUrl, { skipDownload: true, format: 'bestaudio/best' });
    const playlistRange = '1-1';

    const promise = youtubedl(videoUrl, { dumpSingleJson: true,playlistItems: playlistRange});

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
            console.log( format);
            /*console.log('Formato:', format.format_id);
            console.log('NOTA:',format.format_note);
            console.log('Extensión:', format.ext);
            console.log('Resolución:', format.resolution);
            console.log('Bitrate:', format.tbr);*/
            console.log('------------------------');
          });
          const mejorFormato = entry.formats.find(format => format.format_id === entry.format_id);
          console.log('Mejor formato:', mejorFormato);
        } else {
          console.error('El elemento no contiene la propiedad "formats".');
        }
      });
    }
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
  const archivoPath = req.body.archivoPath; // Suponiendo que la ruta del archivo se pasa en el cuerpo de la solicitud
  // Configura la respuesta HTTP para descargar el archivo
  res.download(archivoPath, 'nombre_archivo.mp3', (err) => {
    if (err) {
      console.error('Error durante la descarga del archivo:', err);
      // Maneja el error y envía una respuesta al cliente
      res.status(500).json({ error: 'Error durante la descarga del archivo' });
    }
  });
};

module.exports = {
  descargarAudio,
  descargarArchivo,
};

