export const siteConfig = {
  name: 'News SEO Assistant',
  description: 'Aggregate local news and generate SEO keywords automatically',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  regions: [
    { value: 'all', label: 'All Regions' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'shanghai', label: 'Shanghai' },
  ],
  features: {
    openai: process.env.OPENAI_API_KEY ? true : false,
  },
  cache: {
    rssDuration: parseInt(process.env.RSS_CACHE_DURATION || '60'), // minutes
  },
};
