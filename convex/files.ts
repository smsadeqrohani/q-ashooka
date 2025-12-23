"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get MIME type from filename
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'ico': 'image/x-icon',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// Upload a single file
export const uploadFile = action({
  args: {
    file: v.bytes(),
    filename: v.string(),
  },
  handler: async (ctx, args) => {
    const mimeType = getMimeType(args.filename);
    const fileId = await ctx.storage.store(new Blob([args.file], { type: mimeType }));
    return fileId;
  },
});

// Upload multiple files
export const uploadFiles = action({
  args: {
    files: v.array(v.object({
      data: v.bytes(),
      filename: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const fileIds = [];

    for (const file of args.files) {
      const mimeType = getMimeType(file.filename);
      const fileId = await ctx.storage.store(new Blob([file.data], { type: mimeType }));
      fileIds.push(fileId);
    }

    return fileIds;
  },
});

// Delete a file
export const deleteFile = action({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.fileId);
    return true;
  },
});

// Get file URL
export const getFileUrl = action({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});
