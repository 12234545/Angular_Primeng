import * as mongodb from 'mongodb';

export interface User {
    id?: mongodb.ObjectId; // Optionnel car créé par MongoDB
    _id?: mongodb.ObjectId; // Champ MongoDB interne
    fullName: string;      // Correction: fullName au lieu de fullname
    email: string;
    password: string;
}