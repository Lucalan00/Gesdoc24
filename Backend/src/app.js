const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// **Definir orígenes permitidos**
const allowedOrigins = [
  "http://127.0.0.1:5500",  // Para Live Server en VS Code
  "http://localhost:3000"   // Para aplicaciones React o Vue
];

// **Middleware global de CORS**
app.use(cors({
  origin: '*', // Permite solicitudes desde cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// **Middleware para asegurar que todas las respuestas incluyan CORS correctamente**
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Responder correctamente preflight
  }
  next();
});

// **Middlewares principales**
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **Configuración de sesiones**
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, sameSite: "none" }
}));
app.use(passport.initialize());
app.use(passport.session());

// **Configuración de Nodemailer**
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// **Carga de rutas**
const routes = {
  auth: require('./routes/authRoutes'),
  usuario: require('./routes/usuarioRoutes'),
  role: require('./routes/roleRoutes'),
  pase: require('./routes/paseRoutes'),
  documento: require('./routes/documentoRoutes'),
  empleado: require('./routes/empleadoRoutes'),
  departamento: require('./routes/departamentoRoutes'),
  organismo: require('./routes/organismoRoutes'),
  notificacion: require('./routes/notificacionRoutes')
};

// **Registro de rutas en Express**
Object.keys(routes).forEach(route => {
  app.use(`/${route}`, routes[route]);
});

// **Ruta de prueba**
app.get('/', (_req, res) => {
  res.send('¡Bienvenido a GesDoc26!');
});

// **Manejo de rutas no encontradas**
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// **Middleware para manejo de errores**
app.use((err, _req, res, _next) => {
  console.error("🚨 Error detectado:", err.stack);
  if (err.message.includes("CORS")) {
    console.warn("⚠ Bloqueo por CORS detectado, revisa la configuración.");
  }
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

module.exports = app;
