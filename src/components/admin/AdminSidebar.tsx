import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  MessageSquare, 
  Image, 
  Settings,
  Users,
  ImageIcon,
  Globe,
  User
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Content Blocks', href: '/admin/content', icon: FileText },
  { name: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { name: 'Multilingual Projects', href: '/admin/multilingual-projects', icon: Globe },
  { name: 'Hero Images', href: '/admin/hero-images', icon: Image },
  { name: 'Personal Photo', href: '/admin/personal-photo', icon: User },
  { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { name: 'Image Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()
  
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }
  
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
          <Link to="/admin/dashboard" className="text-white text-xl font-bold">
            TONI RIERA CMS
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2"
          >
            View Website →
          </Link>
        </div>
      </div>
    </div>
  )
}