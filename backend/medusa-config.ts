import { defineConfig, loadEnv, Modules } from "@medusajs/framework/utils";
import path from "path";

// Don't import the connection factory directly to avoid circular dependencies
// import connectionFactory from "./src/overrides/connection-factory";

export default defineConfig({
  projectConfig: {
    redisUrl: process.env.REDIS_URL,
    redisOptions: {
      keepAlive: 600000,
    },
    databaseUrl: process.env.DATABASE_URL,
    databaseLogging: false,
    databaseDriverOptions: {
      maxRetries: 1,
      pool: {
        min: 5,
        max: 20
      },
      connection: {
        ssl: {
          rejectUnauthorized: false
        }
      }
    },
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl: "http://localhost:9000",
  },
  modules: [
    // Regular modules
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { 
        redisUrl: process.env.REDIS_URL,
        ttl: 3600 // 1 hour in seconds
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: "auto",
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
            }
          }
        ]
      }
    },
    {
      resolve: "./src/modules/sanity",
      options: {
        api_token: process.env.SANITY_API_TOKEN,
        project_id: process.env.SANITY_PROJECT_ID,
        api_version: new Date().toISOString().split("T")[0],
        dataset: "production",
        studio_url: "http://localhost:3000/cms",  // Changed to local development URL
        type_map: {
          collection: "collection",
          category: "category",
          product: "product"
        },
      },
    },
  ],
});
