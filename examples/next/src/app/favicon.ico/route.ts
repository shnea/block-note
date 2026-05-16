const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#111827"/>
  <path d="M18 16h20a10 10 0 0 1 0 20H26v12h-8V16Zm8 8v4h12a2 2 0 0 0 0-4H26Z" fill="#ffffff"/>
  <path d="M38 36h8v12h-8z" fill="#22c55e"/>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/svg+xml"
    }
  });
}
