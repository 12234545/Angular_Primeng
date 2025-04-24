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
    this.currentProduct = product;
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
      const productData = {
        ...this.editForm.value,
        id: this.currentProduct.id
      };

      this.productService.updateProduct(productData).subscribe(
        response => {
          this.editVisible = false;
          this.getList();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully' });
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product' });
        }
      );
    } else {
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        control?.markAsDirty();
        control?.markAsTouched();
      });
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
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

  getList() {
    this.productService.getProducts().subscribe(
      response => {
        this.products = response;
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products' });
      }
    );
  }



  deleteProduct(e: unknown, id: Product['id']) {
    this.productService.deleteProduct(id).subscribe(
      response => {
        this.getList();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully' });
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product' });
      }
    );
  }

  addProduct() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      this.productService.addProduct(productData).subscribe(
        response => {
          this.visible = false;
          this.getList();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product added successfully' });
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add product' });
        }
      );
    } else {

      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsDirty();
        control?.markAsTouched();
      });
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
    }
  }
}
