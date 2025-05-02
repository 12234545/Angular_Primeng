// server.ts 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './database-user';
import usersRouter from './users.routes';
import authRouter from './auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.USER_PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

// Middleware
app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Route racine
app.get("/", (_req, res) => {
  res.send("Welcome to the User API");
});

// Routes utilisateurs et authentification
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// Gestion des 404
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Connexion à la base de données puis démarrage du serveur
connectToDatabase(mongoUri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à la base de données :', error);
    process.exit(1);
  });