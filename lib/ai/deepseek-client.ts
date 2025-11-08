import OpenAI from 'openai';

const apiKey = process.env.DEEPSEEK_API_KEY || '';
const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

if (!apiKey) {
  // don't throw here — allow runtime checks and safer server behavior
  console.warn('Warning: DEEPSEEK_API_KEY is not set. AI calls will fail until configured.');
}

export const deepseek = new OpenAI({
  apiKey,
  baseURL,
  timeout: 12000, // 12 seconds timeout keeps total execution under Vercel limits
  maxRetries: 0,  // Disable OpenAI SDK's internal retries (we handle retries ourselves)
});

export default deepseek;
