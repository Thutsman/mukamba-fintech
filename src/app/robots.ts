import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.mukambagateway.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/agent-dashboard/',
          '/_next/',
          '/auth/callback',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

