import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type LoadingVariant = 'list' | 'card' | 'detail' | 'grid';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="loading-container">
      <!-- List Skeleton -->
      @if (variant === 'list') {
        @for (item of skeletonArray; track item) {
          <ion-item lines="full">
            <ion-thumbnail slot="start">
              <ion-skeleton-text [animated]="animated" />
            </ion-thumbnail>
            <ion-label>
              <h3><ion-skeleton-text [animated]="animated" style="width: 70%" /></h3>
              <p><ion-skeleton-text [animated]="animated" style="width: 50%" /></p>
              <p><ion-skeleton-text [animated]="animated" style="width: 30%" /></p>
            </ion-label>
          </ion-item>
        }
      }

      <!-- Card Skeleton -->
      @if (variant === 'card') {
        @for (item of skeletonArray; track item) {
          <ion-card>
            <ion-card-header>
              <ion-skeleton-text [animated]="animated" style="width: 60%" />
              <ion-skeleton-text [animated]="animated" style="width: 40%" />
            </ion-card-header>
            <ion-card-content>
              <ion-skeleton-text [animated]="animated" style="width: 100%" />
              <ion-skeleton-text [animated]="animated" style="width: 90%" />
              <ion-skeleton-text [animated]="animated" style="width: 70%" />
            </ion-card-content>
          </ion-card>
        }
      }

      <!-- Detail Skeleton -->
      @if (variant === 'detail') {
        <ion-card>
          <!-- Header -->
          <ion-card-header>
            <div class="detail-header">
              <ion-skeleton-text [animated]="animated" style="width: 50%; height: 24px" />
              <ion-skeleton-text [animated]="animated" style="width: 30%; height: 16px" />
            </div>
          </ion-card-header>

          <!-- Content -->
          <ion-card-content>
            <!-- Info rows -->
            @for (item of [1, 2, 3, 4, 5, 6]; track item) {
              <div class="detail-row">
                <ion-skeleton-text [animated]="animated" style="width: 30%" />
                <ion-skeleton-text [animated]="animated" style="width: 40%" />
              </div>
            }

            <!-- Items section -->
            <div class="detail-section">
              <ion-skeleton-text [animated]="animated" style="width: 40%; height: 20px" />
              @for (item of [1, 2, 3]; track item) {
                <div class="detail-item">
                  <ion-skeleton-text [animated]="animated" style="width: 60%" />
                  <ion-skeleton-text [animated]="animated" style="width: 30%" />
                </div>
              }
            </div>

            <!-- Total -->
            <div class="detail-total">
              <ion-skeleton-text [animated]="animated" style="width: 50%; height: 24px" />
            </div>
          </ion-card-content>
        </ion-card>
      }

      <!-- Grid Skeleton -->
      @if (variant === 'grid') {
        <div class="grid-container">
          @for (item of skeletonArray; track item) {
            <div class="grid-item">
              <ion-card>
                <div class="grid-image">
                  <ion-skeleton-text [animated]="animated" />
                </div>
                <ion-card-content>
                  <ion-skeleton-text [animated]="animated" style="width: 80%" />
                  <ion-skeleton-text [animated]="animated" style="width: 60%" />
                </ion-card-content>
              </ion-card>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      padding: 8px 0;
    }

    ion-card {
      margin: 8px;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
    }

    ion-thumbnail {
      width: 56px;
      height: 56px;
    }

    /* Detail Skeleton */
    .detail-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .detail-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--ion-color-light);
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin: 12px 0;
    }

    .detail-total {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid var(--ion-color-light);
      text-align: right;
    }

    /* Grid Skeleton */
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
      padding: 8px;
    }

    .grid-item ion-card {
      margin: 0;
      height: 100%;
    }

    .grid-image {
      width: 100%;
      height: 120px;
    }

    .grid-image ion-skeleton-text {
      width: 100%;
      height: 100%;
    }

    /* Animation */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class LoadingComponent {
  @Input() variant: LoadingVariant = 'list';
  @Input() count = 5;
  @Input() animated = true;

  get skeletonArray(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
