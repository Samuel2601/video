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

    const outputPath = '/descargas/';
    //await youtubedl(videoUrl, {playlistItems: playlistRange, format: 'bestaudio/best' });
    // Obtiene la información sin descargar
    const info = await youtubedl(videoUrl, {playlistItems: playlistRange, dumpSingleJson: true , format: 'bestaudio/best' });
    await logger(info, `Obteniendo información para ${videoUrl}`);
    if(info && info.entries){
      const listaPath = [];

      // Iterar sobre los elementos de la lista de reproducción
      for (const entry of info.entries) {
        entry.formats.forEach(format => {
          //console.log( format);
          console.log('Formato:', format.format_id);
          console.log('NOTA:',format.format_note);
          console.log('Extensión:', format.ext);
          console.log('Resolución:', format.resolution);
          console.log('Bitrate:', format.tbr);
          console.log('------------------------');
        });

        const entryUrl = entry.webpage_url;
        const nombreDeseado=encodeURIComponent(entry.title);
        const options = {
          format: 'bestaudio/best',
          output: outputPath+nombreDeseado+'.mp3',
        };
        // Descargar el video
        await youtubedl(entryUrl, options)
        .then(async (output) => {
            // La descarga ha concluido, ahora puedes obtener el nombre del archivo
            const matches = output.match(/\[download\] Destination: (.+)/);
            if (matches && matches[1]) {
                nombreArchivo = matches[1];
                //const encodedFileName = encodeURIComponent(nombreArchivo);
                listaPath.push({ nombre: nombreDeseado+'.mp3' });
            }
        })
        .catch((error) => {
            console.error('Error al descargar:', error);
        });

    }
      return listaPath;
    }else if(info && info.title){
      info.formats.forEach(format => {
        //console.log( format);
        console.log('Formato:', format.format_id);
        console.log('NOTA:',format.format_note);
        console.log('Extensión:', format.ext);
        console.log('Resolución:', format.resolution);
        console.log('Bitrate:', format.tbr);
        console.log('------------------------');
      });
      const listaPath = [];
      const entryUrl = info.webpage_url;
      const nombreDeseado=encodeURIComponent(info.title);
      const options = {
        format: 'bestaudio/best',
        output: outputPath+nombreDeseado+'.mp3',
      };
      await youtubedl(entryUrl, options)
      .then(async (output) => {
          // La descarga ha concluido, ahora puedes obtener el nombre del archivo
          const matches = output.match(/\[download\] Destination: (.+)/);
          if (matches && matches[1]) {
              nombreArchivo = matches[1];
              //const encodedFileName = encodeURIComponent(nombreArchivo);
              listaPath.push({ nombre: nombreDeseado+'.mp3' });
          }
      })
      .catch((error) => {
          console.error('Error al descargar:', error);
      });

      return listaPath;
    }else{
      const listaPath = [];
      return listaPath;
    }
  } catch (error) {
    console.error('Error al obtener información del video:', error);
  }
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

// Función para descargar un archivo
const descargarArchivo = async function (req, res) {
  console.log(req.params['id']);
  if(req.params['id']){
    const archivoPath = req.params['id']; // Suponiendo que la ruta del archivo se pasa en el cuerpo de la solicitud
    const decodedFileName = encodeURIComponent(archivoPath);
    const rutaArchivo = path.join(__dirname,'../descargas/', decodedFileName);
    console.log(rutaArchivo);
    // Verificar si el archivo existe
    fs.access(rutaArchivo, fs.constants.F_OK, (err) => {
      if (err) {
          // El archivo no existe
          console.error('El archivo no existe:', err);
          res.status(404).send('Archivo no encontrado');
      } else {
        console.log('Existe',rutaArchivo);
          //const nuevoNombre = decodeURIComponent(archivoPath); // Cambia esto según tus necesidades
          // Establecer el encabezado Content-Disposition con el nuevo nombre
          //res.setHeader('Content-Disposition', `attachment; filename="${nuevoNombre}"`);
          
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

const borrarArchivo = async function (req, res) {
  if(req.params['id']){
    const nombreArchivo = encodeURIComponent(req.params['id']);
    console.log('BORRAR ARCHIVO',nombreArchivo);
    const rutaArchivo = path.join(__dirname, '../descargas/', nombreArchivo);
  
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

