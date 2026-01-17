import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

// This ensures the file is never accidentally imported into a client component
import "server-only";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from environment variables.");
}

/**
 * 🤖 Gemini AI Core Instance
 */
export const genAI = new GoogleGenerativeAI(apiKey);

/**
 * ⚡ Generative Model Configuration
 * Optimized for speed using gemini-1.5-flash
 */
export const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

/**
 * 📂 Server-Only File Manager
 * Handles local file path uploads to Gemini File API
 */
export const fileManager = new GoogleAIFileManager(apiKey);