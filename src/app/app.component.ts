import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'm1p13mean-frontend';
  isBackendReady = false;
  backendError = false;
  initializationMessage = 'Initializing backend services...';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Only initialize backend in production (Render free tier sleeps)
    if (environment.production) {
      this.initializeBackend();
    } else {
      // In development, skip initialization
      this.isBackendReady = true;
    }
  }

  private initializeBackend() {
    const startTime = Date.now();
    const baseUrl = environment.apiUrl.replace('/api', '');
    
    // Wake up the backend (free Render services sleep after 15 min)
    this.http.get(`${baseUrl}/health`, { 
      observe: 'response',
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => {
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        this.initializationMessage = `Backend ready! (${elapsedTime}s)`;
        setTimeout(() => {
          this.isBackendReady = true;
        }, 500);
      },
      error: (error) => {
        console.error('Backend initialization failed:', error);
        this.initializationMessage = 'Backend unavailable. Retrying...';
        this.backendError = true;
        // Retry after 3 seconds
        setTimeout(() => {
          this.backendError = false;
          this.initializeBackend();
        }, 3000);
      }
    });
  }
}
