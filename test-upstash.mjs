import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('Testing Upstash Redis connection...');
console.log('URL:', process.env.UPSTASH_REDIS_REST_URL);

try {
  await redis.set("test:venturr:ping", "pong");
  const result = await redis.get("test:venturr:ping");
  console.log('✅ Connection successful! Result:', result);
  await redis.del("test:venturr:ping");
} catch (error) {
  console.error('❌ Connection failed:', error.message);
}
