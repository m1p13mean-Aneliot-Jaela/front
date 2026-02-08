# M1P13 MEAN Stack - Frontend

Angular application with modular architecture following best practices.

## Features

- Modular architecture (Core, Shared, Features, Layouts)
- Lazy-loaded feature modules
- Authentication service with JWT support
- Generic API service
- Reactive forms
- Route guards and interceptors ready
- TypeScript strict mode
- Hot Module Replacement (HMR)

## Prerequisites

- Node.js (v18+)
- npm (v9+)
- Docker & Docker Compose (optional, for containerized deployment)

## Installation

```bash
npm install
```

## Configuration

Environment files are located in `src/environments/`:
- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

Update the `apiUrl` to point to your backend API.

## Running the Application

### Local Development

Development server with hot reload:
```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200/`

Build for production:
```bash
npm run build
```

Watch mode (auto-rebuild):
```bash
npm run watch
```

### Docker Development

For development with Docker, you can use the existing docker-compose:
```bash
# Start the container
docker-compose up

# Rebuild and start
docker-compose up --build

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:4200/`

### Docker Production

Build production image:
```bash
docker build -t m1p13mean-frontend .
```

Run production container:
```bash
docker run -d -p 4200:80 --name m1p13mean-frontend m1p13mean-frontend
```

With docker-compose:
```bash
docker-compose up -d
```

## Testing

```bash
npm test
```

## Project Structure

```
src/app/
├── core/                  # Singleton services, guards, interceptors
│   ├── services/          # Core services (API, Auth)
│   │   ├── api.service.ts
│   │   └── auth.service.ts
│   ├── guards/            # Route guards
│   ├── interceptors/      # HTTP interceptors
│   └── core.module.ts
│
├── shared/                # Shared components, pipes, directives
│   ├── components/        # Reusable components
│   ├── pipes/             # Custom pipes
│   ├── directives/        # Custom directives
│   └── shared.module.ts
│
├── features/              # Feature modules (lazy-loaded)
│   ├── auth/              # Authentication feature
│   ├── user/              # User management feature
│   └── dashboard/         # Dashboard feature
│
├── layouts/               # Layout components
├── app-routing.module.ts  # Root routing
├── app.component.ts       # Root component
└── app.module.ts          # Root module
```

## Architecture Guidelines

### Core Module
- Import **only once** in AppModule
- Contains singleton services (API, Auth, etc.)
- Contains guards and interceptors
- Cannot be imported by feature modules

### Shared Module
- Can be imported by any feature module
- Contains reusable components, pipes, and directives
- Exports common Angular modules (FormsModule, etc.)

### Feature Modules
- Lazy-loaded for better performance
- Self-contained business domains
- Can import SharedModule
- Cannot import other feature modules directly

### Layouts
- Contains layout components (header, footer, sidebar)
- Used by routing configuration

## Adding New Features

Create a new feature module:
```bash
ng generate module features/my-feature --route my-feature --module app-routing.module
```

Add components, services, and routes within the feature module following the modular pattern.

## API Integration

The `ApiService` in `core/services/` provides generic HTTP methods. Use it in your feature services:

```typescript
import { ApiService } from '@app/core/services/api.service';

export class MyService {
  constructor(private api: ApiService) {}
  
  getData() {
    return this.api.get<MyData>('/endpoint');
  }
}
```

## Environment Variables

Update `src/environments/environment.ts` for development:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Update `src/environments/environment.prod.ts` for production:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api.com/api'
};
```

## Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests
- `ng serve` - Start dev server (same as npm start)
- `ng build` - Build the application
- `ng test` - Run tests
- `ng lint` - Lint the code (if configured)

## Docker Notes

The production Docker image uses:
- **Multi-stage build** for optimized image size
- **Nginx** as the web server
- **Gzip compression** for faster loading
- **Security headers** for enhanced security
- **Angular routing** support (try_files)
- **Static asset caching** for better performance

Nginx serves the built application on port 80, mapped to port 4200 on the host.

## License

MIT
