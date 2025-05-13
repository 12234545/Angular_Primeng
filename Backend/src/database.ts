import * as mongodb from 'mongodb';
import { User } from './users';

export const collections: {
    users?: mongodb.Collection<User>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db('mydatabase'); // Remplacez par le nom de votre base de données
    await applySchemaValidation(db);

    const usersCollection = db.collection<User>('users'); // Remplacez par le nom de votre collection
    collections.users = usersCollection;
    
    return { db, client };
}

async function applySchemaValidation(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: 'object',
            required: ['fullName', 'email', 'password'], // Correction: fullName au lieu de fullname
            additionalProperties: false,
            properties: {
                _id: {}, // Ajout du champ _id pour MongoDB
                id: {},  // Pour la compatibilité avec l'interface User
                fullName: { // Correction: fullName au lieu de fullname
                    bsonType: 'string',
                    description: 'must be a string and is required',
                },
                email: {
                    bsonType: 'string',
                    description: 'must be a string and is required',
                },
                password: {
                    bsonType: 'string',
                    description: 'must be a string and is required and at least 8 characters long',
                    minLength: 8, // Correction: minLength au lieu de minLenghth
                },
            },
        },
    };

    // Appliquer le schéma de validation à la collection
    try {
        await db.command({
            collMod: 'users',
            validator: jsonSchema
        });
    } catch (error) {
        // Si la collection n'existe pas encore, elle sera créée avec le schéma de validation
        if ((error as any).codeName === 'NamespaceNotFound') {
            await db.createCollection('users', { validator: jsonSchema });
        } else {
            console.error('Error applying schema validation:', error);
            throw error;
        }
    }
}
