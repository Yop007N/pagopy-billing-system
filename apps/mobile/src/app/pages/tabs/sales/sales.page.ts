import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, chevronForwardOutline } from 'ionicons/icons';

interface Sale {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending';
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton
  ]
})
export class SalesPage implements OnInit {
  sales: Sale[] = [];

  constructor(private router: Router) {
    addIcons({ addOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.loadSales();
  }

  loadSales() {
    // TODO: Load from API/Storage
    this.sales = [
      {
        id: '1',
        date: '2025-10-11',
        customer: 'Juan Pérez',
        amount: 250000,
        status: 'completed'
      }
    ];
  }

  goToSaleDetail(saleId: string) {
    this.router.navigate(['/sales/detail', saleId]);
  }

  goToNewSale() {
    this.router.navigate(['/sales/new']);
  }
}
