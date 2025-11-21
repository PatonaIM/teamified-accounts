// Support both Vercel KV and standard Redis URL
const hasVercelKV = !!process.env.KV_URL;
const hasRedisUrl = !!process.env.REDIS_URL;

// Prefer standard REDIS_URL over Vercel KV
export const redisConfig = hasRedisUrl ? {
  url: process.env.REDIS_URL,
} : {
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
  host: process.env.KV_REST_API_URL?.replace('https://', ''),
  port: 6380,
  password: process.env.KV_REST_API_TOKEN,
  tls: {},
};
