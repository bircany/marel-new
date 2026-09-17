export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://marelpliseperde.com").replace(/\/+$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}
