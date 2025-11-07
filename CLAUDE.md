# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

News SEO Assistant - A Next.js 16 application that aggregates news from RSS sources, extracts keywords using TF-IDF algorithm, and generates SEO-optimized content suggestions.

**Working Directory**: `news-seo-assistant/`

## Development Commands

```bash
# Navigate to project
cd news-seo-assistant

# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: @tanstack/react-query
- **NLP**: natural.js (TF-IDF algorithm)
- **RSS Parsing**: rss-parser
- **Date Utilities**: date-fns
- **UI Components**: lucide-react, recharts
- **Optional**: OpenAI API (for AI-enhanced SEO)

## Architecture

### Directory Structure

```
news-seo-assistant/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── news/            # RSS news aggregation
│   │   ├── keywords/        # TF-IDF keyword extraction
│   │   └── seo/             # SEO generation (+ /ai for OpenAI)
│   ├── page.tsx             # News feed page
│   ├── keywords/page.tsx    # Keywords analysis page
│   └── seo/page.tsx         # SEO suggestions page
├── lib/                      # Core business logic
│   ├── rss/                 # RSS feed parsing & aggregation
│   ├── nlp/                 # NLP processing (TF-IDF)
│   ├── seo/                 # SEO generation logic
│   ├── ai/                  # OpenAI integration
│   │   ├── services/        # AI service implementations
│   │   ├── prompts/         # Prompt templates
│   │   └── utils/           # AI utilities
│   ├── i18n/                # Internationalization (EN/ZH)
│   └── cache/               # Caching utilities
├── components/               # React components
│   ├── ui/                  # Reusable UI components
│   ├── news/                # News-specific components
│   ├── keywords/            # Keyword-specific components
│   └── seo/                 # SEO-specific components
├── store/                    # Zustand stores
│   └── useNewsStore.ts      # News state management
├── types/                    # TypeScript type definitions
│   └── index.ts             # Core types (NewsItem, Keyword, SEOSuggestion)
└── config/                   # Configuration files
    └── rss-sources.json     # RSS feed sources by region
```

### Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)
- Import example: `import { NewsItem } from '@/types'`

### Key Data Flow

1. **News Aggregation**: API (`/api/news`) → RSS Parser → Parallel fetch → Sort by date
2. **Keyword Extraction**: API (`/api/keywords`) → TF-IDF algorithm → Top 10 keywords
3. **SEO Generation**: API (`/api/seo`) → Keywords + Summary → SEO titles + meta descriptions
4. **AI Enhancement** (optional): API (`/api/seo/ai`) → OpenAI → AI-generated SEO content

## Core Types (types/index.ts)

```typescript
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  region: string;        // 'singapore' | 'shanghai'
  source: string;
  publishDate: string;
  link: string;
}

interface Keyword {
  word: string;
  frequency: number;
  tfidf: number;
  trend?: 'up' | 'down' | 'stable';
  changeRate?: number;
}

interface SEOSuggestion {
  titles: string[];
  metaDescriptions: string[];
  keywords: Keyword[];
}
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="News SEO Assistant"

# RSS caching (minutes)
RSS_CACHE_DURATION=60

# Optional - OpenAI integration
OPENAI_API_KEY=sk-xxx
```

## Important Implementation Details

### RSS Sources
- Configured in `config/rss-sources.json`
- Supports multiple regions: `singapore`, `shanghai`
- Parallel fetching with `Promise.allSettled` (10s timeout per source)
- Sources include: Channel NewsAsia, BBC, TechCrunch, 新浪, 网易, 搜狐, 人民网, 澎湃

### TF-IDF Algorithm
- Implementation in `lib/nlp/`
- Formula: TF-IDF = TF × log(N / DF)
- Stopword filtering for English and Chinese
- Returns top 10 keywords by default

### SEO Generation
- Title length: 50-60 characters
- Meta description: 150-160 characters
- Naturally incorporates top 3 keywords
- Optional AI enhancement via OpenAI API

### State Management
- Zustand store in `store/useNewsStore.ts`
- React Query for API data fetching and caching
- No Redux or Context API used

### Internationalization
- Two languages supported: English (en) and Chinese (zh)
- Locales in `lib/i18n/locales/`
- Language switcher component available

## Code Style & Patterns

- **TypeScript strict mode** enabled
- **Functional components** with React hooks
- **API Routes** follow RESTful patterns (GET /api/news, POST /api/keywords)
- **Error handling**: Try-catch blocks with proper HTTP status codes
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Use `@/*` path alias consistently

## Testing & Quality

- ESLint configured with Next.js rules
- Prettier for code formatting
- No test framework currently configured
- Manual testing through UI at localhost:3000

## Development Workflow

1. **Adding RSS Sources**: Edit `config/rss-sources.json`
2. **Adding New Pages**: Create in `app/` directory (App Router)
3. **Adding API Endpoints**: Create route.ts in `app/api/[endpoint]/`
4. **Adding Business Logic**: Add to appropriate `lib/` subdirectory
5. **Adding Components**: Place in `components/` with appropriate subfolder
6. **Adding Types**: Update `types/index.ts`

## Known Limitations

- RSS cache currently in-memory (not persistent)
- OpenAI integration is optional and requires API key
- No user authentication system
- No database integration (stateless API)
- Browser-based keyword visualization only

## Future Enhancements (from README)

- Word cloud visualization improvements
- JSON/CSV export functionality
- Enhanced OpenAI API integration
- Social media sharing features
