import { Prisma, type AutoReplyRule } from "@prisma/client";

import { prisma } from "@/database/client";
import {
  createRuleSchema,
  moveRuleSchema,
  rulesQuerySchema,
  updateRuleSchema,
  updateRuleStatusSchema,
  type CreateRuleInput,
  type MoveRuleInput,
  type RulesQueryInput,
  type UpdateRuleInput,
  type UpdateRuleStatusInput,
} from "@/lib/validation/rules";
import type {
  RuleListItem,
  RulesListResponse,
  RuleSortOption,
} from "@/types/rules";

class RuleServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_FOUND"
      | "CONFLICT"
      | "INVALID_INPUT"
      | "INVALID_MOVE",
  ) {
    super(message);
    this.name = "RuleServiceError";
  }
}

function toRuleListItem(rule: AutoReplyRule): RuleListItem {
  return {
    id: rule.id,
    keyword: rule.keyword,
    replyMessage: rule.replyMessage,
    matchType: rule.matchType,
    language: rule.language,
    category: rule.category,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

async function ensureUniqueRule(
  workspaceId: string,
  input: {
    keyword: string;
    matchType: "EXACT" | "CONTAINS";
    language: "ANY" | "DARIJA" | "FRENCH";
  },
  excludeRuleId?: string,
) {
  const existingRule = await prisma.autoReplyRule.findFirst({
    where: {
      workspaceId,
      keyword: input.keyword,
      matchType: input.matchType,
      language: input.language,
      ...(excludeRuleId
        ? {
            id: {
              not: excludeRuleId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (existingRule) {
    throw new RuleServiceError(
      "A rule with the same keyword, language, and match type already exists.",
      "CONFLICT",
    );
  }
}

async function listOrderedRuleIds(
  transaction: Prisma.TransactionClient,
  workspaceId: string,
) {
  const rules = await transaction.autoReplyRule.findMany({
    where: { workspaceId },
    orderBy: [{ priority: "asc" }, { updatedAt: "asc" }],
    select: { id: true },
  });

  return rules.map((rule) => rule.id);
}

async function reindexRules(
  transaction: Prisma.TransactionClient,
  orderedRuleIds: string[],
) {
  for (const [index, ruleId] of orderedRuleIds.entries()) {
    await transaction.autoReplyRule.update({
      where: { id: ruleId },
      data: { priority: index + 1 },
    });
  }
}

function clampPriority(priority: number, max: number) {
  return Math.max(1, Math.min(priority, max));
}

function getRulesOrderBy(
  sort: RuleSortOption,
): Prisma.AutoReplyRuleOrderByWithRelationInput[] {
  switch (sort) {
    case "updated_desc":
      return [{ updatedAt: "desc" }, { priority: "asc" }, { id: "asc" }];
    case "keyword_asc":
      return [{ keyword: "asc" }, { priority: "asc" }, { id: "asc" }];
    case "keyword_desc":
      return [{ keyword: "desc" }, { priority: "asc" }, { id: "asc" }];
    case "priority_asc":
    default:
      return [{ priority: "asc" }, { updatedAt: "desc" }, { id: "asc" }];
  }
}

export async function listWorkspaceRules(
  workspaceId: string,
  rawQuery: RulesQueryInput,
): Promise<RulesListResponse> {
  const query = rulesQuerySchema.parse(rawQuery);

  const where: Prisma.AutoReplyRuleWhereInput = {
    workspaceId,
    ...(query.status === "active" ? { isActive: true } : {}),
    ...(query.status === "inactive" ? { isActive: false } : {}),
    ...(query.language !== "all" ? { language: query.language } : {}),
    ...(query.matchType !== "all" ? { matchType: query.matchType } : {}),
    ...(query.category
      ? {
          category: query.category,
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            {
              keyword: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              replyMessage: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const filteredTotal = await prisma.autoReplyRule.count({ where });
  const totalPages = Math.max(1, Math.ceil(filteredTotal / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const skip = (page - 1) * query.pageSize;
  const orderBy = getRulesOrderBy(query.sort);

  const [rules, total, active, inactive, categories] = await Promise.all([
    prisma.autoReplyRule.findMany({
      where,
      orderBy,
      skip,
      take: query.pageSize,
    }),
    prisma.autoReplyRule.count({
      where: {
        workspaceId,
      },
    }),
    prisma.autoReplyRule.count({
      where: {
        workspaceId,
        isActive: true,
      },
    }),
    prisma.autoReplyRule.count({
      where: {
        workspaceId,
        isActive: false,
      },
    }),
    prisma.autoReplyRule.findMany({
      where: {
        workspaceId,
        category: {
          not: null,
        },
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
      select: {
        category: true,
      },
    }),
  ]);

  return {
    rules: rules.map(toRuleListItem),
    categories: categories
      .map((entry) => entry.category)
      .filter((value): value is string => Boolean(value)),
    summary: {
      total,
      active,
      inactive,
    },
    filters: {
      ...query,
      page,
    },
    pagination: {
      page,
      pageSize: query.pageSize,
      totalItems: filteredTotal,
      totalPages,
      startItem: filteredTotal === 0 ? 0 : skip + 1,
      endItem: filteredTotal === 0 ? 0 : skip + rules.length,
    },
  };
}

export async function createWorkspaceRule(
  workspaceId: string,
  rawInput: CreateRuleInput,
) {
  const input = createRuleSchema.parse(rawInput);
  await ensureUniqueRule(workspaceId, {
    keyword: input.keyword,
    matchType: input.matchType,
    language: input.language,
  });

  return prisma.$transaction(async (transaction) => {
    const orderedRuleIds = await listOrderedRuleIds(transaction, workspaceId);
    const targetPriority = clampPriority(
      input.priority,
      orderedRuleIds.length + 1,
    );

    const createdRule = await transaction.autoReplyRule.create({
      data: {
        workspaceId,
        keyword: input.keyword,
        replyMessage: input.replyMessage,
        matchType: input.matchType,
        language: input.language,
        category: input.category ?? null,
        priority: targetPriority,
        isActive: input.isActive,
      },
    });

    const nextOrder = [...orderedRuleIds];
    nextOrder.splice(targetPriority - 1, 0, createdRule.id);
    await reindexRules(transaction, nextOrder);

    const finalRule = await transaction.autoReplyRule.findUniqueOrThrow({
      where: { id: createdRule.id },
    });

    return toRuleListItem(finalRule);
  });
}

export async function updateWorkspaceRule(
  workspaceId: string,
  rawInput: UpdateRuleInput,
) {
  const input = updateRuleSchema.parse(rawInput);

  const existingRule = await prisma.autoReplyRule.findFirst({
    where: {
      id: input.id,
      workspaceId,
    },
  });

  if (!existingRule) {
    throw new RuleServiceError("Rule not found.", "NOT_FOUND");
  }

  await ensureUniqueRule(
    workspaceId,
    {
      keyword: input.keyword,
      matchType: input.matchType,
      language: input.language,
    },
    input.id,
  );

  return prisma.$transaction(async (transaction) => {
    const orderedRuleIds = await listOrderedRuleIds(transaction, workspaceId);
    const currentOrder = orderedRuleIds.filter((ruleId) => ruleId !== input.id);
    const targetPriority = clampPriority(input.priority, orderedRuleIds.length);
    currentOrder.splice(targetPriority - 1, 0, input.id);

    await transaction.autoReplyRule.update({
      where: { id: input.id },
      data: {
        keyword: input.keyword,
        replyMessage: input.replyMessage,
        matchType: input.matchType,
        language: input.language,
        category: input.category ?? null,
        isActive: input.isActive,
      },
    });

    await reindexRules(transaction, currentOrder);

    const finalRule = await transaction.autoReplyRule.findUniqueOrThrow({
      where: { id: input.id },
    });

    return toRuleListItem(finalRule);
  });
}

export async function deleteWorkspaceRule(workspaceId: string, ruleId: string) {
  return prisma.$transaction(async (transaction) => {
    const orderedRuleIds = await listOrderedRuleIds(transaction, workspaceId);

    if (!orderedRuleIds.includes(ruleId)) {
      throw new RuleServiceError("Rule not found.", "NOT_FOUND");
    }

    await transaction.autoReplyRule.delete({
      where: { id: ruleId },
    });

    const nextOrder = orderedRuleIds.filter(
      (currentRuleId) => currentRuleId !== ruleId,
    );
    await reindexRules(transaction, nextOrder);
  });
}

export async function updateWorkspaceRuleStatus(
  workspaceId: string,
  ruleId: string,
  rawInput: UpdateRuleStatusInput,
) {
  const input = updateRuleStatusSchema.parse(rawInput);

  const existingRule = await prisma.autoReplyRule.findFirst({
    where: {
      id: ruleId,
      workspaceId,
    },
  });

  if (!existingRule) {
    throw new RuleServiceError("Rule not found.", "NOT_FOUND");
  }

  const updatedRule = await prisma.autoReplyRule.update({
    where: {
      id: ruleId,
    },
    data: {
      isActive: input.isActive,
    },
  });

  return toRuleListItem(updatedRule);
}

export async function moveWorkspaceRule(
  workspaceId: string,
  ruleId: string,
  rawInput: MoveRuleInput,
) {
  const input = moveRuleSchema.parse(rawInput);

  return prisma.$transaction(async (transaction) => {
    const orderedRuleIds = await listOrderedRuleIds(transaction, workspaceId);
    const currentIndex = orderedRuleIds.findIndex(
      (currentRuleId) => currentRuleId === ruleId,
    );

    if (currentIndex === -1) {
      throw new RuleServiceError("Rule not found.", "NOT_FOUND");
    }

    const targetIndex =
      input.direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= orderedRuleIds.length) {
      throw new RuleServiceError(
        "This rule cannot be moved further in that direction.",
        "INVALID_MOVE",
      );
    }

    const nextOrder = [...orderedRuleIds];
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[currentIndex],
    ];

    await reindexRules(transaction, nextOrder);
  });
}

export { RuleServiceError };
