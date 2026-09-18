export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.marelpliseperde.com.tr").replace(/\/+$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}
