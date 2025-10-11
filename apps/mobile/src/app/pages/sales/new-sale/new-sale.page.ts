import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonList,
  IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, addCircleOutline, trashOutline } from 'ionicons/icons';

interface SaleItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.page.html',
  styleUrls: ['./new-sale.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonList,
    IonTextarea
  ]
})
export class NewSalePage {
  sale = {
    customerName: '',
    customerRuc: '',
    paymentMethod: 'cash',
    notes: ''
  };

  items: SaleItem[] = [
    { description: '', quantity: 1, price: 0, total: 0 }
  ];

  constructor(private router: Router) {
    addIcons({ saveOutline, addCircleOutline, trashOutline });
  }

  addItem() {
    this.items.push({ description: '', quantity: 1, price: 0, total: 0 });
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
    }
  }

  updateItemTotal(item: SaleItem) {
    item.total = item.quantity * item.price;
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  async saveSale() {
    // TODO: Implement save logic with offline support
    console.log('Saving sale:', { sale: this.sale, items: this.items });
    this.router.navigate(['/tabs/sales']);
  }
}
