import * as mongodb from 'mongodb';
import { Todo } from './todo';
import { ObjectId } from "mongodb";
import { ModifyResult } from "mongodb";
import { WithId } from "mongodb"; 

export const collections: {
  todos?: mongodb.Collection<Todo>;
} = {};

export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db('formito');
  await applySchemaValidation(db);

  const todosCollection = db.collection<Todo>('todos');
  collections.todos = todosCollection;

  return { db, client };
}

async function applySchemaValidation(db: mongodb.Db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: 'object',
      required: ['task', 'completed'],
      additionalProperties: false,
      properties: {
        _id: {},
        id: {},
        task: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        completed: {
          bsonType: 'bool',
          description: 'must be a boolean and is required',
        },
      },
    },
  };

  try {
    await db.command({
      collMod: 'todos',
      validator: jsonSchema,
    });
  } catch (error) {
    if ((error as any).codeName === 'NamespaceNotFound') {
      await db.createCollection('todos', { validator: jsonSchema });
    } else {
      console.error('Error applying schema validation:', error);
      throw error;
    }
  }
}

// 🔹 Fonctions CRUD

export async function getTodos() {
  const todos = await collections.todos?.find({}).toArray();
  return todos?.map(todo => ({
    ...todo,
    id: todo._id.toString() // Convertir explicitement l'ObjectId en string
  })) || [];
}


export async function getTodoById(id: string) {
  const objectId = new mongodb.ObjectId(id);
  return collections.todos?.findOne({ _id: objectId });
}

export async function createTodo(todo: Todo) {
  const result = await collections.todos?.insertOne(todo);
  const newTodo = { ...todo };
  
  if (result?.insertedId) {
    // Ajouter à la fois _id pour MongoDB et id comme string pour le front-end
    newTodo._id = result.insertedId;
    newTodo.id = result.insertedId.toString();
  }
  
  return newTodo;
}

// à ajouter en haut du fichier si ce n'est pas déjà fait

export async function updateTodo(id: string, updates: Partial<Todo>) {
  console.log(`Tentative de mise à jour pour l'ID: ${id}`);
  console.log(`Données de mise à jour:`, updates);
  
  try {
    const objectId = new ObjectId(id);
    
    if (!collections.todos) {
      throw new Error("Collection 'todos' is not initialized.");
    }
    
    // Vérifier si l'objet existe avant la mise à jour
    const todoExists = await collections.todos.findOne({ _id: objectId });
    if (!todoExists) {
      console.log(`Aucun todo trouvé avec l'ID: ${id}`);
      return null;
    }
    
    // Créer une copie des mises à jour sans les champs _id et id
    const cleanUpdates: Partial<Todo> = { ...updates };
    delete cleanUpdates._id;
    delete cleanUpdates.id;
    
    // Effectuer la mise à jour
    const result = await collections.todos.findOneAndUpdate(
      { _id: objectId },
      { $set: cleanUpdates },
      { returnDocument: "after" }
    );
    
    console.log(`Résultat de la mise à jour:`, result);
    
    // Si la mise à jour a réussi, retourner le document avec l'id formaté
    if (result) {
      return {
        ...result,
        id: result._id.toString() // Assurer que l'id est une chaîne
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du todo:`, error);
    throw error;
  }
}
export async function deleteTodo(id: string) {
  const objectId = new mongodb.ObjectId(id);
  const result = await collections.todos?.deleteOne({ _id: objectId });
  return result?.deletedCount === 1;
}
