import { useProjects, useHeroImages, useTestimonials } from '@/hooks/useData'
import { BarChart3, FileText, Image, MessageSquare, Users, TrendingUp } from 'lucide-react'

export function AdminDashboard() {
  const { data: projects = [] } = useProjects()
  const { data: heroImages = [] } = useHeroImages()
  const { data: testimonials = [] } = useTestimonials()
  
  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Featured Projects',
      value: projects.filter(p => p.is_featured).length,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'Hero Images',
      value: heroImages.length,
      icon: Image,
      color: 'bg-purple-500',
    },
    {
      name: 'Testimonials',
      value: testimonials.length,
      icon: MessageSquare,
      color: 'bg-yellow-500',
    },
  ]
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your portfolio content</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-lg object-cover"
                    src={project.main_image_url || '/placeholder.jpg'}
                    alt={project.title}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{project.title}</p>
                  <p className="text-sm text-gray-500">{project.category}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.is_featured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.is_featured ? 'Featured' : 'Standard'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {projects.length === 0 && (
            <p className="text-gray-500 text-center py-8">No projects found</p>
          )}
        </div>
      </div>
    </div>
  )
}