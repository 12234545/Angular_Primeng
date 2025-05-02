export interface Product {
  id?: string;
  _id?: string | object;  // Pour accepter le ObjectId de MongoDB
  name: string;
  image: string;
  description: string;
  price: number;
}
