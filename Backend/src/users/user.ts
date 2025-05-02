import * as mongodb from 'mongodb';

export interface User {
    _id?: mongodb.ObjectId; // Champ MongoDB interne
    id?: string;           // Pour la compatibilité avec l'interface existante
    fullName: string;
    email: string;
    password: string;
}