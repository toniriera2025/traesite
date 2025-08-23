import { useState } from 'react'
import { useContentBlocks, useUpdateContentBlock } from '@/hooks/useData'
import { Save, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminContentPage() {
  const { data: contentBlocks = [], isLoading } = useContentBlocks()
  const updateContentMutation = useUpdateContentBlock()
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  
  const handleEdit = (block: any) => {
    setEditingBlock(block.section)
    setEditContent(block.content)
  }
  
  const handleSave = async (section: string) => {
    try {
      await updateContentMutation.mutateAsync({ section, content: editContent })
      setEditingBlock(null)
      setEditContent('')
    } catch (error) {
      // Error handling is done in the mutation
    }
  }
  
  const handleCancel = () => {
    setEditingBlock(null)
    setEditContent('')
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Blocks</h1>
        <p className="text-gray-600 mt-2">Manage the text content throughout your website</p>
      </div>
      
      <div className="grid gap-6">
        {contentBlocks.map((block) => (
          <div key={block.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {block.section.replace('_', ' ')}
              </h3>
              {editingBlock !== block.section && (
                <button
                  onClick={() => handleEdit(block)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            {editingBlock === block.section ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSave(block.section)}
                    disabled={updateContentMutation.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-700">
                <p className="whitespace-pre-wrap">{block.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}