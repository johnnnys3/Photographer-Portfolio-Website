
  # Photographer Portfolio Website

A modern, responsive photographer portfolio website with Supabase backend integration and complete admin panel.

## 🌟 Features

### **Public Portfolio**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Image Gallery**: Masonry layout with category filtering
- **Lightbox Viewing**: Full-screen image viewing with navigation
- **SEO Optimized**: Clean URLs and meta tags
- **Performance**: Lazy loading and optimized images

### **Admin Panel**
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Image Management**: Upload, edit, delete, and organize images
- **Gallery Organization**: Create and manage multiple galleries
- **Drag & Drop**: Visual reordering of images
- **Bulk Upload**: Upload up to 20 images at once
- **Metadata Editing**: Titles, descriptions, and tags
- **Real-time Updates**: Changes appear instantly on public site

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ and npm
- Supabase account (free tier sufficient)

### **Installation**

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd photographer-portfolio
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Supabase Setup**
   - Create project at [supabase.com](https://supabase.com)
   - Run SQL from setup documentation
   - Update `.env` with Project URL and Anon Key

5. **Start Development**
   ```bash
   npm run dev
   ```

6. **Create Admin Account**
   - Visit http://localhost:5173
   - Click hidden lock button (bottom-left)
   - Sign up for admin account
   - Verify email and sign in

## 📁 Project Structure

```
photographer-portfolio/
├── src/
│   ├── components/
│   │   ├── AdminDashboardNew.tsx    # Main admin interface
│   │   ├── AdminLogin.tsx          # Authentication
│   │   ├── HomePage.tsx            # Public homepage
│   │   ├── GalleryPage.tsx          # Image gallery
│   │   ├── Lightbox.tsx            # Full-screen viewer
│   │   └── Navigation.tsx          # Site navigation
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   ├── auth.ts                 # Auth functions
│   │   └── storage.ts              # Image management
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth state management
│   └── services/
│       └── dataService.ts          # Data layer (replaces mock data)
├── .env.example                    # Environment template
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🔧 Configuration

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
- Browse galleries and images
- View image metadata and descriptions
- Share images on social media
- Contact photographer through contact form

### **For Photographers**
- Access admin panel via hidden lock button
- Upload and organize images
- Manage galleries and metadata
- Edit image information inline
- Track portfolio performance

## 🔐 Security

- **Row Level Security**: Only owners can modify their images
- **JWT Authentication**: Secure session management
- **File Validation**: Type and size checking
- **HTTPS Only**: All connections encrypted
- **Input Sanitization**: XSS protection

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Touch Gestures**: Swipe navigation for galleries
- **Adaptive Layout**: Works on all screen sizes
- **Performance**: Lazy loading and optimized images

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### **Custom Domain**
Update environment variables in your hosting provider:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🛠️ Troubleshooting

### **Common Issues**

**White Screen**
- Check `.env` file has correct values
- Verify Supabase project is active
- Check browser console for errors

**Upload Issues**
- Verify file size (< 20MB)
- Check file type (JPG, PNG, WEBP)
- Check internet connection

**Authentication Issues**
- Verify email is confirmed
- Check Supabase Auth settings
- Clear browser cache

### **Development Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check for issues
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏‍♂️ Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide React](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)

---

**Ready to showcase your photography portfolio to the world! 📸**

For detailed setup instructions, see the setup documentation in the project.
  