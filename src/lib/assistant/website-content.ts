const MAX_WEBSITE_CONTENT_LENGTH = 12000;

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function normalizeWhitespace(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripHtmlToText(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const withBreaks = withoutScripts.replace(
    /<\/(p|div|section|article|li|ul|ol|h1|h2|h3|h4|h5|h6|br|tr)>/gi,
    "\n",
  );
  const plainText = withBreaks.replace(/<[^>]+>/g, " ");

  return normalizeWhitespace(decodeHtmlEntities(plainText)).slice(
    0,
    MAX_WEBSITE_CONTENT_LENGTH,
  );
}

export async function extractWebsiteKnowledge(websiteUrl: string) {
  const response = await fetch(websiteUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "WReplyBot/1.0 (+https://wreply.local)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Website fetch failed with status ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (
    !contentType.includes("text/html") &&
    !contentType.includes("text/plain")
  ) {
    throw new Error("The website did not return readable text content.");
  }

  const rawContent = await response.text();
  const extractedText = contentType.includes("text/html")
    ? stripHtmlToText(rawContent)
    : normalizeWhitespace(rawContent).slice(0, MAX_WEBSITE_CONTENT_LENGTH);

  if (!extractedText) {
    throw new Error("No readable website content was found.");
  }

  return extractedText;
}
