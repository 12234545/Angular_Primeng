import { Component, OnInit } from '@angular/core';
import { ProductModule } from '../../product/product.module';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  imports: [
    ProductModule,
    CardModule,
    ButtonModule,
    RouterLink,
    TableModule,
    DialogModule,
    InputTextModule,
    Dialog,
    ReactiveFormsModule,
    ToastModule,
    CommonModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  providers: [MessageService]
})
export class ProductComponent implements OnInit {

  visible: boolean = false;
  productForm: FormGroup;
  products: Product[] = [];

  editVisible: boolean = false;
  currentProduct: Product | null = null;
  editForm: FormGroup;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      image: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required]],
      image: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.getList();
  }

  showDialog() {
    this.productForm.reset({
      name: '',
      image: '',
      description: '',
      price: 0
    });
    this.visible = true;
  }

  showEditDialog(product: Product) {
    console.log('Product to edit:', product);

    // Résoudre l'ID ici - utiliser _id s'il existe, sinon id
    const productId = product._id?.toString() || product.id?.toString();
    console.log('Product ID:', productId);

    // S'assurer que l'ID est bien défini
    if (!productId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID du produit manquant'
      });
      return;
    }

    this.currentProduct = {
      ...product,
      id: productId // S'assurer que l'ID est correct
    };

    this.editForm.patchValue({
      name: product.name,
      image: product.image,
      description: product.description,
      price: product.price
    });
    this.editVisible = true;
  }

  get editName() {
    return this.editForm.controls['name'];
  }

  get editImage() {
    return this.editForm.controls['image'];
  }

  get editDescription() {
    return this.editForm.controls['description'];
  }

  get editPrice() {
    return this.editForm.controls['price'];
  }

  updateProduct() {
    if (this.editForm.valid && this.currentProduct) {
      // Résoudre l'ID - utiliser _id ou id
      const productId = this.currentProduct._id?.toString() || this.currentProduct.id?.toString();

      if (!productId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'ID du produit manquant'
        });
        return;
      }

      // Créer un nouvel objet avec l'ID correct
      const productData: Product = {
        id: productId,
        name: this.editForm.value.name,
        image: this.editForm.value.image,
        description: this.editForm.value.description,
        price: this.editForm.value.price
      };

      console.log('Product data to update:', productData);

      this.productService.updateProduct(productData).subscribe({
        next: (response) => {
          console.log('Mise à jour réussie:', response);
          this.editVisible = false;
          this.getList();
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Produit mis à jour avec succès' });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour du produit' });
        }
      });
    } else {
      // Mettre en évidence les champs invalides
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        control?.markAsDirty();
        control?.markAsTouched();
      });
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir tous les champs requis' });
    }
  }

  get name() {
    return this.productForm.controls['name'];
  }

  get image() {
    return this.productForm.controls['image'];
  }

  get description() {
    return this.productForm.controls['description'];
  }

  get price() {
    return this.productForm.controls['price'];
  }

  // Méthode pour récupérer la liste des produits
  getList() {
    console.log('Récupération de la liste des produits...');
    this.productService.getProducts().subscribe({
      next: (response) => {
        console.log('Produits récupérés:', response);
        this.products = response;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les produits'
        });
      }
    });
  }

  // Méthode pour ajouter un produit
  addProduct() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      console.log('Données du produit à ajouter:', productData);

      this.productService.addProduct(productData).subscribe({
        next: (response) => {
          console.log('Produit ajouté avec succès:', response);
          this.visible = false;
          this.getList();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Produit ajouté avec succès'
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du produit:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible d\'ajouter le produit'
          });
        }
      });
    } else {
      console.warn('Formulaire invalide:', this.productForm.errors);
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          console.warn(`Champ invalide: ${key}`, control.errors);
        }
        control?.markAsDirty();
        control?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
    }
  }

  deleteProduct(e: Event, product: Product) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Extraire l'ID correctement - utiliser _id ou id
    const productId = product._id?.toString() || product.id?.toString();

    // Vérifier si l'ID est défini
    if (!productId) {
      console.error('ID manquant ou invalide pour la suppression');
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID du produit manquant'
      });
      return;
    }

    console.log('Tentative de suppression du produit avec ID:', productId);

    this.productService.deleteProduct(productId).subscribe({
      next: (response) => {
        console.log('Produit supprimé avec succès:', response);
        this.getList();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Produit supprimé avec succès'
        });
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la suppression du produit'
        });
      }
    });
  }
}
