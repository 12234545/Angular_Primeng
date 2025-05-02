import { Router, Request, Response } from "express";
import * as db from "./database-todo";

const todosRouter = Router();

// GET tous les todos
todosRouter.get("/", async (_req: Request, res: Response) => {
  const todos = await db.getTodos();
  res.json(todos);
});

// GET un todo par ID
todosRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const todo = await db.getTodoById(id);
  if (todo) {
    res.json(todo);
  } else {
    res.status(404).json({ message: "Todo not found" });
  }
});

// POST créer un nouveau todo
todosRouter.post("/", async (req: Request, res: Response) => {
  const { task, completed } = req.body;
  const newTodo = await db.createTodo({ task, completed });
  res.status(201).json(newTodo);
});

// PATCH mettre à jour un todo
todosRouter.patch("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const updates = req.body;
  const updatedTodo = await db.updateTodo(id, updates);
  if (updatedTodo) {
    res.json(updatedTodo);
  } else {
    res.status(404).json({ message: "Todo not found" });
  }
});

// DELETE supprimer un todo
todosRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = await db.deleteTodo(id);
  if (deleted) {
    res.json({ message: "Todo deleted" });
  } else {
    res.status(404).json({ message: "Todo not found" });
  }
});

export default todosRouter;
