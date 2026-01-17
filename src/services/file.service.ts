import { fileManager } from "@/lib/gemini/client";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

/**
 * Uploads a file to Gemini by temporarily saving it to the local filesystem.
 * @param file The File object from the request/form.
 * @returns The Gemini File URI.
 */
export async function uploadFileToGemini(file: File) {
  // 1. Convert the file to a Buffer
  const byteValue = await file.arrayBuffer();
  const buffer = Buffer.from(byteValue);

  // 2. Create a unique path in the OS temp directory
  const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);

  // 3. Write file to local disk (required by GoogleAIFileManager)
  await writeFile(tempPath, buffer);

  try {
    // 4. Upload to Gemini using the file path
    const uploaded = await fileManager.uploadFile(tempPath, {
      mimeType: file.type || "application/octet-stream",
      displayName: file.name,
    });

    console.log(`File uploaded to Gemini: ${uploaded.file.uri}`);
    return uploaded.file.uri;

  } catch (error) {
    console.error("Gemini Upload Error:", error);
    throw error;
  } finally {
    // 5. Clean up: Delete the file from your local disk
    try {
      await unlink(tempPath);
    } catch (cleanupError) {
      console.error("Failed to delete temp file:", cleanupError);
    }
  }
}