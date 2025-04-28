# Holobots Monorepo

This is a monorepo for the Holobots project, containing both the web and mobile applications.

## Project Structure

```
holobots/
├── apps/
│   ├── web/                # Web frontend (React)
│   │   ├── public/
│   │   ├── src/
│   │   └── ...
│   └── mobile/             # React Native / Expo app
│       ├── ios/
│       ├── app/            # Expo Router app
│       ├── assets/
│       └── ...
├── packages/
│   ├── shared/             # Shared logic
│   │   ├── constants/
│   │   ├── supabase/
│   │   ├── types/
│   │   └── utils/
│   └── ui/                 # Shared UI components
│       └── components/
├── turbo.json              # Turborepo config
├── package.json            # Workspaces config
└── tsconfig.json           # Path aliases, root config
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   # Run all projects
   npm run dev
   
   # Run specific project
   npm run dev:web    # Web app only
   npm run dev:mobile # Mobile app only
   ```

3. Build the projects:
   ```
   npm run build      # Build all
   npm run build:web  # Build web only
   ```

## Useful Commands

- `npm run lint`: Run ESLint on all projects
- `npm run format`: Format code with Prettier

## Package Management

This monorepo uses npm workspaces for package management. When adding dependencies:

- For root-level dependencies (like build tools): `npm install -D <package>`
- For specific project: `npm install <package> --workspace=web`
- For shared packages: `npm install <package> --workspace=shared`

## Notes

- The mobile app is an Expo React Native application using Expo Router
- The web app is a React application using Vite
- Shared code includes Supabase client, types, and utilities
- The UI package contains shared components that work on both web and mobile 