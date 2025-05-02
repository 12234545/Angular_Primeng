import * as mongodb from 'mongodb';
import { ObjectId } from 'mongodb';
import { User } from './user';

export const collections: {
  users?: mongodb.Collection<User>;
} = {};

// Connexion à la base de données
export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db('formito');
  await applySchemaValidation(db);

  const usersCollection = db.collection<User>('users');
  collections.users = usersCollection;

  return { db, client };
}

// Validation du schéma
async function applySchemaValidation(db: mongodb.Db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: 'object',
      required: ['fullName', 'email', 'password'],
      additionalProperties: false,
      properties: {
        _id: {},
        id: {},
        fullName: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        email: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        password: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
      },
    },
  };

  try {
    await db.command({
      collMod: 'users',
      validator: jsonSchema,
    });
  } catch (error) {
    if ((error as any).codeName === 'NamespaceNotFound') {
      await db.createCollection('users', { validator: jsonSchema });
    } else {
      console.error('Error applying schema validation:', error);
      throw error;
    }
  }
}

// Récupérer tous les utilisateurs
export async function getUsers() {
  if (!collections.users) throw new Error('Collection not initialized');
  return await collections.users.find().toArray();
}

// Récupérer un utilisateur par son ID
export async function getUserById(id: string) {
  if (!collections.users) throw new Error('Collection not initialized');
  const objectId = new ObjectId(id);
  return await collections.users.findOne({ _id: objectId });
}

// Récupérer des utilisateurs par email
export async function getUserByEmail(email: string) {
  if (!collections.users) throw new Error('Collection not initialized');
  return await collections.users.find({ email: email }).toArray();
}

// Créer un utilisateur
export async function createUser(user: User) {
  if (!collections.users) throw new Error('Collection not initialized');
  
  // Vérifier si l'utilisateur existe déjà avec cet email
  const existingUser = await collections.users.findOne({ email: user.email });
  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }
  
  const result = await collections.users.insertOne(user);
  return {
    ...user,
    _id: result.insertedId,
    id: result.insertedId.toString()
  };
}

// Mettre à jour un utilisateur
export async function updateUser(id: string, updates: Partial<User>) {
  if (!collections.users) {
    throw new Error("La collection 'users' n'est pas initialisée.");
  }

  try {
    const objectId = new ObjectId(id);
    
    // Vérifier si l'utilisateur existe avant la mise à jour
    const userExists = await collections.users.findOne({ _id: objectId });
    if (!userExists) {
      console.log(`Aucun utilisateur trouvé avec l'ID: ${id}`);
      return null;
    }
    
    // Créer une copie des mises à jour sans les champs _id et id
    const cleanUpdates: Partial<User> = { ...updates };
    delete cleanUpdates._id;
    delete cleanUpdates.id;
    
    // Effectuer la mise à jour
    const result = await collections.users.findOneAndUpdate(
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
    console.error(`Erreur lors de la mise à jour de l'utilisateur:`, error);
    throw error;
  }
}

// Supprimer un utilisateur
export async function deleteUser(id: string) {
  if (!collections.users) throw new Error('Collection not initialized');
  const objectId = new ObjectId(id);
  const result = await collections.users.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}