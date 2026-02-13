import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMarkdown } from "../fetch-markdown";

/* ------------------------------------------------------------------ */
/*  Mock global fetch                                                  */
/* ------------------------------------------------------------------ */

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});
afterEach(() => {
  vi.restoreAllMocks();
});

function fakeResponse(
  body: string,
  opts: {
    contentType?: string;
    status?: number;
    markdownTokens?: string;
    url?: string;
  } = {},
) {
  const headers = new Headers();
  if (opts.contentType) headers.set("content-type", opts.contentType);
  if (opts.markdownTokens)
    headers.set("x-markdown-tokens", opts.markdownTokens);

  return {
    ok: (opts.status ?? 200) < 400,
    status: opts.status ?? 200,
    headers,
    url: opts.url ?? "https://example.com/page",
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("fetchMarkdown", () => {
  it("sends Accept header preferring text/markdown", async () => {
    mockFetch.mockResolvedValueOnce(
      fakeResponse("<html></html>", { contentType: "text/html" }),
    );

    await fetchMarkdown("https://example.com");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.Accept).toBe(
      "text/markdown, text/html;q=0.9, */*;q=0.1",
    );
  });

  it("detects markdown response and sets wasMarkdown = true", async () => {
    const md = "# Hello World\n\nThis is markdown.";
    mockFetch.mockResolvedValueOnce(
      fakeResponse(md, { contentType: "text/markdown; charset=utf-8" }),
    );

    const result = await fetchMarkdown("https://example.com");

    expect(result.wasMarkdown).toBe(true);
    expect(result.content).toBe(md);
    expect(result.contentType).toBe("text/markdown; charset=utf-8");
  });

  it("detects HTML response and sets wasMarkdown = false", async () => {
    const html = "<html><body><h1>Hello</h1></body></html>";
    mockFetch.mockResolvedValueOnce(
      fakeResponse(html, { contentType: "text/html; charset=utf-8" }),
    );

    const result = await fetchMarkdown("https://example.com");

    expect(result.wasMarkdown).toBe(false);
    expect(result.content).toBe(html);
  });

  it("parses x-markdown-tokens header", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce(
      fakeResponse("# Doc", {
        contentType: "text/markdown",
        markdownTokens: "1234",
      }),
    );

    const result = await fetchMarkdown("https://example.com/doc");

    expect(result.markdownTokens).toBe(1234);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("x-markdown-tokens: 1234"),
    );
  });

  it("returns null markdownTokens when header is absent", async () => {
    mockFetch.mockResolvedValueOnce(
      fakeResponse("<html></html>", { contentType: "text/html" }),
    );

    const result = await fetchMarkdown("https://example.com");

    expect(result.markdownTokens).toBeNull();
  });

  it("passes through status code and final url", async () => {
    mockFetch.mockResolvedValueOnce(
      fakeResponse("not found", {
        contentType: "text/html",
        status: 404,
        url: "https://example.com/404",
      }),
    );

    const result = await fetchMarkdown("https://example.com/missing");

    expect(result.status).toBe(404);
    expect(result.url).toBe("https://example.com/404");
  });

  it("merges extra headers without overriding Accept", async () => {
    let capturedHeaders: Record<string, string> = {};
    mockFetch.mockImplementationOnce(
      (_url: string, init: { headers: Record<string, string> }) => {
        capturedHeaders = { ...init.headers };
        return Promise.resolve(
          fakeResponse("ok", { contentType: "text/html" }),
        );
      },
    );

    await fetchMarkdown("https://example.com", {
      headers: { Authorization: "Bearer tok" },
    });

    expect(capturedHeaders.Accept).toBe(
      "text/markdown, text/html;q=0.9, */*;q=0.1",
    );
    expect(capturedHeaders.Authorization).toBe("Bearer tok");
  });

  it("handles missing content-type gracefully", async () => {
    mockFetch.mockResolvedValueOnce(fakeResponse("raw body", {}));

    const result = await fetchMarkdown("https://example.com");

    expect(result.wasMarkdown).toBe(false);
    expect(result.contentType).toBe("");
    expect(result.content).toBe("raw body");
  });
});
