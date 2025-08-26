// This file provides a cleaner interface for SEO-related hooks
// Re-exporting SEO hooks from useData.ts for better organization

import {
  useGlobalSEOSettings,
  useGlobalSEOSetting,
  useUpdateGlobalSEOSetting,
  useAllPageSEOSettings,
  useCreatePageSEOSettings,
  useUpdatePageSEOSettings,
  useDeletePageSEOSettings,
  useSEOInsights,
  useProjects,
  useUpdateProjectSEO
} from './useData';

// Global SEO Settings
export const useSeoSettings = useGlobalSEOSettings;
export const useSeoSetting = useGlobalSEOSetting;
export const useUpdateSeoSettings = useUpdateGlobalSEOSetting;

// Page SEO Settings
export const usePageSeo = useAllPageSEOSettings;
export const useCreatePageSeo = useCreatePageSEOSettings;
export const useUpdatePageSeo = useUpdatePageSEOSettings;
export const useDeletePageSeo = useDeletePageSEOSettings;

// SEO Insights and Analytics
export const useSeoInsights = useSEOInsights;

// Projects (re-exported for convenience)
export { useProjects, useUpdateProjectSEO };

// Type exports for better TypeScript support
export type {
  SEOSettings,
  Project
} from '@/lib/supabase';