import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // This should be your production domain.
  // For now, we'll build a relative sitemap.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://daily-word-master.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
