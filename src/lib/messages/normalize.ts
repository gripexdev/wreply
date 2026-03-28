const combiningMarksPattern = /\p{M}+/gu;
const latinToArabicBoundaryPattern =
  /([\p{Script=Latin}\p{N}])(\p{Script=Arabic})/gu;
const arabicToLatinBoundaryPattern =
  /(\p{Script=Arabic})([\p{Script=Latin}\p{N}])/gu;
const apostrophePattern = /['’`´]+/gu;
const connectorPattern = /[-–—_/\\|]+/gu;
const punctuationPattern = /[^\p{L}\p{N}\s]+/gu;
const whitespacePattern = /\s+/g;

const darijaDigitMap: Record<string, string> = {
  "2": "a",
  "3": "a",
  "5": "kh",
  "6": "t",
  "7": "h",
  "8": "gh",
  "9": "q",
};

export interface PreparedMessageText {
  raw: string;
  normalized: string;
  tokens: string[];
  phonetic: string;
  phoneticTokens: string[];
}

function normalizeWhitespace(value: string) {
  return value.replace(whitespacePattern, " ").trim();
}

function normalizeTextBase(value: string) {
  return normalizeWhitespace(
    value
      .normalize("NFKD")
      .replace(combiningMarksPattern, "")
      .toLowerCase()
      .replace(apostrophePattern, " ")
      .replace(latinToArabicBoundaryPattern, "$1 $2")
      .replace(arabicToLatinBoundaryPattern, "$1 $2")
      .replace(connectorPattern, " ")
      .replace(punctuationPattern, " "),
  );
}

function toPhoneticToken(token: string) {
  return token
    .split("")
    .map((character) => darijaDigitMap[character] ?? character)
    .join("");
}

export function normalizeMessageText(value: string) {
  return normalizeTextBase(value);
}

export function tokenizeNormalizedText(value: string) {
  return value ? value.split(" ") : [];
}

export function toDarijaPhoneticText(value: string) {
  return tokenizeNormalizedText(value).map(toPhoneticToken).join(" ");
}

export function prepareMessageText(value: string): PreparedMessageText {
  const normalized = normalizeMessageText(value);
  const tokens = tokenizeNormalizedText(normalized);
  const phoneticTokens = tokens.map(toPhoneticToken);

  return {
    raw: value,
    normalized,
    tokens,
    phonetic: phoneticTokens.join(" "),
    phoneticTokens,
  };
}
