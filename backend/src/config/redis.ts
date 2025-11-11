import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Get connection details
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// 1. Solution to the Type Error: Use connection string URL
// The recommended way to handle optional credentials is to embed them
// in the URL string, which is more robust for environment variables.
// The password option in createClient expects a strict 'string' when
// 'exactOptionalPropertyTypes' is true, and process.env.REDIS_PASSWORD
// is 'string | undefined'.
let connectionUrl = REDIS_URL;

if (REDIS_PASSWORD) {
  // If a password exists, overwrite the connectionUrl to include it.
  // Assuming 'redis://localhost:6379' format, the password goes here:
  // redis://:PASSWORD@HOST:PORT
  connectionUrl = connectionUrl.replace(
    'redis://',
    `redis://:${REDIS_PASSWORD}@`
  );
}

// Create the client using the connection URL
const client: RedisClientType = createClient({
  url: connectionUrl
});

// Basic error handling
client.on('error', (err) => console.error('Redis Client Error', err));

// 2. Solution to the Unused Variable Warning: Connect and export
// You must connect the client and export it to be used elsewhere.
async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log('Redis connected successfully!');
  }
}

// ----------------------------------------------------
// Export the client and a connection function for use in your application
export { client, connectRedis };
// ----------------------------------------------------
