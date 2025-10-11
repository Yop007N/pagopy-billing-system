import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, statsChartOutline, cashOutline, documentTextOutline } from 'ionicons/icons';

interface DashboardStats {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  pendingInvoices: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent
  ]
})
export class HomePage implements OnInit {
  stats: DashboardStats = {
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    pendingInvoices: 0
  };

  constructor(private router: Router) {
    addIcons({ addOutline, statsChartOutline, cashOutline, documentTextOutline });
  }

  ngOnInit() {
    this.loadStats();
  }

  async loadStats() {
    // TODO: Load actual stats from API/Storage
    this.stats = {
      todaySales: 1250000,
      weekSales: 8750000,
      monthSales: 35000000,
      pendingInvoices: 5
    };
  }

  handleRefresh(event: any) {
    this.loadStats();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  goToNewSale() {
    this.router.navigate(['/sales/new']);
  }

  goToInvoices() {
    this.router.navigate(['/invoices']);
  }
}
