# Platform Admin Portal

A comprehensive platform administration portal for managing organizations, users, subscriptions, and platform-wide settings.

## Features

- **Dashboard**: Overview of platform metrics and activity
- **Organization Management**: Create, manage, and configure organizations
- **User Management**: Handle user accounts, roles, and permissions
- **Subscription Management**: Manage platform subscriptions and billing
- **Pricing Configuration**: Set up and manage pricing for different entity types
- **Settings**: Platform-wide configuration and preferences
- **Pet Management**: Directory of species, breeds, and pet-related data

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Radix UI components with shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query (TanStack Query), React Context
- **Styling**: Tailwind CSS
- **Routing**: React Router v6

## Directory Structure

```
src/
├── app/                    # App-level configuration
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── layout/            # Layout components
│   ├── navigation/        # Navigation components
│   ├── forms/             # Form components
│   └── common/            # Common utility components
├── features/              # Feature-based modules
│   ├── auth/              # Authentication
│   ├── organizations/     # Organization management
│   ├── users/             # User management
│   ├── subscriptions/     # Subscription management
│   ├── settings/          # Platform settings
│   ├── pricing/           # Pricing configuration
│   └── pets/              # Pet management
├── pages/                 # Top-level page components
├── shared/                # Shared utilities and services
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── constants/         # Application constants
│   ├── services/          # API services
│   └── config/            # Configuration files
├── lib/                   # Third-party library configurations
├── integrations/          # External service integrations
└── assets/                # Static assets
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Configure Supabase connection in `.env.local`

4. Start the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler

## Architecture

This project follows a feature-based architecture where each major feature has its own directory containing:
- Page components
- Feature-specific components
- Hooks and utilities
- Types and interfaces

Shared functionality is located in the `shared/` directory and can be used across features.
