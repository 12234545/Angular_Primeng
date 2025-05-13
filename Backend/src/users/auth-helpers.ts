import * as bcrypt from 'bcrypt';

// Fonction pour hacher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Fonction pour comparer un mot de passe en clair avec un hash
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Fonction d'authentification utilisateur
export async function authenticateUser(users: any[], email: string, password: string) {
  // Vérifier si un utilisateur avec cet email existe
  const user = users.find(u => u.email === email);
  if (!user) {
    return null; // Utilisateur non trouvé
  }
  
  // Si le mot de passe n'est pas haché (pour la rétrocompatibilité)
  if (!user.password.startsWith('$2b$') && user.password === password) {
    return user;
  }
  
  // Vérifier le mot de passe haché
  const isValid = await comparePassword(password, user.password);
  return isValid ? user : null;
}