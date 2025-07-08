const empleado = require('../models/empleado');
const Departamento = require('../models/IndexModel');

// Obtener todos los empleados (solo Administrador y Secretario)
const getEmpleados = async (req, res) => {
  try {
    const empleados = await empleado.findAll({
      include: [{
        model: Departamento,
        as: 'departamento',
        attributes: ['id_dpto', 'nombre'] // Incluye tanto el ID como el nombre del departamento
      }]
    });

    // Validar que cada empleado tenga un departamento asignado
    empleados.forEach(emp => {
      if (!emp.departamento || !emp.departamento.id_dpto) {
        console.warn(`El empleado ${emp.nombre_completo} no tiene un departamento asignado correctamente.`);
      }
    });

    res.json(empleados);
  } catch (err) {
    console.error("Error al obtener empleados:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un empleado (solo Administrador y Secretario)
const updateEmpleado = async (req, res) => {
    if (!['Administrador', 'Secretario'].includes(req.userRol)) {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    try {
        
        const empleadoToUpdate = await empleado.findByPk(req.params.id, {
            // 1. Buscar el empleado por su id_empleado y cargar el departamento asociado
            include: [{
                association: 'departamento',
                attributes: ['nombre']
            }]
        });

        if (!empleadoToUpdate) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        // 2. Realizar la actualización con los datos del body
        await empleadoToUpdate.update(req.body);

        // 3. Buscar el empleado nuevamente después de la actualización para obtener
        //    los datos más recientes Y el nombre del departamento asociado.
        const empleadoActualizadoConDepartamento = await empleado.findByPk(req.params.id, {
            include: [{
                association: 'departamento',
                attributes: ['nombre']
            }]
        });

        // 4. ¡Devolver la instancia que tiene los datos actualizados y el departamento!
        res.json(empleadoActualizadoConDepartamento); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Funciones del controlador para crear y eliminar empleados estan deshabilitadas a nivel de ruta ---
// Crear un nuevo empleado (solo Administrador y Secretario)
const createEmpleado = async (req, res) => {
  if (!['Administrador', 'Secretario'].includes(req.userRol)) {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }
  try {
    const newEmpleado = await empleado.create(req.body);
    res.json(newEmpleado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Eliminar un empleado (solo Administrador)
const deleteEmpleado = async (req, res) => {
  if (req.userRol !== 'Administrador') {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }
  try {
    const empleadoToDelete = await empleado.findByPk(req.params.id);
    if (!empleadoToDelete) return res.status(404).json({ message: 'Empleado no encontrado' });
    
    await empleadoToDelete.destroy();
    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado
};
