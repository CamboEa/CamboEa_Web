// CamboEA - Environment Variables Configuration

/** MetalpriceAPI key (server-side only). Used for /api/markets metals. */
export function getMetalpriceApiKey(): string | undefined {
  return process.env.METALPRICE_API_KEY;
}
