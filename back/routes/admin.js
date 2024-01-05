'use strict'

var express = require('express');
var AdminController = require('../controllers/AdminController');


var api = express.Router();
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/instituciones'});

// Ruta para descargar el audio
api.post('/descargarAudio', AdminController.descargarAudio);

// Ruta para descargar un archivo
api.post('/descargarArchivo', AdminController.descargarArchivo);

module.exports = api;