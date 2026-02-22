import dotenv from 'dotenv';
dotenv.config();

console.log('SONAR_API_KEY exists:', !!process.env.SONAR_API_KEY);
console.log('SONAR_API_KEY length:', process.env.SONAR_API_KEY?.length || 0);
console.log('First 10 chars:', process.env.SONAR_API_KEY?.substring(0, 10) || 'N/A');
