import dotenv from 'dotenv';
dotenv.config();
console.log('CLIENT_ID: "' + process.env.GOOGLE_CLIENT_ID + '"');
console.log('Length:', process.env.GOOGLE_CLIENT_ID?.length);
