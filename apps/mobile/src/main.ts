import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { ErrorHandlerService } from './app/core/services/error-handler.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Global error handler
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    provideIonicAngular({
      mode: 'md',
      rippleEffect: true,
      animated: true
    }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      // Order matters: error interceptor should run before auth interceptor
      withInterceptors([errorInterceptor, authInterceptor])
    )
  ]
}).catch(err => console.error(err));
