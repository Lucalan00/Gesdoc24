const role = require('../models/role');

// Obtener todos los roles (solo Administrador)
const getRoles = async (req, res) => {
  if (req.userRol !== 'Administrador') {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }
  try {
    const roles = await role.findAll();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo rol (solo Administrador)
const createRole = async (req, res) => {
  if (req.userRol !== 'Administrador') {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }
  try {
    const newRole = await role.create(req.body);
    res.json(newRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un rol (solo Administrador)
const updateRole = async (req, res) => {
  if (req.userRol !== 'Administrador') {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }
  try {
    const roleToUpdate = await role.findByPk(req.params.id);
    if (!roleToUpdate) return res.status(404).json({ message: 'Rol no encontrado' });
    
    await roleToUpdate.update(req.body);
    res.json(roleToUpdate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un rol (solo Administrador)
const deleteRole = async (req, res) => {
  if (req.userRol !== 'Administrador') {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }
  try {
    const roleToDelete = await role.findByPk(req.params.id);
    if (!roleToDelete) return res.status(404).json({ message: 'Rol no encontrado' });
    
    await roleToDelete.destroy();
    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};

