import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import todosRouter from "./todos.routes";
import { connectToDatabase } from "./database-todo";
import cors from "cors";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

// Middleware CORS : ajout de la méthode PATCH
app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Ajout de PATCH
  credentials: true
}));

// Middleware pour le parsing du corps de la requête
app.use(express.json());

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Bienvenue sur l'API Todo");
});

app.use("/todos", todosRouter);

// Middleware pour gérer les erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).send("Page non trouvée");
});

// Connexion à la base de données puis démarrage du serveur
connectToDatabase(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server started on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });