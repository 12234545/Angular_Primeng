import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductComponent } from '../components/product/product.component';



@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    ProductComponent
  ],
  exports: [
    ProductComponent
  ]
})
export class ProductModule { }
