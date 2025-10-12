import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET requests', () => {
    it('should make a successful GET request', (done) => {
      const mockData = { id: '1', name: 'Test' };
      const endpoint = '/test';

      service.get<typeof mockData>(endpoint).subscribe({
        next: (data) => {
          expect(data).toEqual(mockData);
          done();
        },
        error: () => fail('Expected successful request')
      });

      const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should retry failed GET requests', (done) => {
      const mockData = { id: '1', name: 'Test' };
      const endpoint = '/test';
      let attempts = 0;

      service.get<typeof mockData>(endpoint).subscribe({
        next: (data) => {
          expect(data).toEqual(mockData);
          expect(attempts).toBeGreaterThan(1); // Should have retried
          done();
        },
        error: () => fail('Expected successful request after retry')
      });

      // First request fails
      const req1 = httpMock.expectOne(`${apiUrl}${endpoint}`);
      attempts++;
      req1.flush('Server Error', { status: 500, statusText: 'Server Error' });

      // Wait for retry
      setTimeout(() => {
        const req2 = httpMock.expectOne(`${apiUrl}${endpoint}`);
        attempts++;
        req2.flush(mockData);
      }, 100);
    });

    it('should handle GET request errors', (done) => {
      const endpoint = '/test';

      service.get(endpoint).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toContain('Código de error');
          done();
        }
      });

      // Fail all retry attempts
      for (let i = 0; i <= 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      }
    });
  });

  describe('POST requests', () => {
    it('should make a successful POST request', (done) => {
      const mockRequest = { name: 'Test' };
      const mockResponse = { id: '1', ...mockRequest };
      const endpoint = '/test';

      service.post<typeof mockResponse>(endpoint, mockRequest).subscribe({
        next: (data) => {
          expect(data).toEqual(mockResponse);
          done();
        },
        error: () => fail('Expected successful request')
      });

      const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle POST request errors', (done) => {
      const mockRequest = { name: 'Test' };
      const endpoint = '/test';

      service.post(endpoint, mockRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('PUT requests', () => {
    it('should make a successful PUT request', (done) => {
      const mockRequest = { name: 'Updated Test' };
      const mockResponse = { id: '1', ...mockRequest };
      const endpoint = '/test/1';

      service.put<typeof mockResponse>(endpoint, mockRequest).subscribe({
        next: (data) => {
          expect(data).toEqual(mockResponse);
          done();
        },
        error: () => fail('Expected successful request')
      });

      const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle PUT request errors', (done) => {
      const mockRequest = { name: 'Updated Test' };
      const endpoint = '/test/1';

      service.put(endpoint, mockRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('DELETE requests', () => {
    it('should make a successful DELETE request', (done) => {
      const endpoint = '/test/1';

      service.delete(endpoint).subscribe({
        next: (data) => {
          expect(data).toBeDefined();
          done();
        },
        error: () => fail('Expected successful request')
      });

      const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle DELETE request errors', (done) => {
      const endpoint = '/test/1';

      service.delete(endpoint).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('isOnline', () => {
    it('should return true when navigator is online', () => {
      // Mock navigator.onLine
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      });

      expect(service.isOnline()).toBe(true);
    });

    it('should return false when navigator is offline', () => {
      // Mock navigator.onLine
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      expect(service.isOnline()).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle client-side errors', (done) => {
      const endpoint = '/test';
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Connection failed'
      });

      service.get(endpoint).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toContain('Error');
          done();
        }
      });

      // Trigger all retry attempts
      for (let i = 0; i <= 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
        req.error(errorEvent);
      }
    });

    it('should handle server-side errors with status codes', (done) => {
      const endpoint = '/test';

      service.get(endpoint).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toContain('Código de error');
          expect(error.message).toContain('500');
          done();
        }
      });

      // Trigger all retry attempts with server error
      for (let i = 0; i <= 3; i++) {
        const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
        req.flush('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error'
        });
      }
    });
  });
});
