import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cupmecsdrgcvibxpggwg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1cG1lY3NkcmdjdmlieHBnZ3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzk2MDMsImV4cCI6MjA3MTIxNTYwM30.fSnWsigsBExDnXv9RXdv-M3NxzeEPpEZGMbHJ7OXwfk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Language types
export type Language = 'en' | 'es' | 'ca';

export interface LanguageConfig {
  id: string
  language_code: Language
  language_name: string
  native_name: string
  flag_emoji?: string
  is_enabled: boolean
  is_default: boolean
  sort_order: number
  date_format: string
  time_format: string
  currency_code: string
  timezone: string
  rtl: boolean
  locale: string
  created_at: string
  updated_at: string
}

// Multilingual content interface
export interface MultilingualContent {
  en?: string
  es?: string
  ca?: string
}

// Database types with multilingual support
export interface Project {
  id: string
  title: string // Legacy field, keeping for compatibility
  slug: string
  description?: string // Legacy field
  main_image_url?: string
  main_image_alt?: string
  
  // YouTube video integration
  youtube_url?: string
  youtube_video_id?: string
  youtube_thumbnail_url?: string
  
  category?: string
  client?: string
  created_at: string
  updated_at: string
  is_featured: boolean
  sort_order: number
  status: 'draft' | 'published' | 'archived'
  
  // Multilingual content fields
  title_en?: string
  title_es?: string
  title_ca?: string
  description_en?: string
  description_es?: string
  description_ca?: string
  
  // Multilingual SEO fields
  seo_title?: string // Legacy field
  seo_description?: string // Legacy field
  seo_keywords?: string[] // Legacy field
  seo_title_en?: string
  seo_title_es?: string
  seo_title_ca?: string
  seo_description_en?: string
  seo_description_es?: string
  seo_description_ca?: string
  seo_keywords_en?: any[] // JSONB
  seo_keywords_es?: any[] // JSONB
  seo_keywords_ca?: any[] // JSONB
  
  // Multilingual Meta fields
  meta_title?: string // Legacy field
  meta_description?: string // Legacy field
  meta_title_en?: string
  meta_title_es?: string
  meta_title_ca?: string
  meta_description_en?: string
  meta_description_es?: string
  meta_description_ca?: string
  
  // Multilingual Open Graph fields
  og_image_url?: string
  og_title?: string // Legacy field
  og_description?: string // Legacy field
  og_title_en?: string
  og_title_es?: string
  og_title_ca?: string
  og_description_en?: string
  og_description_es?: string
  og_description_ca?: string
  
  // Other legacy fields
  twitter_card?: string
  canonical_url?: string
  focus_keyword?: string
  schema_type?: string
  seo_score?: number
  
  // Language management
  default_language: Language
  translation_status: Record<Language, 'complete' | 'pending' | 'draft'>
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  alt_text?: string
  caption?: string
  sort_order: number
  created_at: string
}

export interface HeroImage {
  id: string
  image_url: string
  alt_text?: string
  caption?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContentBlock {
  id: string
  section: string // Legacy field
  content: string // Legacy field
  content_type: 'text' | 'html' | 'markdown'
  created_at: string
  updated_at: string
  
  // Multilingual content fields
  content_en?: string
  content_es?: string
  content_ca?: string
  section_title_en?: string
  section_title_es?: string
  section_title_ca?: string
  
  // Language management
  default_language: Language
  translation_status: Record<Language, 'complete' | 'pending' | 'draft'>
}

export interface Testimonial {
  id: string
  client_name: string
  client_role?: string // Legacy field
  client_company?: string // Legacy field
  client_image_url?: string
  testimonial_text: string // Legacy field
  rating?: number
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Multilingual testimonial fields
  testimonial_text_en?: string
  testimonial_text_es?: string
  testimonial_text_ca?: string
  client_role_en?: string
  client_role_es?: string
  client_role_ca?: string
  client_company_en?: string
  client_company_es?: string
  client_company_ca?: string
  
  // Language management
  default_language: Language
  translation_status: Record<Language, 'complete' | 'pending' | 'draft'>
}

export interface SEOSettings {
  id: string
  page_path: string
  title?: string // Legacy field
  description?: string // Legacy field
  keywords?: string[] // Legacy field
  og_image_url?: string
  og_title?: string // Legacy field
  og_description?: string // Legacy field
  twitter_card?: string
  canonical_url?: string // Legacy field
  created_at: string
  updated_at: string
  
  // Language support
  language: Language
  
  // Multilingual SEO fields
  title_en?: string
  title_es?: string
  title_ca?: string
  description_en?: string
  description_es?: string
  description_ca?: string
  keywords_en?: any[] // JSONB
  keywords_es?: any[] // JSONB
  keywords_ca?: any[] // JSONB
  og_title_en?: string
  og_title_es?: string
  og_title_ca?: string
  og_description_en?: string
  og_description_es?: string
  og_description_ca?: string
  canonical_url_en?: string
  canonical_url_es?: string
  canonical_url_ca?: string
  
  // Multilingual features
  hreflang_links?: Record<string, string>
  translation_status: Record<Language, 'complete' | 'pending' | 'draft'>
}

export interface GlobalSEOSettings {
  id: string
  setting_key: string
  setting_value?: string // Legacy field
  setting_type: string
  description?: string
  created_at: string
  updated_at: string
  
  // Language support
  language: Language
  
  // Multilingual setting values
  setting_value_en?: string
  setting_value_es?: string
  setting_value_ca?: string
  
  // Language management
  translation_status: Record<Language, 'complete' | 'pending' | 'draft'>
}

export interface SEOAudit {
  id: string
  page_type: string
  page_id: string
  audit_date: string
  overall_score: number
  title_score: number
  description_score: number
  keywords_score: number
  images_score: number
  content_score: number
  technical_score: number
  suggestions: any
  issues: any
  created_at: string
  updated_at: string
}

// Helper type for getting language-specific content
export type LocalizedField<T> = {
  [K in keyof T]: T[K] extends string ? MultilingualContent : T[K]
}

// Utility functions for multilingual content
export const getLocalizedContent = (content: MultilingualContent, language: Language, fallback = 'en'): string => {
  return content[language] || content[fallback as Language] || content.en || ''
}

export const setLocalizedContent = (content: MultilingualContent, language: Language, value: string): MultilingualContent => {
  return {
    ...content,
    [language]: value
  }
}