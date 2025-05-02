// Updated product.ts
import { ObjectId } from 'mongodb';

export interface Product {
  _id?: ObjectId;     // Champ MongoDB interne
  id?: string;        // Pour la compatibilité avec l'interface frontend
  name: string;
  image: string;
  description: string;
  price: number;
}