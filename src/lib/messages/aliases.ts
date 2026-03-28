import {
  normalizeMessageText,
  toDarijaPhoneticText,
} from "@/lib/messages/normalize";

interface AliasFamily {
  id: string;
  phrases: string[];
}

const aliasFamilies: AliasFamily[] = [
  {
    id: "price",
    phrases: [
      "price",
      "prix",
      "taman",
      "thaman",
      "thamen",
      "chhal",
      "ch7al",
      "ch7el",
      "combien",
      "tarif",
      "tarifs",
    ],
  },
  {
    id: "location",
    phrases: [
      "location",
      "adresse",
      "address",
      "fin",
      "win",
      "ou etes vous",
      "vous etes ou",
      "ou se trouve",
      "map",
      "maps",
      "lmagazin",
      "magasin",
      "mahal",
      "blassa",
    ],
  },
  {
    id: "stock",
    phrases: [
      "stock",
      "disponible",
      "availability",
      "kayn",
      "kayna",
      "kaynin",
      "wach kayn",
      "wach kayna",
      "wach kaynin",
    ],
  },
  {
    id: "delivery",
    phrases: [
      "livraison",
      "delivery",
      "shipping",
      "taslim",
      "livraison dispo",
      "delivery dispo",
      "3ndkom livraison",
    ],
  },
  {
    id: "hours",
    phrases: [
      "horaires",
      "horaire",
      "time",
      "timing",
      "timings",
      "hours",
      "opening hours",
      "wa9t",
      "w9t",
      "waqt",
      "kat7ello",
      "kat7ellou",
      "ouvre",
      "ouverture",
      "open",
    ],
  },
];

export interface AliasVariant {
  familyId: string;
  phrase: string;
  normalized: string;
  phonetic: string;
}

const aliasVariants = aliasFamilies.flatMap((family) =>
  family.phrases
    .map((phrase) => {
      const normalized = normalizeMessageText(phrase);

      if (!normalized) {
        return null;
      }

      return {
        familyId: family.id,
        phrase,
        normalized,
        phonetic: toDarijaPhoneticText(normalized),
      };
    })
    .filter((variant): variant is AliasVariant => Boolean(variant)),
);

export function getAliasFamiliesForKeyword(keyword: string) {
  const normalizedKeyword = normalizeMessageText(keyword);
  const phoneticKeyword = toDarijaPhoneticText(normalizedKeyword);
  const matchedFamilyIds = new Set(
    aliasVariants
      .filter(
        (variant) =>
          variant.normalized === normalizedKeyword ||
          variant.phonetic === phoneticKeyword,
      )
      .map((variant) => variant.familyId),
  );

  return aliasFamilies.filter((family) => matchedFamilyIds.has(family.id));
}

export function expandRuleKeywordAliases(keyword: string) {
  const normalizedKeyword = normalizeMessageText(keyword);
  const expanded = new Map<string, AliasVariant>();

  if (normalizedKeyword) {
    expanded.set(normalizedKeyword, {
      familyId: "direct",
      phrase: keyword,
      normalized: normalizedKeyword,
      phonetic: toDarijaPhoneticText(normalizedKeyword),
    });
  }

  for (const family of getAliasFamiliesForKeyword(keyword)) {
    for (const variant of aliasVariants) {
      if (variant.familyId === family.id) {
        expanded.set(variant.normalized, variant);
      }
    }
  }

  return [...expanded.values()];
}
