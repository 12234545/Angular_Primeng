import { Router } from "express";
import type { Request, Response } from "express";
import * as db from "./database-user";
import { comparePassword } from "./auth-helpers";

const authRouter = Router();

// Route de connexion
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Récupérer l'utilisateur par email
    const users = await db.getUserByEmail(email);
    
    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = users[0];
    
    // Vérifier le mot de passe
    // Pour la compatibilité avec les mots de passe non hachés existants
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Mot de passe haché avec bcrypt
      isPasswordValid = await comparePassword(password, user.password);
    } else {
      // Comparaison en texte brut (pour les comptes existants)
      isPasswordValid = user.password === password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Créer une copie de l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // Retourner les détails de l'utilisateur
    res.json({ 
      message: "Connexion réussie",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default authRouter;