# Photographer Portfolio Website

![Next.js](https://img.shields.io/badge/Next.js-black?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-unspecified-lightgrey)

A modern, responsive photographer portfolio website built with Next.js, TypeScript, Tailwind CSS, and Supabase. The platform includes a public gallery experience, image search and filtering, a secure admin panel, and image management tools for photographers.

## Features

- Responsive gallery with category filtering, search, and full-screen lightbox viewing
- Contact and about pages, SEO-friendly page structure, optimized image loading
- Supabase-authenticated admin dashboard for image upload, editing, and organization
- Row Level Security support and real-time content updates
- Type-safe frontend with reusable shadcn/ui and Radix UI components

## Tech Stack

Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Lucide React, React Hook Form

Backend and Storage: Supabase, Supabase Auth, Supabase Storage, PostgreSQL, Row Level Security

## Installation

```bash
git clone https://github.com/johnnnys3/Photographer-Portfolio-Website.git
cd Photographer-Portfolio-Website
npm install
```

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create the required `images` table in Supabase:

```sql
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  gallery TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  photographer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  width INTEGER,
  height INTEGER
);
```

## Usage

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linting
```

Open `http://localhost:3000` in your browser. Deployable on Vercel with production Supabase environment variables set.

## Project Structure

```text
.
├── app/            # Next.js routes
├── components/     # UI components
├── lib/            # Supabase client and helpers
└── README.md
```

## Contributing

Contributions are welcome. Fork the repository, create a feature branch, and open a pull request describing your changes.

## License

This project is available for educational and portfolio purposes.
