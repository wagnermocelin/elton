import dotenv from 'dotenv';

dotenv.config();

console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL existe?', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
console.log('DATABASE_URL (primeiros 50 chars):', process.env.DATABASE_URL?.substring(0, 50));
