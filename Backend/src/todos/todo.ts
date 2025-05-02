import * as mongodb from 'mongodb';

export interface Todo {
    _id?: mongodb.ObjectId; // Champ MongoDB interne
    id?: string;           // Pour la compatibilité avec l'interface existante
    task: string;
    completed: boolean;
}