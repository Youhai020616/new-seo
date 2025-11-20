# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**News SEO Assistant** - A Next.js 16 application that aggregates news from RSS sources across multiple regions (Singapore, Shanghai, Hong Kong), extracts keywords using TF-IDF algorithm, and generates SEO-optimized content with AI-enhanced features powered by DeepSeek.

**Working Directory**: `/home/user/new-seo`

**Live Demo**: https://news-seo-assistant.vercel.app/

## Development Commands

```bash
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

### Core Framework
- **Next.js**: 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x (strict mode)
- **Tailwind CSS**: 4.0

### AI & NLP
- **DeepSeek AI**: Primary AI provider for trend analysis, sentiment, and SEO
- **OpenAI SDK**: 6.8.1 (used for DeepSeek API calls)
- **natural.js**: 8.1.0 (TF-IDF algorithm, NLP processing)

### State Management & Data
- **Zustand**: 5.0.8 (lightweight state management)
- **React Query**: 5.90.7 (@tanstack/react-query)
- **date-fns**: 4.1.0
- **rss-parser**: 3.13.0

### UI Components & Visualization
- **Radix UI**: @radix-ui/react-dropdown-menu, @radix-ui/react-tabs
- **Lucide React**: 0.552.0 (icons)
- **Recharts**: 3.3.0 (data visualization)
- **d3-cloud**: 1.2.7 (word cloud)
- **clsx**: 2.1.1 + **tailwind-merge**: 3.3.1 (utility classes)

## Architecture

### Directory Structure

```
/home/user/new-seo/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── news/                 # RSS news aggregation
│   │   │   └── route.ts          # GET /api/news?region=all
│   │   ├── keywords/             # Keyword extraction
│   │   │   ├── route.ts          # POST /api/keywords
│   │   │   └── trending/         # Trending keywords
│   │   │       └── route.ts      # GET /api/keywords/trending
│   │   ├── seo/                  # SEO generation
│   │   │   ├── route.ts          # POST /api/seo
│   │   │   └── ai/               # AI-enhanced SEO
│   │   │       └── route.ts      # POST /api/seo/ai
│   │   └── ai/                   # AI features ⭐ NEW
│   │       ├── trend/route.ts    # POST /api/ai/trend
│   │       ├── sentiment/route.ts # POST /api/ai/sentiment
│   │       ├── summary/route.ts   # POST /api/ai/summary
│   │       ├── keywords/cluster/route.ts # POST /api/ai/keywords/cluster
│   │       ├── batch/route.ts     # POST /api/ai/batch
│   │       └── stats/route.ts     # GET /api/ai/stats
│   ├── page.tsx                  # Home page (news feed)
│   ├── keywords/page.tsx         # Keywords analysis page
│   ├── seo/page.tsx              # SEO suggestions page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── lib/                          # Core business logic
│   ├── rss/                      # RSS feed handling
│   │   └── parser.ts             # RSS parsing, parallel fetching
│   ├── nlp/                      # NLP processing
│   │   ├── keyword-extractor.ts  # TF-IDF implementation
│   │   ├── trending-analyzer.ts  # Trending keywords algorithm
│   │   ├── stopwords.ts          # EN/ZH stopwords
│   │   └── language-detector.ts  # Language detection
│   ├── ai/                       # AI integration ⭐
│   │   ├── deepseek-client.ts    # DeepSeek API client
│   │   ├── services/             # AI service layer
│   │   │   ├── trend-service.ts
│   │   │   ├── sentiment-service.ts
│   │   │   ├── summary-service.ts
│   │   │   ├── keyword-cluster-service.ts
│   │   │   ├── title-service.ts
│   │   │   └── meta-service.ts
│   │   ├── prompts/              # Prompt templates
│   │   │   ├── trend-analysis.ts
│   │   │   ├── sentiment.ts
│   │   │   ├── summary.ts
│   │   │   ├── keyword-cluster.ts
│   │   │   ├── seo-title.ts
│   │   │   └── meta-description.ts
│   │   ├── utils/                # AI utilities
│   │   │   ├── retry-handler.ts  # Retry logic with backoff
│   │   │   ├── cache-manager.ts  # Result caching
│   │   │   ├── cost-tracker.ts   # Cost tracking
│   │   │   └── token-counter.ts  # Token estimation
│   │   └── middleware/           # AI middleware
│   │       ├── error-handler.ts
│   │       └── fallback.ts
│   ├── seo/                      # SEO generation
│   │   ├── title-generator.ts
│   │   └── meta-generator.ts
│   ├── export/                   # Data export
│   │   └── exporters.ts          # JSON/CSV export
│   ├── i18n/                     # Internationalization
│   │   ├── context.tsx
│   │   └── locales/
│   │       ├── en.ts
│   │       └── zh.ts
│   ├── regions/                  # Region utilities
│   │   └── utils.ts
│   ├── contexts/                 # React contexts
│   │   └── SidebarContext.tsx
│   └── utils.ts                  # Utility functions
│
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── glass-card.tsx
│   │   └── seo-best-practices.tsx
│   ├── keywords/                 # Keyword components
│   │   └── TrendingKeywordsList.tsx
│   ├── seo/                      # SEO components
│   │   └── AITitleCard.tsx
│   ├── ai/                       # AI components ⭐
│   │   ├── TrendChart.tsx
│   │   ├── SentimentBadge.tsx
│   │   ├── KeywordClusterView.tsx
│   │   ├── AISummaryCard.tsx
│   │   ├── AIUsageDashboard.tsx
│   │   ├── useAIFeatures.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── Navigation.tsx
│   ├── LanguageSwitcher.tsx
│   ├── KeywordCloud.tsx          # Word cloud visualization
│   ├── KeywordChart.tsx
│   ├── Breadcrumb.tsx
│   └── LayoutContent.tsx
│
├── store/                        # Zustand stores
│   └── useNewsStore.ts           # News state management
│
├── types/                        # TypeScript definitions
│   └── index.ts                  # Core types
│
├── config/                       # Configuration
│   ├── rss-sources.json          # RSS feed sources
│   ├── regions-metadata.json     # Region metadata
│   └── site.ts                   # Site configuration
│
├── scripts/                      # Utility scripts
│   ├── test-rss-sources.js
│   └── pre-deploy-check.sh
│
├── docs/                         # Documentation
│   ├── AI集成方案.md
│   ├── AI集成实施清单.md
│   └── 竞品分析报告.md
│
├── claudedocs/                   # Claude Code documentation
│   ├── Trending-Keywords-Implementation.md
│   ├── Timeout-Optimization-Fix.md
│   ├── Region-Expansion-Phase1-HongKong.md
│   ├── Phase3-Implementation-Summary.md
│   ├── Frontend-Integration-Complete.md
│   ├── Glass-Morphism-UI-Upgrade.md
│   └── AI-Summary-Display-Fix.md
│
├── public/                       # Static assets
├── .serena/                      # Serena config
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── vercel.json
└── CLAUDE.md                     # This file
```

### Path Aliases

Configured in `tsconfig.json`:
- `@/*` maps to project root
- Import example: `import { NewsItem } from '@/types'`

### Key Data Flows

1. **News Aggregation**:
   ```
   API /api/news → RSS Parser → Promise.allSettled (parallel fetch)
   → Sort by date → Cache (60 min) → Response
   ```

2. **Keyword Extraction**:
   ```
   API /api/keywords → TF-IDF Algorithm → Stopword Filter
   → Top 10 Keywords → Response
   ```

3. **Trending Keywords**:
   ```
   API /api/keywords/trending → Fetch 24h news → TF-IDF + Time Decay
   → Diversity Scoring → Export JSON/CSV
   ```

4. **AI Trend Analysis**:
   ```
   API /api/ai/trend → DeepSeek Client → Prompt Template
   → Retry Handler → Cache → Trending Topics + Insights
   ```

5. **SEO Generation**:
   ```
   API /api/seo → Keywords + Summary → Rule Engine → Titles + Meta
   API /api/seo/ai → DeepSeek AI → Enhanced SEO Content
   ```

## Core Types (types/index.ts)

```typescript
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  region: string;        // 'singapore' | 'shanghai' | 'hongkong'
  source: string;
  publishDate: string;   // ISO 8601
  link: string;
}

interface Keyword {
  word: string;
  frequency: number;
  tfidf: number;
  trend?: 'up' | 'down' | 'stable';
  changeRate?: number;
}

interface TrendingKeyword extends Keyword {
  trendingScore: number;      // 0-10
  rank: number;
  newsCount: number;
  regions: string[];
  sources: string[];
  firstSeen: string;          // ISO 8601
  lastSeen: string;
  avgAge: number;             // hours
  relatedNews: Array<{
    id: string;
    title: string;
    link: string;
    source: string;
    region: string;
    publishDate: string;
  }>;
}

interface SEOSuggestion {
  titles: string[];
  metaDescriptions: string[];
  keywords: Keyword[];
}

interface RSSSource {
  name: string;
  url: string;
  region: string;
}

interface RegionMetadata {
  id: string;
  nameEn: string;
  nameZh: string;
  timezone: string;
  languages: string[];
  flag: string;
  enabled: boolean;
  order: number;
}

type Region = 'singapore' | 'shanghai' | 'hongkong' | 'all';
type Language = 'en' | 'zh';
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# ===== Application Configuration =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="News SEO Assistant"

# ===== DeepSeek AI (Primary AI Provider) =====
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# ===== RSS Configuration =====
RSS_CACHE_DURATION=60  # Minutes

# ===== Optional: OpenAI (Fallback) =====
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

**Important Notes**:
- DeepSeek API key is **required** for AI features
- Get your DeepSeek API key at: https://platform.deepseek.com/
- OpenAI API key is optional (system falls back to rule-based engine)

## Important Implementation Details

### RSS Sources (config/rss-sources.json)

- **Regions**: Singapore, Shanghai, Hong Kong
- **Total Sources**: 11 RSS feeds
- **Singapore**: Channel NewsAsia, BBC News, TechCrunch
- **Shanghai**: 新浪新闻, 网易新闻, 搜狐新闻, 人民网, 澎湃新闻
- **Hong Kong**: South China Morning Post, Hong Kong Free Press, The Standard HK
- **Fetching Strategy**: `Promise.allSettled` with 10s timeout per source
- **Caching**: 60-minute in-memory cache

### TF-IDF Algorithm (lib/nlp/keyword-extractor.ts)

```
TF-IDF = TF(t, d) × IDF(t, D)

TF(t, d) = count(t in d) / total_words(d)
IDF(t, D) = log(N / DF(t))

Where:
- t: term
- d: document
- D: document collection
- N: total documents
- DF(t): documents containing term t
```

**Features**:
- Stopword filtering for English and Chinese
- Returns top 10 keywords by default
- Supports custom keyword limits

### Trending Keywords Algorithm (lib/nlp/trending-analyzer.ts)

```
TrendingScore = BaseScore × TimeDecay × DiversityBonus × PopularityFactor

Where:
- BaseScore: Normalized TF-IDF (0-1)
- TimeDecay: e^(-0.01 × ageInHours)
- DiversityBonus: 1 + (uniqueRegions / totalRegions) × 0.5
- PopularityFactor: log(1 + newsCount)

Final score range: 0-10
```

**Metadata Tracked**:
- Trending score and rank
- News count and related articles (top 5)
- Geographic distribution (regions, sources)
- Temporal data (first/last seen, average age)

### AI Features (DeepSeek Integration)

**DeepSeek Client** (`lib/ai/deepseek-client.ts`):
- Base URL: https://api.deepseek.com
- Model: deepseek-chat
- Pricing: ¥0.001/1K input tokens, ¥0.002/1K output tokens

**AI Services**:
1. **Trend Analysis** (`lib/ai/services/trend-service.ts`):
   - Identifies trending topics, emerging topics
   - Provides predictions (rising/stable/declining)
   - Calculates impact scores and confidence levels

2. **Sentiment Analysis** (`lib/ai/services/sentiment-service.ts`):
   - Classifies: Positive/Neutral/Negative
   - Provides confidence scores
   - Supports batch processing

3. **Summary Generation** (`lib/ai/services/summary-service.ts`):
   - Generates concise summaries
   - Configurable length
   - Bilingual support (EN/ZH)

4. **Keyword Clustering** (`lib/ai/services/keyword-cluster-service.ts`):
   - K-means clustering
   - Topic identification
   - Similarity matrix

**AI Utilities**:
- **Retry Handler**: Exponential backoff (2s, 4s, 8s, 16s)
- **Cache Manager**: 1-hour TTL for identical requests
- **Cost Tracker**: Tracks tokens and estimated costs
- **Token Counter**: Estimates token usage before API calls

**Performance Optimizations**:
- Timeout controls: 9s internal + 6s for AI calls
- Fallback to rule-based engine on AI failures
- Result caching to reduce API costs
- Batch processing support

### SEO Generation

**Rule-based Engine**:
- Title length: 50-60 characters
- Meta description: 150-160 characters
- Naturally incorporates top 3 keywords
- Generates 3 variations per request

**AI-enhanced Mode**:
- Uses DeepSeek for natural language generation
- Better keyword integration
- Quality scoring (0-100)
- Multilingual support

### State Management

**Zustand Store** (`store/useNewsStore.ts`):
- Manages news items, selected region, loading states
- Simple, performant state management
- No Redux or Context API complexity

**React Query**:
- Server state management
- Automatic caching and refetching
- Background updates
- Optimistic updates

### Internationalization (i18n)

**Languages**: English (en), Chinese (zh)
**Locales**: `lib/i18n/locales/en.ts`, `lib/i18n/locales/zh.ts`
**Context**: `lib/i18n/context.tsx`
**Switcher**: `components/LanguageSwitcher.tsx`

### Data Export

**Formats**: JSON, CSV
**Exporter**: `lib/export/exporters.ts`
**CSV Features**:
- BOM for Excel Chinese character display
- Proper escaping for commas and quotes
- Header row with column names

## Code Style & Patterns

### TypeScript
- **Strict mode enabled** in `tsconfig.json`
- All components and functions properly typed
- No `any` types (use `unknown` when necessary)
- Interface over Type for object definitions

### React Patterns
- **Functional components** with hooks
- **Custom hooks** for reusable logic (e.g., `useAIFeatures.ts`)
- **Compound components** for complex UI (Tabs, Dropdowns)
- **Error boundaries** for graceful error handling

### API Routes
- RESTful patterns:
  - GET for fetching data
  - POST for mutations/complex queries
- Consistent error responses:
  ```typescript
  { success: false, error: "Error message" }
  ```
- Proper HTTP status codes (200, 400, 404, 500)
- Try-catch blocks with detailed error logging

### Naming Conventions
- **camelCase**: variables, functions
- **PascalCase**: components, types/interfaces
- **kebab-case**: file names (except components)
- **UPPER_SNAKE_CASE**: constants

### Imports
- Always use `@/*` path alias
- Group imports: React → Third-party → Local
- Sort imports alphabetically within groups

### Comments
- Use JSDoc for functions and complex logic
- Explain "why" not "what"
- Chinese comments allowed for Chinese-specific logic

## Testing & Quality

### Linting
- ESLint with Next.js config
- Configured in `eslint.config.mjs`
- Run: `npm run lint`

### Code Formatting
- Prettier configured
- Version: 3.6.2

### Type Checking
- Run: `npx tsc --noEmit`
- CI/CD should include type checking

### Testing
- **No test framework currently configured**
- Manual testing via UI at localhost:3000
- Future: Consider Vitest + React Testing Library

## Development Workflow

### Adding RSS Sources
1. Edit `config/rss-sources.json`
2. Add source object with `name`, `url`, `region`
3. Test with `node scripts/test-rss-sources.js`

### Adding New Pages
1. Create `page.tsx` in `app/[route]/`
2. Use App Router conventions
3. Add navigation link in `components/Navigation.tsx`
4. Update i18n locales if needed

### Adding API Endpoints
1. Create `route.ts` in `app/api/[endpoint]/`
2. Export async functions: `GET`, `POST`, etc.
3. Use `NextResponse` for responses
4. Add proper error handling

### Adding AI Features
1. Create prompt template in `lib/ai/prompts/`
2. Create service in `lib/ai/services/`
3. Use DeepSeek client with retry + cache
4. Add API route in `app/api/ai/[feature]/`
5. Create UI component in `components/ai/`

### Adding Components
1. Place in appropriate subfolder:
   - `components/ui/` for reusable UI
   - `components/keywords/` for keyword-specific
   - `components/seo/` for SEO-specific
   - `components/ai/` for AI features
2. Use TypeScript with proper prop types
3. Follow Radix UI patterns for accessible components

### Adding Types
1. Add to `types/index.ts`
2. Export all types/interfaces
3. Use consistent naming

### Modifying Regions
1. Update `config/regions-metadata.json`
2. Add RSS sources in `config/rss-sources.json`
3. Update region type in `types/index.ts`
4. Add translations in `lib/i18n/locales/`

## Performance Best Practices

### Server-Side
- Use `Promise.allSettled` for parallel operations
- Implement timeouts for external API calls
- Cache frequently accessed data (RSS feeds, AI results)
- Use streaming for large responses

### Client-Side
- Lazy load heavy components (word cloud, charts)
- Use React Query for automatic caching
- Debounce user inputs
- Optimize images with Next.js `<Image>`

### AI API Calls
- Always set timeouts (6s recommended)
- Implement retry with exponential backoff
- Cache results for identical requests
- Use batch APIs when processing multiple items

## Known Limitations

- **RSS Cache**: In-memory only, resets on deployment
- **Authentication**: No user system (planned for v3.0)
- **Database**: Stateless API, no persistent storage
- **AI Costs**: DeepSeek API usage incurs costs (track with `/api/ai/stats`)
- **Rate Limiting**: No built-in rate limiting (rely on Vercel limits)
- **RSS Reliability**: Some sources may be unreliable or blocked
- **Browser Support**: Modern browsers only (ES2020+)

## Deployment

### Vercel (Recommended)
- Auto-deploys from GitHub
- Environment variables configured in Vercel dashboard
- Edge Functions supported
- Serverless Functions timeout: 10s (Hobby), 60s (Pro)

**vercel.json Configuration**:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60" }
      ]
    }
  ]
}
```

### Environment Setup
1. Add all environment variables in Vercel dashboard
2. Set `DEEPSEEK_API_KEY` (required)
3. Set `RSS_CACHE_DURATION` (default: 60)
4. Deploy and test

### Pre-Deployment Checklist
Run: `bash scripts/pre-deploy-check.sh`
- Type check passes
- Linting passes
- Build succeeds
- Environment variables set

## Troubleshooting

### AI Timeout Errors
- DeepSeek API calls have 6s timeout
- If timeout occurs, system falls back to rule-based engine
- Check AI stats at `/api/ai/stats` for performance metrics
- Consider reducing batch sizes

### RSS Feed Failures
- Individual feed failures don't block entire aggregation
- Check `Promise.allSettled` results for failures
- Some Chinese RSS feeds may be blocked internationally
- Use VPN or proxy if needed

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all environment variables are set

### Vercel Deployment Issues
- Function timeout: Optimize slow endpoints
- Memory limits: Reduce concurrent operations
- Cold starts: Expect slower first requests

## Future Enhancements

### Planned Features (See README.md)
- Tokyo and Seoul region support
- Historical trending data with charts
- User authentication and profiles
- Social media sharing
- PDF report export
- WebSocket real-time updates
- Dark mode
- More AI features (image generation, video summaries)

### Architecture Improvements
- Add database (PostgreSQL/MongoDB) for persistence
- Implement Redis for distributed caching
- Add rate limiting middleware
- Set up comprehensive testing (unit + E2E)
- Implement CI/CD pipelines
- Add monitoring and analytics (Sentry, Vercel Analytics)

## Additional Resources

### Documentation
- **README.md**: User-facing documentation
- **docs/**: Technical documentation and planning
- **claudedocs/**: Implementation logs and change history

### External Links
- Next.js Docs: https://nextjs.org/docs
- DeepSeek API: https://platform.deepseek.com/
- Radix UI: https://www.radix-ui.com/
- Natural.js: https://github.com/NaturalNode/natural

---

**Last Updated**: 2025-11-20
**Version**: 2.0 (AI-Enhanced)
**Maintained by**: Youhai (@Youhai020616)
