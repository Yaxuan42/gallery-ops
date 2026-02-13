/**
 * Cloudflare Markdown for Agents — fetch wrapper
 *
 * Sends `Accept: text/markdown, text/html` so Cloudflare-proxied sites
 * can return pre-rendered Markdown instead of HTML.
 *
 * Usage:
 *   const result = await fetchMarkdown("https://example.com/page");
 *   if (result.wasMarkdown) {
 *     // result.content is already clean markdown
 *   } else {
 *     // result.content is raw HTML — parse it yourself
 *   }
 */

export interface FetchMarkdownResult {
  /** The response body text */
  content: string;
  /** The raw content-type header value */
  contentType: string;
  /** True when the server returned text/markdown */
  wasMarkdown: boolean;
  /** Value of x-markdown-tokens header, if present */
  markdownTokens: number | null;
  /** HTTP status code */
  status: number;
  /** Final URL after redirects */
  url: string;
}

export interface FetchMarkdownOptions {
  /** Extra headers to merge (Accept is always set) */
  headers?: Record<string, string>;
  /** Abort signal */
  signal?: AbortSignal;
  /** Request timeout in ms (default 30 000) */
  timeoutMs?: number;
}

/**
 * Fetch a URL preferring Markdown via Cloudflare's Markdown for Agents.
 *
 * - Sends `Accept: text/markdown, text/html`
 * - If response content-type starts with `text/markdown`, returns body as-is
 * - Otherwise returns raw HTML for the caller to handle
 * - Logs `x-markdown-tokens` when present
 */
export async function fetchMarkdown(
  url: string,
  options: FetchMarkdownOptions = {},
): Promise<FetchMarkdownResult> {
  const { headers: extraHeaders = {}, signal, timeoutMs = 30_000 } = options;

  const controller = new AbortController();
  const linkedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const mergedHeaders: Record<string, string> = Object.assign(
    {
      Accept: "text/markdown, text/html;q=0.9, */*;q=0.1",
      "User-Agent": "OpenClaw/1.0 (Markdown-Agent)",
    },
    extraHeaders,
  );

  try {
    const response = await fetch(url, {
      headers: mergedHeaders,
      redirect: "follow",
      signal: linkedSignal,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const wasMarkdown = contentType
      .toLowerCase()
      .startsWith("text/markdown");

    // Parse x-markdown-tokens if present
    const tokensHeader = response.headers.get("x-markdown-tokens");
    const markdownTokens = tokensHeader ? Number(tokensHeader) : null;

    if (markdownTokens !== null) {
      console.log(
        `[fetch-markdown] x-markdown-tokens: ${markdownTokens} (${url})`,
      );
    }

    const content = await response.text();

    return {
      content,
      contentType,
      wasMarkdown,
      markdownTokens,
      status: response.status,
      url: response.url,
    };
  } finally {
    clearTimeout(timeout);
  }
}
