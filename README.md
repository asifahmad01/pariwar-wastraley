# Pariwar Wastraley

A full-stack clothing store catalog built with **Next.js 14**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, **Tailwind CSS**, and **Cloudinary** — featuring an admin panel for managing products, categories, styles, variants, and inventory with image upload support.

---

## Features

- **Public Storefront** — Hero section, product catalog with filter/search, contact section
- **Product Filtering** — Filter by category, style, color, size
- **Admin Panel** — Protected dashboard to manage the entire catalog
- **Product Management** — Add, edit, delete products with multi-category support
- **Variant Management** — Per-product color + size variants with stock quantity
- **Image Uploads** — Cloudinary integration for product images
- **Category & Style Management** — Dynamic taxonomy management
- **Auth Protection** — Session-cookie-based admin authentication via Next.js middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database ORM | Prisma |
| Database | PostgreSQL (SQLite for local dev) |
| Image Storage | Cloudinary |
| Deployment | Vercel + Neon PostgreSQL |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or SQLite for local)
- Cloudinary account

### Installation

```bash
git clone https://github.com/your-username/pariwar-wastraley.git
cd pariwar-wastraley
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_PASSWORD=your_admin_password
```

> For local development with SQLite, set `DATABASE_URL="file:./dev.db"` and change the Prisma provider to `sqlite`.

### Database Setup

```bash
npx prisma db push
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
pariwar-wastraley/
├── app/
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes (products, categories, styles, upload, auth)
│   ├── page.tsx        # Public storefront
│   └── layout.tsx
├── components/
│   ├── layout/         # Navbar, Footer
│   ├── sections/       # Hero, ContactSection
│   └── ui/             # ProductCard, FilterBar, CategoryCard, etc.
├── lib/                # Prisma client, Cloudinary config, utilities
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── middleware.ts       # Admin route protection
```

---

## Deployment

### Vercel + Neon PostgreSQL

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Create a free PostgreSQL database on [Neon](https://neon.tech)
4. Add all environment variables in Vercel project settings
5. Deploy

---

## License

MIT
