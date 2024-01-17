//var AdminInstituto = require('../models/AdminInstituto');
var fs = require('fs');
var path = require('path');

var mongoose = require('mongoose');

// Función para descargar el audio de un video
const logger = require('progress-estimator')();
const youtubedl = require('youtube-dl-exec');

const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

const descargarAudio = async function (req, res) {
  console.log(req.body);
  const videoPath = req.body.videoPath;
  const rangoSeleccionado = req.body.rangoSeleccionado;
  const listaPath= await obtenerInformacionVideo(videoPath,rangoSeleccionado);
  res.status(200).json(listaPath);
};

async function obtenerInformacionVideo(videoUrl,rangoSeleccionado) {
  try {    
    //const info = await youtubedl(videoUrl, { skipDownload: true, format: 'bestaudio/best' });
    const playlistRange = '1-'+rangoSeleccionado;

    //await youtubedl(videoUrl, {playlistItems: playlistRange, format: 'bestaudio/best' });
    // Obtiene la información sin descargar'bestaudio/best' 'bestvideo/best' 'bestvideo+bestaudio/best'
    const optionsinfo = {
      playlistItems: playlistRange,
      dumpSingleJson: true,
      format:'bestaudio/best',
      'playlist-reverse': true,
    };    
    const info = await youtubedl(videoUrl,optionsinfo);
    //await logger(info, `Obteniendo información para ${videoUrl}`);
    return {info:info}
  } catch (error) {
    console.error('Error al obtener información del video:', error);
    return {error:error};
  }
}
 /*entry.formats.forEach(format => {
          //console.log( format);
          console.log('Formato:', format.format_id);
          console.log('NOTA:',format.format_note);
          console.log('Extensión:', format.ext);
          console.log('Resolución:', format.resolution);
          console.log('Bitrate:', format.tbr);
          console.log('------------------------');
        });*/
/*info.formats.forEach(format => {
        //console.log( format);
        console.log('Formato:', format.format_id);
        console.log('NOTA:',format.format_note);
        console.log('Extensión:', format.ext);
        console.log('Resolución:', format.resolution);
        console.log('Bitrate:', format.tbr);
        console.log('------------------------');
      });*/
const descargar = async function (req, res) {
  try {
    const info = req.body.info;
    const formato = req.body.formato;
    const dispositivo = req.body.dispositivo;
    const listaPath = [];
    const outputPath = '/descargas/';
    let ext = formato.ext;
    let formatext = formato.format_id;
    
    if (dispositivo !== 'pc') {
      ext = 'mp3';
      formatext = 'bestaudio/best';
    } else {
      // Si estás descargando para PC, puedes especificar el formato deseado aquí
      // formatext = 'bestvideo+bestaudio/best';
      // ext = 'mp4';
    }

    if (info && info.entries) {
      for (const entry of info.entries) {
        const entryUrl = entry.webpage_url;
        const nombreDeseado = encodeURIComponent(entry.title);
        const options = {
          noCheckCertificates: true,
          preferFreeFormats: true,
          noWarnings: true,
          output: outputPath + nombreDeseado + '.' + ext,
          //embedThumbnail: true,  // Opción para incrustar la miniatura
        };

        if (formatext) {
          options.format = formatext;
        }
        
        //options['embed-thumbnail'] = true;
        await youtubedl(entryUrl, options)
          .then(async (output) => {
            const matches = output.match(/\[download\] Destination: (.+)/);
            //const imageMatch = output.match(/\[ThumbnailsConvertor\] Converting thumbnail "([^"]+)"/);
            if (matches && matches[1]) {
              //await incrustarPortada(matches[1],imageMatch[1],'../descargas/end/');
              listaPath.push({ nombre: nombreDeseado + '.' + ext });
            }
          })
          .catch((error) => {
            console.error('Error al descargar:', error);
          });
      }
    } else if (info && info.title) {
      const entryUrl = info.webpage_url;
      const nombreDeseado = encodeURIComponent(info.title);
      const options = {
        noCheckCertificates: true,
        preferFreeFormats: true,
        noWarnings: true,
        output: outputPath + nombreDeseado + '.' + ext,
        //embedThumbnail: true,  // Opción para incrustar la miniatura
      };

      if (formatext) {
        options.format = formatext;
      }
      
      //options['embed-thumbnail'] = true;
      await youtubedl(entryUrl, options)
        .then(async (output) => {
          const matches = output.match(/\[download\] Destination: (.+)/);
          //const imageMatch = output.match(/\[ThumbnailsConvertor\] Converting thumbnail "([^"]+)"/);
          if (matches && matches[1]) {
            //await incrustarPortada(matches[1],imageMatch[1],'../descargas/end/');
            listaPath.push({ nombre: nombreDeseado + '.' + ext });
          }
        })
        .catch((error) => {
          console.error('Error al descargar:', error);
        });
    }

    res.status(200).json({ listaPath: listaPath });
  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
const NodeID3 = require('node-id3');

async function incrustarPortada(mp3FilePath, coverPath, outputDirectory) {
  return new Promise((resolve, reject) => {
    const tags = {
      title: 'Título de la canción',
      artist: 'Artista',
      album: 'Álbum',
      image: {
        mime: 'webp', // Ajusta el tipo MIME según el formato de tu miniatura
        type: { id: 3, name: 'front cover' },
        description: 'Portada',
        imageBuffer: fs.readFileSync(path.join(__dirname, '../', coverPath)),
      },
    };

    NodeID3.write(tags, path.join(__dirname, '../', mp3FilePath), (err) => {
      if (err) {
        console.error('Error al incrustar la portada:', err);
        reject(err);
      } else {
        console.log('Portada incrustada con éxito en el archivo MP3.');
        resolve();
      }
    });
  });
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
  if (req.body.list) {
    const list = req.body.list;
    console.log(list);
    let reslist = await Promise.all(list.map(deleteFile));
    
    if (reslist.length > 0) {
      res.status(200).json({ reslist });
    } else {
      res.status(200).json({ message: 'No body list' });
    }
  } else {
    res.status(200).json({ message: 'No body' });
  }
};

const accessFile = (rutaArchivo) => {
  return new Promise((resolve, reject) => {
    fs.access(rutaArchivo, fs.constants.F_OK, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const deleteFile = async (element) => {
  const nombreArchivo = element.nombre;
  const rutaArchivo = path.join(__dirname, '../descargas/', nombreArchivo);
  console.log("RUTA:", rutaArchivo);

  try {
    await accessFile(rutaArchivo);
    await fs.promises.unlink(rutaArchivo);
    return ({ nombre: element.nombre, message: 'Archivo borrado exitosamente' });
  } catch (err) {
    return ({ nombre: element.nombre, message: 'ERROR: ' + err.message });
  }
};



module.exports = {
  descargarAudio,
  descargarArchivo,
  borrarArchivo,
  descargar
};

