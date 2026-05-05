# Photographer Portfolio Website

A modern, responsive photographer portfolio website built with Next.js, TypeScript, Tailwind CSS, and Supabase. The platform includes a public gallery experience, image search and filtering, a secure admin panel, and image management tools for photographers.

## Overview

This project is designed for photographers who need a polished online portfolio with a lightweight content management workflow. Visitors can browse galleries, view images in a lightbox, search portfolio content, and contact the photographer. Admin users can upload, edit, organize, and manage image metadata through a protected dashboard.

## Features

### Public Portfolio

- Responsive gallery layout for desktop, tablet, and mobile
- Image category filtering and search
- Full-screen lightbox viewing
- Touch-friendly navigation
- SEO-friendly page structure
- Contact and about pages
- Optimized image loading for better performance

### Admin Panel

- Supabase authentication
- Protected admin dashboard
- Image upload and management
- Gallery organization
- Metadata editing
- Bulk image workflows
- Real-time content updates
- User-friendly error and loading states

### Technical Features

- Type-safe frontend with TypeScript
- Modular component architecture
- Reusable UI components with shadcn/ui and Radix UI
- Supabase database, authentication, and storage integration
- Row Level Security support
- Responsive design with Tailwind CSS
- Production-ready deployment flow

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- React Hook Form

### Backend and Storage

- Supabase
- Supabase Auth
- Supabase Storage
- PostgreSQL
- Row Level Security

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Supabase account

### Installation

```bash
git clone https://github.com/johnnnys3/Photographer-Portfolio-Website.git
cd Photographer-Portfolio-Website
npm install
```

### Environment Setup

Create a `.env.local` file and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Supabase Setup

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

Recommended production setup:

- Enable Supabase Auth
- Configure storage bucket permissions
- Add Row Level Security policies
- Set production environment variables in your hosting provider

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linting
```

## Deployment

This project is suitable for deployment on Vercel.

```bash
npm run build
```

Production environment variables required:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Portfolio Value

This project demonstrates frontend engineering, responsive UI design, authentication, image management, database integration, and production deployment using a modern React stack.

## License

This project is available for educational and portfolio purposes.

## Contact

**John Kessie**  
GitHub: [johnnnys3](https://github.com/johnnnys3)  
Email: johnkessie04@gmail.com
