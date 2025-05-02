import { Router, Request, Response } from "express";
import * as db from "./database-product";  // Assurez-vous que ce chemin est correct

const productsRouter = Router();

// GET all products
productsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await db.getProducts();  // Vérifiez que cette fonction existe dans 'database-product.ts'
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// GET product by ID
productsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const product = await db.getProductById(id);  // Vérifiez que cette fonction existe
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// POST create product
productsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const created = await db.createProduct(req.body);  // Assurez-vous que cette fonction existe
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
});

/*
productsRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);  // Assurez-vous que cette fonction existe
    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});
*/
productsRouter.put("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    console.log(`Tentative de mise à jour pour l'ID: ${id}`);
    console.log(`Données de mise à jour:`, req.body);
    
    const updated = await db.updateProduct(id, req.body);
    
    if (!updated) {
      console.log(`Produit non trouvé avec l'ID: ${id}`);
      res.status(404).json({ error: "Product not found" });
      return;
    }
    
    console.log(`Produit mis à jour:`, updated);
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});
// DELETE product
productsRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const deleted = await db.deleteProduct(id);  // Vérifiez que cette fonction existe
    if (deleted) {
      res.json({ message: "Product deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});
productsRouter.patch("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    console.log(`Tentative de mise à jour partielle pour l'ID: ${id}`);
    console.log(`Données de mise à jour:`, req.body);
    
    const updated = await db.updateProduct(id, req.body);
    
    if (!updated) {
      console.log(`Produit non trouvé avec l'ID: ${id}`);
      res.status(404).json({ error: "Product not found" });
      return;
    }
    
    console.log(`Produit mis à jour:`, updated);
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});
export default productsRouter;
