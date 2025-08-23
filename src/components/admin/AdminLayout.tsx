import { useAuth } from '@/lib/auth'
import { Navigate, Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export function AdminLayout() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}