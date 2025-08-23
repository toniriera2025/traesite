import { useAuth } from '@/lib/auth'
import { LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminHeader() {
  const { user, signOut } = useAuth()
  
  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Successfully logged out')
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out')
    }
  }
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-600">Manage your portfolio content and settings</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User size={16} />
            <span>{user?.email}</span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}