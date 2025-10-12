import { Component, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

export interface SearchFilter {
  key: string;
  label: string;
  icon?: string;
  active: boolean;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <div class="search-bar-container">
      <!-- Search Bar -->
      <ion-searchbar
        [value]="searchTerm()"
        (ionInput)="onSearchInput($event)"
        (ionClear)="onClear()"
        [placeholder]="placeholder"
        [debounce]="debounceTime"
        [showClearButton]="showClearButton"
        [animated]="animated"
      />

      <!-- Filters -->
      @if (filters && filters.length > 0) {
        <div class="filters-container">
          <ion-chip
            *ngFor="let filter of filters"
            [color]="filter.active ? 'primary' : 'medium'"
            [outline]="!filter.active"
            (click)="toggleFilter(filter)"
            class="filter-chip"
          >
            @if (filter.icon) {
              <ion-icon [name]="filter.icon" />
            }
            <ion-label>{{ filter.label }}</ion-label>
          </ion-chip>
        </div>
      }

      <!-- Active Filters Summary -->
      @if (activeFilters().length > 0 && showActiveFiltersSummary) {
        <div class="active-filters-summary">
          <ion-chip color="primary" size="small">
            <ion-icon name="funnel-outline" />
            <ion-label>{{ activeFilters().length }} filtro{{ activeFilters().length > 1 ? 's' : '' }} activo{{ activeFilters().length > 1 ? 's' : '' }}</ion-label>
            <ion-icon name="close-circle" (click)="clearAllFilters()" />
          </ion-chip>
        </div>
      }

      <!-- Search Results Count -->
      @if (showResultsCount && resultsCount !== undefined && searchTerm()) {
        <div class="results-count">
          <ion-text color="medium">
            <p>{{ resultsCount }} resultado{{ resultsCount !== 1 ? 's' : '' }} encontrado{{ resultsCount !== 1 ? 's' : '' }}</p>
          </ion-text>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-bar-container {
      padding: 8px;
      background: var(--ion-background-color);
    }

    ion-searchbar {
      padding: 0;
      --background: var(--ion-color-light);
      --border-radius: 12px;
    }

    .filters-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      padding: 0 4px;
    }

    .filter-chip {
      margin: 0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-chip:active {
      transform: scale(0.95);
    }

    .active-filters-summary {
      margin-top: 8px;
      padding: 0 4px;
    }

    .active-filters-summary ion-chip {
      margin: 0;
    }

    .active-filters-summary ion-icon:last-child {
      cursor: pointer;
      margin-left: 4px;
    }

    .results-count {
      margin-top: 8px;
      padding: 0 8px;
      text-align: center;
    }

    .results-count p {
      margin: 0;
      font-size: 13px;
    }

    /* Animation for filter chips */
    .filter-chip {
      animation: fadeInScale 0.3s ease-out;
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class SearchBarComponent {
  @Input() placeholder = 'Buscar...';
  @Input() debounceTime = 300;
  @Input() showClearButton = 'focus';
  @Input() animated = true;
  @Input() filters?: SearchFilter[];
  @Input() showActiveFiltersSummary = true;
  @Input() showResultsCount = false;
  @Input() resultsCount?: number;

  @Output() search = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<SearchFilter[]>();
  @Output() clear = new EventEmitter<void>();

  searchTerm = signal<string>('');
  activeFilters = signal<SearchFilter[]>([]);

  constructor() {
    // Update active filters whenever filters change
    effect(() => {
      if (this.filters) {
        this.activeFilters.set(this.filters.filter(f => f.active));
      }
    }, { allowSignalWrites: true });
  }

  onSearchInput(event: any): void {
    const value = event.target.value || '';
    this.searchTerm.set(value);
    this.search.emit(value);
  }

  onClear(): void {
    this.searchTerm.set('');
    this.clear.emit();
    this.search.emit('');
  }

  toggleFilter(filter: SearchFilter): void {
    if (!this.filters) return;

    filter.active = !filter.active;
    this.activeFilters.set(this.filters.filter(f => f.active));
    this.filterChange.emit(this.filters);
  }

  clearAllFilters(): void {
    if (!this.filters) return;

    this.filters.forEach(f => f.active = false);
    this.activeFilters.set([]);
    this.filterChange.emit(this.filters);
  }

  // Public method to programmatically set search term
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    this.search.emit(term);
  }

  // Public method to get current search term
  getSearchTerm(): string {
    return this.searchTerm();
  }

  // Public method to get active filters
  getActiveFilters(): SearchFilter[] {
    return this.activeFilters();
  }
}
