// users.routes.ts

import express, { Router, Request, Response, NextFunction } from "express";
import * as db from "./database-user";
import bcrypt from "bcrypt";

const usersRouter: Router = express.Router();

// GET tous les utilisateurs ou par email (?email=)
usersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;

    if (email) {
      const users = await db.getUserByEmail(email);
      res.json(users);
    } else {
      const users = await db.getUsers();
      res.json(users);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des utilisateurs:`, error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET par ID
usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ message: "Utilisateur non trouvé" });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST création utilisateur
usersRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "Tous les champs sont requis" });
      return;
    }

    // Hacher le mot de passe avant de le stocker
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await db.createUser({ 
      fullName, 
      email, 
      password: hashedPassword 
    });
    
    res.status(201).json({
      _id: newUser._id,
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email
    });
  } catch (error) {
    console.error("Erreur création utilisateur:", error);
    if ((error as Error).message === 'Un utilisateur avec cet email existe déjà') {
      res.status(409).json({ message: "Cet email est déjà utilisé" });
      return;
    }
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT mise à jour utilisateur (complète)
usersRouter.put("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  try {
    console.log(`Tentative de mise à jour pour l'ID: ${id}`);
    
    // Si le mot de passe est mis à jour, le hacher
    const updates = { ...req.body };
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }
    
    console.log(`Données de mise à jour:`, { ...updates, password: updates.password ? '****' : undefined });

    const updated = await db.updateUser(id, updates);

    if (!updated) {
      console.log(`Utilisateur non trouvé avec l'ID: ${id}`);
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password, ...userWithoutPassword } = updated;
    console.log(`Utilisateur mis à jour:`, userWithoutPassword);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PATCH mise à jour utilisateur (partielle)
usersRouter.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  try {
    console.log(`Tentative de mise à jour partielle pour l'ID: ${id}`);
    
    // Si le mot de passe est mis à jour, le hacher
    const updates = { ...req.body };
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }
    
    console.log(`Données de mise à jour:`, { ...updates, password: updates.password ? '****' : undefined });

    const updated = await db.updateUser(id, updates);

    if (!updated) {
      console.log(`Utilisateur non trouvé avec l'ID: ${id}`);
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password, ...userWithoutPassword } = updated;
    console.log(`Utilisateur mis à jour:`, userWithoutPassword);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE utilisateur
usersRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  try {
    const deleted = await db.deleteUser(id);
    if (deleted) {
      res.json({ message: "Utilisateur supprimé" });
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default usersRouter;