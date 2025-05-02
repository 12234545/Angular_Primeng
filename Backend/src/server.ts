// server.ts - Version mise à jour
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './users/database-user';
import usersRouter from './users/users.routes';
import authRouter from './users/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Utilisez un PORT cohérent
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/formito";

// Middleware
app.use(cors({
  origin: "http://localhost:4200", // Votre application Angular
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Route racine
app.get("/", (_req, res) => {
  res.send("Welcome to Formito API");
});

// Routes utilisateurs et authentification
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// Gestion des 404
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Connexion à la base de données et démarrage du serveur
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