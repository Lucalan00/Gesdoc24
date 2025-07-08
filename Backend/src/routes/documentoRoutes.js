const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const { verifyToken } = require('../middleware/auth');
const authRole = require('../middleware/authRole');

// Obtener las opciones ENUM
router.get('/enum-options', verifyToken, authRole(['Administrador', 'Secretario']), documentoController.getEnumOptions);

// Obtener todos los documentos (Administrador y Secretario )
router.get('/getdocumentos', verifyToken, authRole(['Administrador', 'Secretario']), documentoController.getDocumentos);

// Crear un nuevo documento (solo Administrador y Secretario)
router.post('/createdocumento', verifyToken, authRole(['Administrador', 'Secretario']), documentoController.createDocumento);

// Actualizar un documento (solo Administrador y Secretario)
router.put('/updatedocumento/:id_doc', verifyToken, authRole(['Administrador', 'Secretario']), documentoController.updateDocumento);

// Eliminar un documento (solo Administrador)
router.delete('/deletedocumento/:id_doc', verifyToken, authRole(['Administrador']), documentoController.deleteDocumento);

module.exports = router;
