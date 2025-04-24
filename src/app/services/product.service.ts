import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:3001';
  constructor(private http: HttpClient) { }

  getProducts() {
      return this.http.get<Product[]>(`${this.baseUrl}/product`);
    }
  addProduct(product: Product) {
    return this.http.post<Product>(`${this.baseUrl}/product`, product);
  }
  updateProduct(product: Product) {
    return this.http.put<Product>(`${this.baseUrl}/product/${product.id}`, product);
  }
  deleteProduct(id: Product['id']) {
    return this.http.delete<Product>(`${this.baseUrl}/product/${id}`);
  }

}
