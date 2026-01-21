
  # Photographer Portfolio Website

A modern, responsive photographer portfolio website built with React, TypeScript, and Vite. Features a complete admin panel with Supabase backend integration, comprehensive UI components, and advanced image management capabilities.

## 🌟 Features

### **Public Portfolio**
- **Responsive Design**: Mobile-first approach with touch gestures and adaptive layouts
- **Image Gallery**: Masonry layout with category filtering and search functionality
- **Lightbox Viewing**: Full-screen image viewing with keyboard navigation and touch support
- **SEO Optimized**: Clean URLs, meta tags, and semantic HTML structure
- **Performance**: Lazy loading, optimized images, and efficient rendering
- **Search & Discovery**: Advanced search with filters and results page
- **Contact & About**: Professional contact form and about page integration

### **Admin Panel**
- **Secure Authentication**: Supabase Auth with JWT tokens and session management
- **Image Management**: Upload, edit, delete, and organize images with bulk operations
- **Gallery Organization**: Create and manage multiple galleries with drag & drop reordering
- **Advanced UI**: Modern interface with Radix UI components and smooth transitions
- **Real-time Updates**: Changes appear instantly on public site
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Form Validation**: Client-side validation with React Hook Form
- **Touch Interactions**: Mobile-friendly admin interface

### **Technical Features**
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Modular, reusable components with shadcn/ui
- **State Management**: React Context for auth and data management
- **Image Optimization**: Automatic optimization and responsive delivery
- **Security**: Row Level Security, input sanitization, and XSS protection
- **Error Boundaries**: Graceful error handling at component and page level

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3.1** - UI framework with hooks and concurrent features
- **TypeScript 5.9.3** - Type-safe JavaScript development
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework (via shadcn/ui)

### **UI Components**
- **Radix UI** - Headless UI primitives for accessibility
- **shadcn/ui** - Modern, accessible component library
- **Lucide React** - Beautiful, consistent icon system
- **React Hook Form** - Performant forms with easy validation

### **Backend & Storage**
- **Supabase** - Backend as a Service (database, auth, storage)
- **Row Level Security** - Fine-grained data access control
- **JWT Authentication** - Secure session management

### **Image & Media**
- **React Responsive Masonry** - Adaptive image layouts
- **Embla Carousel** - Touch-friendly carousel component
- **Custom Image Optimization** - Responsive image delivery

### **Development Tools**
- **ESLint & TypeScript** - Code quality and type checking
- **SWC Compiler** - Fast TypeScript compilation
- **Hot Module Replacement** - Instant development feedback

## 🚀 Development

### **Prerequisites**
- Node.js 16+ and npm
- Supabase account (free tier sufficient)

### **Installation**

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd "Photographer Portfolio Website"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file with your Supabase credentials
   # Copy from .env.example if available
   ```

4. **Supabase Setup**
   - Create project at [supabase.com](https://supabase.com)
   - Run SQL setup from documentation
   - Update `.env` with Project URL and Anon Key

5. **Start Development**
   ```bash
   npm run dev
   ```
   Development server runs on http://localhost:3000

6. **Create Admin Account**
   - Visit http://localhost:3000
   - Click hidden lock button (bottom-left corner)
   - Sign up for admin account
   - Verify email and sign in

### **Development Commands**
```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production (outputs to build/ directory)
npm run preview      # Preview production build locally
```

### **Environment Variables**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEV_MODE=true
```

### **Supabase Tables**
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

## 🎨 Usage

### **For Visitors**
- Browse galleries and images with smooth transitions
- View image metadata and descriptions in lightbox
- Search images by title, description, or tags
- Share images on social media
- Contact photographer through professional contact form
- Experience touch-friendly navigation on mobile devices

### **For Photographers (Admin)**
- Access admin panel via hidden lock button on homepage
- Upload and organize images with drag & drop interface
- Manage galleries and metadata with inline editing
- Bulk upload and operations for efficient workflow
- Track portfolio performance with real-time updates
- Mobile-optimized admin interface for on-the-go management

## 🔐 Security

- **Row Level Security**: Only authenticated photographers can modify their images
- **JWT Authentication**: Secure session management with Supabase Auth
- **File Validation**: Comprehensive type and size checking for uploads
- **Content Security Policy**: Configured CSP headers for XSS protection
- **Input Sanitization**: All user inputs are properly sanitized
- **HTTPS Only**: All connections encrypted in production
- **Error Boundaries**: Prevent sensitive information leakage through errors

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices with touch gestures
- **Adaptive Layout**: Seamlessly works on all screen sizes
- **Performance**: Lazy loading and optimized images for fast loading
- **Touch Interactions**: Swipe navigation, pinch-to-zoom, and mobile gestures
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
netlify deploy --prod --dir=build
```

### **Custom Hosting**
Build outputs to `build/` directory. Configure your hosting provider to:
- Serve static files from `build/`
- Handle client-side routing (SPA fallback)
- Set environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### **Environment Configuration**
Production environment requires:
- Supabase project URL and anonymous key
- Proper CORS configuration in Supabase
- SSL certificate for secure connections

## 🛠️ Troubleshooting

### **Common Issues**

**White Screen / Blank Page**
- Check `.env` file has correct Supabase credentials
- Verify Supabase project is active and accessible
- Check browser console for JavaScript errors
- Ensure all dependencies are installed

**Upload Issues**
- Verify file size limits (check Supabase storage settings)
- Check file type restrictions (JPG, PNG, WEBP supported)
- Verify internet connection and Supabase connectivity
- Check storage bucket permissions in Supabase

**Authentication Issues**
- Verify email is confirmed in Supabase Auth
- Check Supabase Auth settings and email templates
- Clear browser cache and localStorage
- Ensure proper redirect URLs configured in Supabase

**Build Issues**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript compilation errors
- Verify all environment variables are set
- Ensure Vite configuration is correct

### **Development Tips**
- Use React DevTools for component debugging
- Check Network tab for Supabase API calls
- Use browser's responsive design mode for mobile testing
- Enable hot reload for faster development iterations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following existing code patterns
4. Add TypeScript types for new functionality
5. Test thoroughly on different screen sizes
6. Ensure all components have proper error boundaries
7. Submit pull request with detailed description

### **Code Style**
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Maintain consistent naming conventions
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏‍♂️ Acknowledgments

- **React** - UI framework with excellent developer experience
- **Vite** - Lightning-fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Headless UI primitives for accessibility
- **Lucide React** - Stunning icon system
- **Supabase** - Powerful backend as a service platform
- **React Hook Form** - Performant forms with easy validation

---

**Ready to showcase your photography portfolio to the world! 📸**

For detailed setup instructions, technical documentation, or support, please refer to the project documentation or create an issue in the repository.
  