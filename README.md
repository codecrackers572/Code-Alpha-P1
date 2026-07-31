# ShopLux

ShopLux is a modern e-commerce storefront built with React, TypeScript, Vite, Tailwind CSS, and Supabase. It provides a polished shopping experience with product browsing, search-friendly product pages, authentication, a shopping cart, wishlist support, order history, and a bundle-building experience.

## Features

- Responsive landing page with featured products and promotions
- Product catalog with category-based browsing
- Product detail pages with pricing and product information
- User authentication and account management
- Shopping cart and checkout flow
- Wishlist management
- Order history and account dashboard
- Bundle builder for creating curated product combinations
- Supabase-backed data storage and authentication

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase
- Lucide React

## Project Structure

- src/components - Reusable UI and page components
- src/context - Auth and cart state providers
- src/lib - Supabase client and shared types/utilities
- src/pages - Main application pages
- supabase/migrations - Database schema migration for Supabase

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm or pnpm
- A Supabase project

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Apply the database schema to your Supabase project by running the migration in [supabase/migrations/20260731155512_create_ecommerce_schema.sql](supabase/migrations/20260731155512_create_ecommerce_schema.sql).

### Development

Run the app locally:

```bash
npm run dev
```

The application will be available at the local Vite URL shown in the terminal.

### Build

Create a production build:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

The following environment variables are required:

- VITE_SUPABASE_URL: Your Supabase project URL
- VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key

## Database Setup

This project uses Supabase for authentication and database access. The schema includes tables for:

- categories
- products
- profiles
- cart items
- orders
- order items
- reviews
- wishlists
- bundles

## Notes

This app is designed as a polished demo storefront and can be extended with real payment processing, inventory management, and admin tools.
