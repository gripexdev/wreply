import { expandRuleKeywordAliases } from "@/lib/messages/aliases";
import {
  prepareMessageText,
  tokenizeNormalizedText,
  type PreparedMessageText,
} from "@/lib/messages/normalize";
import type {
  MatchEngineRule,
  MatchedRuleSnapshot,
  MatchSource,
  MessageLanguageHint,
  MessageMatchResult,
} from "@/types/messages";

interface PreparedAliasCandidate {
  familyId: string | null;
  phrase: string;
  normalized: string;
  tokens: string[];
  phonetic: string;
  phoneticTokens: string[];
  isDirectKeyword: boolean;
}

interface InternalMatchCandidate {
  rule: MatchEngineRule;
  matchedAlias: string;
  matchedAliasFamily: string | null;
  matchSource: MatchSource;
  matchedTextFragment: string;
  score: number;
  languageAffinity: number;
  specificityRank: number;
}

const frenchSignalTokens = new Set([
  "prix",
  "adresse",
  "livraison",
  "horaire",
  "horaires",
  "bonjour",
  "ou",
  "etes",
  "vous",
  "svp",
  "merci",
  "disponible",
  "delivery",
]);

const darijaSignalTokens = new Set([
  "fin",
  "win",
  "taman",
  "thaman",
  "thamen",
  "chhal",
  "ch7al",
  "kayn",
  "kayna",
  "kaynin",
  "wach",
  "wa9t",
  "w9t",
  "waqt",
  "kat7ello",
  "kat7ellou",
  "lmagazin",
]);

function toMatchedRuleSnapshot(rule: MatchEngineRule): MatchedRuleSnapshot {
  return {
    id: rule.id,
    keyword: rule.keyword,
    replyMessage: rule.replyMessage,
    matchType: rule.matchType,
    language: rule.language,
    category: rule.category,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: new Date(rule.createdAt).toISOString(),
    updatedAt: new Date(rule.updatedAt).toISOString(),
  };
}

function countSignals(tokens: string[], signalSet: Set<string>) {
  return tokens.reduce(
    (count, token) => (signalSet.has(token) ? count + 1 : count),
    0,
  );
}

export function detectMessageLanguageHint(
  preparedMessage: PreparedMessageText,
): MessageLanguageHint {
  const signalTokens = [
    ...preparedMessage.tokens,
    ...preparedMessage.phoneticTokens,
  ];
  const frenchSignals = countSignals(signalTokens, frenchSignalTokens);
  const darijaSignals = countSignals(signalTokens, darijaSignalTokens);

  if (frenchSignals > 0 && darijaSignals > 0) {
    return "mixed";
  }

  if (darijaSignals > 0) {
    return "darija";
  }

  if (frenchSignals > 0) {
    return "french";
  }

  return "neutral";
}

function getLanguageAffinity(
  ruleLanguage: MatchEngineRule["language"],
  messageLanguageHint: MessageLanguageHint,
) {
  if (ruleLanguage === "ANY") {
    return 1;
  }

  if (
    (ruleLanguage === "DARIJA" && messageLanguageHint === "darija") ||
    (ruleLanguage === "FRENCH" && messageLanguageHint === "french")
  ) {
    return 2;
  }

  if (messageLanguageHint === "mixed" || messageLanguageHint === "neutral") {
    return 1;
  }

  return 0;
}

function prepareAliasCandidates(keyword: string) {
  return expandRuleKeywordAliases(keyword)
    .map<PreparedAliasCandidate>((variant) => ({
      familyId: variant.familyId === "direct" ? null : variant.familyId,
      phrase: variant.phrase,
      normalized: variant.normalized,
      tokens: tokenizeNormalizedText(variant.normalized),
      phonetic: variant.phonetic,
      phoneticTokens: tokenizeNormalizedText(variant.phonetic),
      isDirectKeyword: variant.familyId === "direct",
    }))
    .sort((leftCandidate, rightCandidate) => {
      if (leftCandidate.isDirectKeyword !== rightCandidate.isDirectKeyword) {
        return leftCandidate.isDirectKeyword ? -1 : 1;
      }

      if (leftCandidate.tokens.length !== rightCandidate.tokens.length) {
        return rightCandidate.tokens.length - leftCandidate.tokens.length;
      }

      return rightCandidate.normalized.length - leftCandidate.normalized.length;
    });
}

function findTokenSequence(messageTokens: string[], candidateTokens: string[]) {
  if (
    candidateTokens.length === 0 ||
    candidateTokens.length > messageTokens.length
  ) {
    return null;
  }

  for (
    let index = 0;
    index <= messageTokens.length - candidateTokens.length;
    index += 1
  ) {
    const isMatch = candidateTokens.every(
      (candidateToken, candidateIndex) =>
        messageTokens[index + candidateIndex] === candidateToken,
    );

    if (isMatch) {
      return {
        startIndex: index,
        endIndex: index + candidateTokens.length,
      };
    }
  }

  return null;
}

function findMatchedFragment(
  preparedMessage: PreparedMessageText,
  candidate: PreparedAliasCandidate,
) {
  const directMatch = findTokenSequence(
    preparedMessage.tokens,
    candidate.tokens,
  );

  if (directMatch) {
    return preparedMessage.tokens
      .slice(directMatch.startIndex, directMatch.endIndex)
      .join(" ");
  }

  const phoneticMatch = findTokenSequence(
    preparedMessage.phoneticTokens,
    candidate.phoneticTokens,
  );

  if (phoneticMatch) {
    return preparedMessage.tokens
      .slice(phoneticMatch.startIndex, phoneticMatch.endIndex)
      .join(" ");
  }

  return null;
}

function scoreCandidate(
  rule: MatchEngineRule,
  candidate: PreparedAliasCandidate,
  languageAffinity: number,
) {
  const baseScore = rule.matchType === "EXACT" ? 94 : 82;
  const directBonus = candidate.isDirectKeyword ? 6 : 2;
  const phraseBonus = Math.min(candidate.tokens.length * 3, 9);
  const languageBonus = languageAffinity === 2 ? 3 : 0;

  return Math.min(100, baseScore + directBonus + phraseBonus + languageBonus);
}

function tryMatchRule(
  rule: MatchEngineRule,
  preparedMessage: PreparedMessageText,
  messageLanguageHint: MessageLanguageHint,
) {
  const languageAffinity = getLanguageAffinity(
    rule.language,
    messageLanguageHint,
  );

  for (const candidate of prepareAliasCandidates(rule.keyword)) {
    if (rule.matchType === "EXACT") {
      const isSurfaceExactMatch =
        preparedMessage.normalized === candidate.normalized;
      const isPhoneticExactMatch =
        preparedMessage.phonetic === candidate.phonetic;

      if (!isSurfaceExactMatch && !isPhoneticExactMatch) {
        continue;
      }

      return {
        rule,
        matchedAlias: candidate.phrase,
        matchedAliasFamily: candidate.familyId,
        matchSource: candidate.isDirectKeyword ? "keyword" : "alias",
        matchedTextFragment: preparedMessage.normalized,
        score: scoreCandidate(rule, candidate, languageAffinity),
        languageAffinity,
        specificityRank:
          candidate.tokens.length * 100 + candidate.normalized.length,
      } satisfies InternalMatchCandidate;
    }

    const matchedFragment = findMatchedFragment(preparedMessage, candidate);

    if (!matchedFragment) {
      continue;
    }

    return {
      rule,
      matchedAlias: candidate.phrase,
      matchedAliasFamily: candidate.familyId,
      matchSource: candidate.isDirectKeyword ? "keyword" : "alias",
      matchedTextFragment: matchedFragment,
      score: scoreCandidate(rule, candidate, languageAffinity),
      languageAffinity,
      specificityRank:
        candidate.tokens.length * 100 + candidate.normalized.length,
    } satisfies InternalMatchCandidate;
  }

  return null;
}

function compareCandidates(
  leftCandidate: InternalMatchCandidate,
  rightCandidate: InternalMatchCandidate,
) {
  if (leftCandidate.rule.priority !== rightCandidate.rule.priority) {
    return leftCandidate.rule.priority - rightCandidate.rule.priority;
  }

  if (leftCandidate.rule.matchType !== rightCandidate.rule.matchType) {
    return leftCandidate.rule.matchType === "EXACT" ? -1 : 1;
  }

  if (leftCandidate.matchSource !== rightCandidate.matchSource) {
    return leftCandidate.matchSource === "keyword" ? -1 : 1;
  }

  if (leftCandidate.languageAffinity !== rightCandidate.languageAffinity) {
    return rightCandidate.languageAffinity - leftCandidate.languageAffinity;
  }

  if (leftCandidate.specificityRank !== rightCandidate.specificityRank) {
    return rightCandidate.specificityRank - leftCandidate.specificityRank;
  }

  const leftCreatedAt = new Date(leftCandidate.rule.createdAt).getTime();
  const rightCreatedAt = new Date(rightCandidate.rule.createdAt).getTime();

  if (leftCreatedAt !== rightCreatedAt) {
    return leftCreatedAt - rightCreatedAt;
  }

  return leftCandidate.rule.id.localeCompare(rightCandidate.rule.id);
}

function buildMatchedReason(
  winningCandidate: InternalMatchCandidate,
  messageLanguageHint: MessageLanguageHint,
  matchedCandidatesCount: number,
) {
  const aliasReason =
    winningCandidate.matchSource === "alias"
      ? `using alias "${winningCandidate.matchedAlias}"`
      : `using keyword "${winningCandidate.rule.keyword}"`;
  const languageReason =
    winningCandidate.rule.language === "ANY"
      ? "The rule is language-agnostic."
      : `Language tag ${winningCandidate.rule.language.toLowerCase()} stayed eligible with a ${messageLanguageHint} message signal.`;
  const competitionReason =
    matchedCandidatesCount > 1
      ? `Priority ${winningCandidate.rule.priority} won the deterministic tie-break sequence.`
      : "No higher-ranked active rule matched this message.";

  return `${winningCandidate.rule.matchType.toLowerCase()} match ${aliasReason}. ${languageReason} ${competitionReason}`;
}

export interface MatchMessageAgainstRulesInput {
  workspaceId: string;
  message: string;
  rules: MatchEngineRule[];
}

export function matchMessageAgainstRules({
  workspaceId,
  message,
  rules,
}: MatchMessageAgainstRulesInput): MessageMatchResult {
  const preparedMessage = prepareMessageText(message);
  const messageLanguageHint = detectMessageLanguageHint(preparedMessage);
  const eligibleRules = rules.filter((rule) => rule.isActive);
  const matchCandidates = eligibleRules
    .map((rule) => tryMatchRule(rule, preparedMessage, messageLanguageHint))
    .filter((candidate): candidate is InternalMatchCandidate =>
      Boolean(candidate),
    )
    .sort(compareCandidates);
  const winningCandidate = matchCandidates[0] ?? null;

  if (!winningCandidate) {
    return {
      workspaceId,
      rawMessage: message,
      normalizedMessage: preparedMessage.normalized,
      matched: false,
      matchedRuleId: null,
      matchedRule: null,
      matchedKeyword: null,
      matchTypeUsed: null,
      matchedTextFragment: null,
      matchedAlias: null,
      matchedAliasFamily: null,
      matchSource: null,
      score: null,
      reason:
        "No active workspace rule matched the normalized message. Fallback remains eligible.",
      fallbackEligible: true,
      messageLanguageHint,
      evaluatedRulesCount: rules.length,
      eligibleRulesCount: eligibleRules.length,
    };
  }

  return {
    workspaceId,
    rawMessage: message,
    normalizedMessage: preparedMessage.normalized,
    matched: true,
    matchedRuleId: winningCandidate.rule.id,
    matchedRule: toMatchedRuleSnapshot(winningCandidate.rule),
    matchedKeyword: winningCandidate.rule.keyword,
    matchTypeUsed: winningCandidate.rule.matchType,
    matchedTextFragment: winningCandidate.matchedTextFragment,
    matchedAlias: winningCandidate.matchedAlias,
    matchedAliasFamily: winningCandidate.matchedAliasFamily,
    matchSource: winningCandidate.matchSource,
    score: winningCandidate.score,
    reason: buildMatchedReason(
      winningCandidate,
      messageLanguageHint,
      matchCandidates.length,
    ),
    fallbackEligible: false,
    messageLanguageHint,
    evaluatedRulesCount: rules.length,
    eligibleRulesCount: eligibleRules.length,
  };
}
