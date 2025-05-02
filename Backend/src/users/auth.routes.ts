// auth.routes.ts

import express, { Router, Request, Response } from "express";
import * as db from "./database-user";
import bcrypt from "bcrypt";

const authRouter: Router = express.Router();

// Route de login
authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email et mot de passe requis" });
      return;
    }

    // Rechercher l'utilisateur par email
    const users = await db.getUserByEmail(email);
    
    if (users.length === 0) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const user = users[0];
    
    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    // Authentification réussie
    res.status(200).json({ 
      message: "Connexion réussie",
      user: {
        _id: user._id,
        id: user._id?.toString(),
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default authRouter;