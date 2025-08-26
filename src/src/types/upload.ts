export interface UploadedImage {
  id: string
  url: string
  filename: string
  original_filename?: string
  file_size?: number
  width?: number
  height?: number
  mime_type?: string
  upload_service: string
  category?: string
  description?: string
  alt_text?: string
  is_active?: boolean
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export interface UploadServiceStatus {
  id: string
  service_name: string
  is_active: boolean
  last_check: string
  response_time?: number
  error_message?: string
  success_rate?: number
  total_uploads?: number
  successful_uploads?: number
  created_at: string
  updated_at: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  service: string
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'retrying'
}

export interface UploadMethod {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
}

export interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  onFileNameChange?: (name: string) => void
  onMetadataChange?: (metadata: Partial<UploadedImage>) => void
  label?: string
  folder?: string
  accept?: string
  required?: boolean
  placeholder?: string
  className?: string
  allowMultiple?: boolean
  category?: string
}