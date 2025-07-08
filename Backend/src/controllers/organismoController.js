const Organismo = require('../models/organismo');
const formatNom = require('../utils/normalizacion'); 

// Obtener todos los organismos (solo Administrador y Secretario)
const getOrganismos = async (req, res) => {
  try {
    // Verificar si el usuario tiene el rol de Administrador o Secretario
    if (req.userRol !== 'Administrador' && req.userRol !== 'Secretario') {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    const organismos = await Organismo.findAll();
    res.status(200).json(organismos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los organismos: ' + err.message });
  }
};

// Crear un nuevo organismo (solo Administrador y Secretario)
const createOrganismo = async (req, res) => {
  try {
    // Verificar si el usuario tiene el rol de Administrador o Secretario
    if (req.userRol !== 'Administrador' && req.userRol !== 'Secretario') {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    const { nombre, tipo, direccion, telefono, email } = req.body;

    // Validar que los campos requeridos no estén vacíos
    if (!nombre || !tipo) {
      return res.status(400).json({ message: 'El nombre y el tipo son requeridos' });
    }

    // Normalizar el nombre antes de crear el organismo
    const nombreNormalizado = formatNom(nombre, {
      abbrs: ['gral', 'srl', 'inc'], // Abreviaturas específicas para organismos
      emptyErrorMessage: 'El nombre del organismo no puede estar vacío.',
    });

    const newOrganismo = await Organismo.create({
      nombre: nombreNormalizado,
      tipo,
      direccion,
      telefono,
      email,
    });
    res.status(201).json(newOrganismo);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el organismo: ' + err.message });
  }
};

// Actualizar un organismo (solo Administrador y Secretario)
const updateOrganismo = async (req, res) => {
  try {
    // Verificar si el usuario tiene el rol de Administrador o Secretario
    if (req.userRol !== 'Administrador' && req.userRol !== 'Secretario') {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    const { id_org } = req.params;
    const { nombre, tipo, direccion, telefono, email } = req.body;

    // Validar que los campos requeridos no estén vacíos
    if (!nombre || !tipo) {
      return res.status(400).json({ message: 'El nombre y el tipo son requeridos' });
    }

    // Normalizar el nombre antes de actualizar el organismo
    const nombreNormalizado = formatNom(nombre, {
      abbrs: ['gral', 'srl', 'inc'], // Abreviaturas específicas para organismos
      emptyErrorMessage: 'El nombre del organismo no puede estar vacío.',
    });

    const organismoToUpdate = await Organismo.findByPk(id_org);
    if (!organismoToUpdate) {
      return res.status(404).json({ message: 'Organismo no encontrado' });
    }

    await organismoToUpdate.update({
      nombre: nombreNormalizado,
      tipo,
      direccion,
      telefono,
      email,
    });
    res.status(200).json(organismoToUpdate);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el organismo: ' + err.message });
  }
};

// Eliminar un organismo (solo Administrador)
const deleteOrganismo = async (req, res) => {
  try {
    // Verificar si el usuario tiene el rol de Administrador
    if (req.userRol !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    const { id_org } = req.params;

    const organismoToDelete = await Organismo.findByPk(id_org);
    if (!organismoToDelete) {
      return res.status(404).json({ message: 'Organismo no encontrado' });
    }

    await organismoToDelete.destroy();
    res.status(200).json({ message: 'Organismo eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el organismo: ' + err.message });
  }
};

// Exportar las funciones como un objeto
module.exports = {
  getOrganismos,
  createOrganismo,
  updateOrganismo,
  deleteOrganismo,
};