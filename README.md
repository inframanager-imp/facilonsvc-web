# Facilon Platform Web

React.js frontend application for the Facilon Platform.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (v7 or higher) or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

The page will automatically reload if you make changes to the code.

### Production Build

Create a production build:
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Running Tests

Run the test suite:
```bash
npm test
```

## Configuration

### Environment Variables

The application uses environment-specific configuration files:
- `src/config/environment.ts` - Base configuration
- `src/config/environment.dev.ts` - Development environment
- `src/config/environment.prod.ts` - Production environment
- `src/config/environment.qa.ts` - QA environment
- `src/config/environment.uat.ts` - UAT environment

### API Configuration

Make sure the backend API is running and accessible. The API base URL is configured in the environment files.

Default API URL: `http://localhost:8080/api`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Project Structure

```
src/
├── components/       # Reusable React components
├── contexts/         # React Context providers
├── guards/           # Route protection components
├── i18n/            # Internationalization configuration
├── models/          # TypeScript interfaces/DTOs
├── services/        # API service classes
├── utils/           # Utility functions
└── views/           # Page components
```

## Features

- ✅ User Authentication (Login, Signup, Password Reset)
- ✅ Role-Based Access Control (RBAC)
- ✅ Super Admin Dashboard
- ✅ Tenant Management
- ✅ User Management
- ✅ Role Management
- ✅ User Group Management
- ✅ Tenant Registration
- ✅ Internationalization (i18n)
- ✅ Responsive Design with Bootstrap

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, the app will automatically try the next available port (3001, 3002, etc.).

### API Connection Issues

1. Ensure the backend API is running
2. Check the API base URL in environment configuration
3. Verify CORS settings on the backend

### Build Errors

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear build cache:
```bash
npm start -- --reset-cache
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - All rights reserved
