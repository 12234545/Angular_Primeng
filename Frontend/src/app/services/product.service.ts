import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/product`)
      .pipe(
        map(products => {
          // Normaliser les produits pour s'assurer que chaque produit a un ID accessible
          return products.map(product => {
            const normalizedProduct: Product = { ...product };

            // S'assurer que l'ID est toujours disponible sous la propriété id
            if (product._id) {
              normalizedProduct.id = typeof product._id === 'object' ?
                product._id.toString() : product._id;
            }

            return normalizedProduct;
          });
        }),
        tap(products => {
          console.log('Produits récupérés:', products);
        }),
        catchError(this.handleError)
      );
  }

  getProductById(id: string): Observable<Product> {
    if (!id) {
      return throwError(() => new Error('ID requis pour récupérer un produit'));
    }

    return this.http.get<Product>(`${this.baseUrl}/product/${id}`)
      .pipe(
        map(product => {
          // Normaliser le produit
          const normalizedProduct: Product = { ...product };

          // S'assurer que l'ID est toujours disponible sous la propriété id
          if (product._id) {
            normalizedProduct.id = typeof product._id === 'object' ?
              product._id.toString() : product._id;
          }

          return normalizedProduct;
        }),
        tap(product => console.log('Produit récupéré:', product)),
        catchError(this.handleError)
      );
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/product`, product)
      .pipe(
        map(response => {
          // Normaliser le produit renvoyé
          const normalizedProduct: Product = { ...response };

          // S'assurer que l'ID est toujours disponible sous la propriété id
          if (response._id) {
            normalizedProduct.id = typeof response._id === 'object' ?
              response._id.toString() : response._id;
          }

          return normalizedProduct;
        }),
        tap(response => console.log('Produit ajouté:', response)),
        catchError(this.handleError)
      );
  }

  updateProduct(product: Product): Observable<Product> {
    // Extraire l'ID - utiliser id ou _id
    const productId = product.id || (product._id ?
      (typeof product._id === 'object' ? product._id.toString() : product._id) : null);

    if (!productId) {
      console.error('ID manquant pour la mise à jour du produit');
      return throwError(() => new Error('ID manquant pour la mise à jour'));
    }

    console.log('Mise à jour du produit avec ID:', productId);

    // Créer une copie sans les champs id et _id pour éviter les conflits avec MongoDB
    const { id, _id, ...productWithoutId } = product as any;

    // Utiliser PUT pour une mise à jour complète
    return this.http.put<Product>(`${this.baseUrl}/product/${productId}`, productWithoutId)
      .pipe(
        map(response => {
          // Normaliser le produit renvoyé
          const normalizedProduct: Product = { ...response };

          // S'assurer que l'ID est toujours disponible sous la propriété id
          normalizedProduct.id = productId;

          return normalizedProduct;
        }),
        tap(response => console.log('Produit mis à jour:', response)),
        catchError(this.handleError)
      );
  }

  deleteProduct(id: string): Observable<any> {
    if (!id) {
      console.error('ID manquant pour la suppression du produit');
      return throwError(() => new Error('ID manquant pour la suppression'));
    }

    console.log('Suppression du produit avec ID:', id);

    return this.http.delete<any>(`${this.baseUrl}/product/${id}`)
      .pipe(
        tap(response => console.log('Produit supprimé:', response)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
      console.error('Erreur client:', error.error.message);
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}, Message: ${error.message}`;
      console.error('Erreur serveur:', error);
      console.error('Status:', error.status);
      console.error('Body:', error.error);
    }

    console.error('Erreur complète:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
