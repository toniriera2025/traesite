// SEO utility functions for scoring and validation

export interface SEOAnalysis {
  overall_score: number
  title_score: number
  description_score: number
  keywords_score: number
  images_score: number
  content_score: number
  technical_score: number
  suggestions: string[]
  issues: string[]
}

export interface SEOContent {
  title?: string
  description?: string
  keywords?: string[]
  content?: string
  images?: { src: string; alt?: string }[]
  url?: string
  h1?: string
  h2Count?: number
  h3Count?: number
  wordCount?: number
}

// SEO scoring functions
export function calculateTitleScore(title?: string): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 0
  
  if (!title) {
    issues.push('Missing title tag')
    return { score: 0, issues }
  }
  
  // Length check (30-60 characters is optimal)
  if (title.length < 30) {
    issues.push('Title is too short (recommended: 30-60 characters)')
    score += 20
  } else if (title.length > 60) {
    issues.push('Title is too long (recommended: 30-60 characters)')
    score += 40
  } else {
    score += 100
  }
  
  // Contains important keywords
  if (title.toLowerCase().includes('portfolio') || 
      title.toLowerCase().includes('creative') || 
      title.toLowerCase().includes('design')) {
    score = Math.min(score + 20, 100)
  }
  
  return { score: Math.min(score, 100), issues }
}

export function calculateDescriptionScore(description?: string): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 0
  
  if (!description) {
    issues.push('Missing meta description')
    return { score: 0, issues }
  }
  
  // Length check (120-160 characters is optimal)
  if (description.length < 120) {
    issues.push('Description is too short (recommended: 120-160 characters)')
    score += 30
  } else if (description.length > 160) {
    issues.push('Description is too long (recommended: 120-160 characters)')
    score += 50
  } else {
    score += 100
  }
  
  // Check for call-to-action
  const ctaWords = ['explore', 'discover', 'view', 'see', 'check', 'learn']
  if (ctaWords.some(word => description.toLowerCase().includes(word))) {
    score = Math.min(score + 20, 100)
  }
  
  return { score: Math.min(score, 100), issues }
}

export function calculateKeywordsScore(keywords?: string[]): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 0
  
  if (!keywords || keywords.length === 0) {
    issues.push('No keywords defined')
    return { score: 0, issues }
  }
  
  // Optimal keyword count (3-7 keywords)
  if (keywords.length < 3) {
    issues.push('Too few keywords (recommended: 3-7 keywords)')
    score += 40
  } else if (keywords.length > 7) {
    issues.push('Too many keywords (recommended: 3-7 keywords)')
    score += 60
  } else {
    score += 100
  }
  
  // Check for keyword variety
  const totalChars = keywords.join('').length
  if (totalChars < 20) {
    issues.push('Keywords are too short or generic')
    score = Math.max(score - 20, 0)
  }
  
  return { score: Math.min(score, 100), issues }
}

export function calculateImagesScore(images?: { src: string; alt?: string }[]): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 100
  
  if (!images || images.length === 0) {
    issues.push('No images found')
    return { score: 80, issues } // Not critical for all pages
  }
  
  let imagesWithoutAlt = 0
  images.forEach((image, index) => {
    if (!image.alt || image.alt.trim() === '') {
      imagesWithoutAlt++
    }
  })
  
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} image(s) missing alt text`)
    score -= (imagesWithoutAlt / images.length) * 40
  }
  
  return { score: Math.max(score, 0), issues }
}

export function calculateContentScore(content: SEOContent): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 0
  
  const wordCount = content.wordCount || 0
  
  // Word count check
  if (wordCount < 300) {
    issues.push('Content is too short (recommended: 300+ words)')
    score += 30
  } else if (wordCount < 500) {
    score += 70
  } else {
    score += 100
  }
  
  // H1 tag check
  if (!content.h1) {
    issues.push('Missing H1 tag')
    score = Math.max(score - 20, 0)
  }
  
  // Heading structure
  const h2Count = content.h2Count || 0
  const h3Count = content.h3Count || 0
  
  if (h2Count === 0 && wordCount > 500) {
    issues.push('No H2 headings found (recommended for content structure)')
    score = Math.max(score - 15, 0)
  }
  
  return { score: Math.min(score, 100), issues }
}

export function calculateTechnicalScore(content: SEOContent): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 100
  
  // URL structure
  if (content.url) {
    if (content.url.length > 100) {
      issues.push('URL is too long (recommended: under 100 characters)')
      score -= 20
    }
    
    if (content.url.includes('_') || content.url.includes('%20')) {
      issues.push('URL contains underscores or spaces (use hyphens instead)')
      score -= 15
    }
    
    if (!/^[a-z0-9-\/]*$/.test(content.url.replace(/https?:\/\/[^\/]+/, ''))) {
      issues.push('URL contains special characters (use lowercase and hyphens)')
      score -= 10
    }
  }
  
  return { score: Math.max(score, 0), issues }
}

// Main SEO analysis function
export function analyzeSEO(content: SEOContent): SEOAnalysis {
  const titleAnalysis = calculateTitleScore(content.title)
  const descriptionAnalysis = calculateDescriptionScore(content.description)
  const keywordsAnalysis = calculateKeywordsScore(content.keywords)
  const imagesAnalysis = calculateImagesScore(content.images)
  const contentAnalysis = calculateContentScore(content)
  const technicalAnalysis = calculateTechnicalScore(content)
  
  // Calculate weighted overall score
  const overall_score = Math.round(
    (titleAnalysis.score * 0.25) +           // 25% weight
    (descriptionAnalysis.score * 0.20) +    // 20% weight
    (keywordsAnalysis.score * 0.15) +       // 15% weight
    (imagesAnalysis.score * 0.15) +         // 15% weight
    (contentAnalysis.score * 0.15) +        // 15% weight
    (technicalAnalysis.score * 0.10)        // 10% weight
  )
  
  // Compile all issues and suggestions
  const issues = [
    ...titleAnalysis.issues,
    ...descriptionAnalysis.issues,
    ...keywordsAnalysis.issues,
    ...imagesAnalysis.issues,
    ...contentAnalysis.issues,
    ...technicalAnalysis.issues
  ]
  
  const suggestions = generateSuggestions({
    overall_score,
    title_score: titleAnalysis.score,
    description_score: descriptionAnalysis.score,
    keywords_score: keywordsAnalysis.score,
    images_score: imagesAnalysis.score,
    content_score: contentAnalysis.score,
    technical_score: technicalAnalysis.score
  })
  
  return {
    overall_score,
    title_score: titleAnalysis.score,
    description_score: descriptionAnalysis.score,
    keywords_score: keywordsAnalysis.score,
    images_score: imagesAnalysis.score,
    content_score: contentAnalysis.score,
    technical_score: technicalAnalysis.score,
    suggestions,
    issues
  }
}

// Generate actionable suggestions based on scores
function generateSuggestions(scores: {
  overall_score: number
  title_score: number
  description_score: number
  keywords_score: number
  images_score: number
  content_score: number
  technical_score: number
}): string[] {
  const suggestions: string[] = []
  
  if (scores.title_score < 70) {
    suggestions.push('Optimize your title tag: make it 30-60 characters and include relevant keywords')
  }
  
  if (scores.description_score < 70) {
    suggestions.push('Improve meta description: aim for 120-160 characters with a clear call-to-action')
  }
  
  if (scores.keywords_score < 70) {
    suggestions.push('Add 3-7 relevant keywords that accurately describe your content')
  }
  
  if (scores.images_score < 70) {
    suggestions.push('Add descriptive alt text to all images for better accessibility and SEO')
  }
  
  if (scores.content_score < 70) {
    suggestions.push('Expand your content: aim for 300+ words with proper heading structure')
  }
  
  if (scores.technical_score < 70) {
    suggestions.push('Optimize URL structure: use lowercase letters, hyphens, and keep under 100 characters')
  }
  
  if (scores.overall_score >= 80) {
    suggestions.push('Great job! Your SEO is well optimized. Consider monitoring performance and making minor tweaks')
  } else if (scores.overall_score >= 60) {
    suggestions.push('Good foundation! Focus on the lowest scoring areas to boost your overall SEO performance')
  } else {
    suggestions.push('Significant improvements needed. Start with title and description optimization for quick wins')
  }
  
  return suggestions
}

// Project-specific SEO analysis
export function analyzeProjectSEO(project: {
  title: string
  description?: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  main_image_url?: string
  main_image_alt?: string
  slug: string
  category?: string
}): SEOAnalysis {
  const content: SEOContent = {
    title: project.seo_title || project.title,
    description: project.seo_description || project.description,
    keywords: project.seo_keywords || [],
    images: project.main_image_url ? [{
      src: project.main_image_url,
      alt: project.main_image_alt
    }] : [],
    url: `/portfolio/${project.slug}`,
    h1: project.title,
    wordCount: project.description ? project.description.split(' ').length : 0
  }
  
  return analyzeSEO(content)
}

// Page-specific SEO analysis
export function analyzePageSEO(page: {
  page_path: string
  title?: string
  description?: string
  keywords?: string[]
  og_image_url?: string
}): SEOAnalysis {
  const content: SEOContent = {
    title: page.title,
    description: page.description,
    keywords: page.keywords || [],
    images: page.og_image_url ? [{
      src: page.og_image_url,
      alt: 'Open Graph image'
    }] : [],
    url: page.page_path,
    wordCount: 300 // Assume reasonable content length for pages
  }
  
  return analyzeSEO(content)
}

// SEO recommendation engine
export function getTopSEORecommendations(projects: any[]): {
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  projectId?: string
}[] {
  const recommendations = []
  
  // Find projects with low SEO scores
  const lowScoreProjects = projects.filter(p => (p.seo_score || 0) < 60)
  
  if (lowScoreProjects.length > 0) {
    recommendations.push({
      priority: 'high' as const,
      title: `${lowScoreProjects.length} projects need SEO optimization`,
      description: 'Several projects have SEO scores below 60, which may impact search visibility',
      action: 'Review and optimize project SEO settings',
      projectId: lowScoreProjects[0]?.id
    })
  }
  
  // Find projects without meta descriptions
  const noDescriptionProjects = projects.filter(p => !p.seo_description && !p.description)
  
  if (noDescriptionProjects.length > 0) {
    recommendations.push({
      priority: 'medium' as const,
      title: `${noDescriptionProjects.length} projects missing descriptions`,
      description: 'Meta descriptions help search engines understand your content',
      action: 'Add compelling descriptions to projects'
    })
  }
  
  // Find projects without keywords
  const noKeywordsProjects = projects.filter(p => !p.seo_keywords || p.seo_keywords.length === 0)
  
  if (noKeywordsProjects.length > 0) {
    recommendations.push({
      priority: 'medium' as const,
      title: `${noKeywordsProjects.length} projects missing keywords`,
      description: 'Keywords help categorize and improve discoverability',
      action: 'Add relevant keywords to projects'
    })
  }
  
  return recommendations.slice(0, 5) // Return top 5 recommendations
}

// Utility functions
export function getScoreColor(score: number): string {
  if (score >= 80) return 'green'
  if (score >= 60) return 'yellow'
  return 'red'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Needs Improvement'
  return 'Poor'
}

export function formatSEOScore(score: number): string {
  return `${Math.round(score)}/100`
}