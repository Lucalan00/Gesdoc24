const { Usuario, Role, Empleado, Departamento, Notificacion,  sequelize } = require('../models/IndexModel');
const { validationResult } = require('express-validator');
const formatNom = require('../utils/normalizacion');
const { ESTADOS, ROLES } = require('../utils/constantes');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/emailSender'); 

const roles = {
  [ROLES.SECRETARIO]: 1,
  [ROLES.ADMINISTRADOR]: 2,
  [ROLES.EMPLEADO]: 3,
};

//  Crear usuario , empleado y notificación
const createUsuario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre_completo, dni, email, contrasena, departamento, rol_solicitado, direccion, telefono, estado, es_responsable } = req.body;
  const id_rol = roles[rol_solicitado];
  if (!id_rol) {
    return res.status(400).json({ message: 'Rol solicitado no válido.' });
  }

  const transaction = await sequelize.transaction();
  try {
     // Verificar si el departamento existe
     const departamentoExistente = await Departamento.findOne({ where: { nombre: departamento } });
     if (!departamentoExistente) {
       return res.status(400).json({ message: 'El departamento proporcionado no es válido.' });
     }
    // Verificar si ya existe un usuario con el mismo DNI o email
    const usuarioExistente = await Usuario.findOne({ where: { username: dni } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El DNI ya está registrado.' });
    }

    const empleadoExistente = await Empleado.findOne({ where: { email } });
    if (empleadoExistente) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    // Crear empleado y usuario
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const normalizedNombreCompleto = formatNom(nombre_completo);
    
    const empleado = await Empleado.create({ nombre_completo: normalizedNombreCompleto, dni,direccion,
      telefono, email,  estado: estado || 'Activo',
      id_dpto: departamentoExistente.id_dpto,
      es_responsable: es_responsable || false,
      rol_solicitado }, { transaction });
      if (!empleado || !empleado.id_empleado) {
        await transaction.rollback();
        return res.status(500).json({ message: 'Error al registrar usuario: Empleado no generado.' });
      }
    const usuario = await Usuario.create({
      username: dni,
      contrasena: hashedPassword,
      id_rol,
      estado: ESTADOS.PENDIENTE,
      id_empleado: empleado.id_empleado
    }, { transaction });
 
    if (!usuario || !usuario.id_usuario) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Error al registrar usuario: Usuario no generado.' });
    }
    // Crear notificación para el secretario
    const notificacion = await Notificacion.create(
      {
        id_usuario: usuario.id_usuario,
        mensaje: `El usuario con DNI ${dni} ha solicitado el rol de ${rol_solicitado}.`,
        leida: false // Marcamos como no leída
      },
      { transaction }
    );

    await transaction.commit();

    // Respuesta de éxito
    res.status(201).json({
      message: 'Registro enviado. Notificación creada. Esperando aprobación.',
      usuario,
      notificacion
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Funcion para Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    // Obtener todos los usuarios con su estado, rol y detalles del empleado
    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'estado'], // Estado del usuario
      include: [
        {
          model: Empleado,
          as: 'empleado',
          attributes: ['nombre_completo', 'dni'], // Datos del empleado
        },
        {
          model: Role,
          as: 'rol',
          attributes: ['rol'] // Nombre del rol (Administrador, Secretario, Empleado)
        }
      ]
    });

    if (!usuarios.length) {
      return res.status(404).json({ message: 'No se encontraron usuarios registrados.' });
    }

    res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};


module.exports = { createUsuario, getUsuarios  };