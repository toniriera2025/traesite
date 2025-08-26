import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { ContactPage } from '@/pages/ContactPage'

// Admin imports
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminContentPage } from '@/pages/admin/AdminContentPage'
import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage'
import { AdminHeroImagesPage } from '@/pages/admin/AdminHeroImagesPage'
import AdminPersonalPhotoPage from '@/pages/admin/AdminPersonalPhotoPage'
import { AdminTestimonialsPage } from '@/pages/admin/AdminTestimonialsPage'
import { AdminSEOPage } from '@/pages/admin/AdminSEOPage'
import AdminGalleryPage from '@/pages/admin/AdminGalleryPage'
import MultilingualProjectsPage from '@/components/admin/MultilingualProjectsPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="portfolio/:slug" element={<ProjectDetailPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="multilingual-projects" element={<MultilingualProjectsPage />} />
                <Route path="hero-images" element={<AdminHeroImagesPage />} />
                <Route path="personal-photo" element={<AdminPersonalPhotoPage />} />
                <Route path="testimonials" element={<AdminTestimonialsPage />} />
                <Route path="gallery" element={<AdminGalleryPage />} />
                <Route path="seo" element={<AdminSEOPage />} />
              </Route>
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App