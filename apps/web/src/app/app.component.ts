import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header bg-primary text-white shadow-md">
        <div class="container mx-auto px-4 py-4">
          <h1 class="text-2xl font-bold">PagoPy - Sistema de Facturación</h1>
        </div>
      </header>

      <main class="app-main container mx-auto px-4 py-6">
        <router-outlet />
      </main>

      <footer class="app-footer bg-gray-100 mt-auto">
        <div class="container mx-auto px-4 py-4 text-center text-gray-600">
          <p>&copy; 2025 PagoPy. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-main {
      flex: 1;
    }
  `]
})
export class AppComponent {
  title = 'PagoPy';
}
