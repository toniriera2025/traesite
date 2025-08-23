# Toni Riera Portfolio Website

A modern, multilingual portfolio website built with React, TypeScript, and Supabase.

## 🌟 Features

- **Responsive Design**: Optimized for all devices
- **Multi-language Support**: English, Spanish, and Catalan
- **Dynamic Content Management**: Admin panel for easy content updates
- **Media Management**: Advanced image and video upload system
- **SEO Optimized**: Complete SEO configuration
- **Performance Focused**: Fast loading and optimized assets

## 🚀 Quick Start

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Local Development

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 📁 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: TanStack Query
- **Routing**: React Router
- **Internationalization**: i18next
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Deployment**: Vercel/Netlify ready

## 🔧 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run build:prod  # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🌍 Multi-language Support

The website automatically detects user language and provides:
- Dynamic URL routing (`/`, `/es/`, `/ca/`)
- Complete content translation
- SEO optimization for each language

## 🔐 Admin Panel

Access the admin panel at `/admin` to manage:
- Projects and portfolio items
- Hero section content
- Testimonials
- SEO settings
- Media uploads

## 📄 License

This project is proprietary software for Toni Riera's portfolio.

## 👥 Support

For deployment support, see the comprehensive [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).