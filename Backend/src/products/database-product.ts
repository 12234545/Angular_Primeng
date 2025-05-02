import * as mongodb from 'mongodb';
import { ObjectId } from 'mongodb';
import { Product } from './product';


export const collections: {
  products?: mongodb.Collection<Product>;
} = {};

// Connexion à la base de données
export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db('formito');
  await applySchemaValidation(db);

  const productsCollection = db.collection<Product>('products');
  collections.products = productsCollection;

  return { db, client };
}

// Validation du schéma
async function applySchemaValidation(db: mongodb.Db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'image', 'description', 'price'],
      additionalProperties: false,
      properties: {
        _id: {},
        id: {},
        name: { bsonType: 'string', description: 'must be a string and is required' },
        image: { bsonType: 'string', description: 'must be a string and is required' },
        description: { bsonType: 'string', description: 'must be a string and is required' },
        price: { bsonType: 'number', description: 'must be a number and is required' },
      },
    },
  };

  try {
    await db.command({
      collMod: 'products',
      validator: jsonSchema,
    });
  } catch (error) {
    if ((error as any).codeName === 'NamespaceNotFound') {
      await db.createCollection('products', { validator: jsonSchema });
    } else {
      throw error;
    }
  }
}



// Récupérer tous les produits
export async function getProducts() {
  if (!collections.products) throw new Error('Collection not initialized');
  return await collections.products.find().toArray();
}

// Récupérer un produit par son ID
export async function getProductById(id: string) {
  if (!collections.products) throw new Error('Collection not initialized');
  const objectId = new ObjectId(id);
  return await collections.products.findOne({ _id: objectId });
}

// Créer un produit
export async function createProduct(product: Product) {
  if (!collections.products) throw new Error('Collection not initialized');
  const result = await collections.products.insertOne(product);
  return {
    ...product,
    _id: result.insertedId,
    id: result.insertedId.toString()
  };
}

/*
export async function updateProduct(id: string, updates: Partial<Product>) {
  if (!collections.products) {
    throw new Error("La collection 'products' n'est pas initialisée.");
  }

  const objectId = new ObjectId(id);

  // Préparer les mises à jour sans inclure _id et id
  const cleanUpdates = { ...updates };
  delete cleanUpdates.id;
  delete cleanUpdates.id;

  try {
    // Effectuer la mise à jour
    const result = await collections.products.findOneAndUpdate(
      { _id: objectId },
      { $set: cleanUpdates },
      { returnDocument: 'after' }
    );

    // Vérifier si la mise à jour a réussi
    if (!result) {
      console.log(`Aucun produit trouvé avec l'ID: ${id}`);
      return null;
    }

    // Retourner le produit mis à jour
    return {
      ...result,
      id: result._id.toString()  // Convertir _id en string pour le frontend
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    throw error;
  }
}
*/
// Update the updateProduct function in database-product.ts
export async function updateProduct(id: string, updates: Partial<Product>) {
  if (!collections.products) {
    throw new Error("La collection 'products' n'est pas initialisée.");
  }

  try {
    const objectId = new ObjectId(id);
    
    // Vérifier si le produit existe avant la mise à jour
    const productExists = await collections.products.findOne({ _id: objectId });
    if (!productExists) {
      console.log(`Aucun produit trouvé avec l'ID: ${id}`);
      return null;
    }
    
    // Créer une copie des mises à jour sans les champs _id et id
    const cleanUpdates: Partial<Product> = { ...updates };
    delete cleanUpdates._id;
    delete cleanUpdates.id;
    
    // Effectuer la mise à jour
    const result = await collections.products.findOneAndUpdate(
      { _id: objectId },
      { $set: cleanUpdates },
      { returnDocument: "after" }
    );
    
    // Si la mise à jour a réussi, retourner le document avec l'id formaté
    if (result) {
      return {
        ...result,
        id: result._id.toString() // Assurer que l'id est une chaîne
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du produit:`, error);
    throw error;
  }
}

// Supprimer un produit
export async function deleteProduct(id: string) {
  if (!collections.products) throw new Error('Collection not initialized');
  const objectId = new ObjectId(id);
  const result = await collections.products.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}
