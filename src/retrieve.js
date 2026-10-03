import { prisma } from "./db.js";

async function findMentionedEntities(question) {
  const allEntities = await prisma.entity.findMany();
  const lowerQuestion = question.toLowerCase();

  return allEntities.filter((e) =>
    lowerQuestion.includes(e.name.toLowerCase())
  );
}

async function getRelationsForEntity(entityId) {
  return prisma.relation.findMany({
    where: {
      OR: [{ sourceId: entityId }, { targetId: entityId }],
    },
    include: { source: true, target: true },
    orderBy: { validFrom: "desc" },
  });
}

function formatRelation(rel) {
  const status = rel.validTo ? `[superseded ${rel.validTo.toISOString().split("T")[0]}]` : "[current]";
  return `${rel.source.name} --${rel.relationType}--> ${rel.target.name} ${status}`;
}

// crude but honest token estimate — ~4 chars per token is a standard rule of thumb.
// good enough for budgeting; the real count comes back from the LLM call anyway.
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// relevance score: current facts outrank superseded ones, more recent outranks older.
// superseded facts aren't dropped entirely — they're just deprioritized — because
// "why" questions genuinely need history, just not ALL of it.
function scoreRelation(rel, matchedEntityIds) {
  let score = rel.validTo ? 0 : 5;

  const ageMs = Date.now() - new Date(rel.validFrom).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  score += Math.max(0, 2 - ageDays * 0.05);

  // direct connection between the two entities the question actually named —
  // the strongest and most reliable relevance signal we have
  if (matchedEntityIds.has(rel.sourceId) && matchedEntityIds.has(rel.targetId)) {
    score += 25;
  }

  return score;
}

export async function retrieveSubgraph(question, maxTokens = 300) {
  const entities = await findMentionedEntities(question);
  if (entities.length === 0) {
    return { context: "", entitiesFound: [], factCount: 0, tokensUsed: 0 };
  }

  const matchedEntityIds = new Set(entities.map((e) => e.id));

  const allRelations = new Map();
  for (const entity of entities) {
    const relations = await getRelationsForEntity(entity.id);
    for (const rel of relations) allRelations.set(rel.id, rel);
  }

  const scored = [...allRelations.values()].map((rel) => ({
    rel,
    score: scoreRelation(rel, matchedEntityIds),
  }));

  const anchor = scored.find(
    (s) => matchedEntityIds.has(s.rel.sourceId) && matchedEntityIds.has(s.rel.targetId)
  );

  if (anchor) {
    for (const s of scored) {
      if (s.rel.id !== anchor.rel.id && s.rel.sourceText === anchor.rel.sourceText) {
        s.score += 20;
      }
    }
  }

  const ranked = scored.sort((a, b) => b.score - a.score).map((s) => s.rel);

  const selected = [];
  let tokensUsed = 0;
  for (const rel of ranked) {
    const line = formatRelation(rel);
    const lineTokens = estimateTokens(line);
    if (tokensUsed + lineTokens > maxTokens) break;
    selected.push(line);
    tokensUsed += lineTokens;
  }

  return {
    context: selected.join("\n"),
    entitiesFound: entities.map((e) => e.name),
    factCount: selected.length,
    totalFactsAvailable: ranked.length,
    tokensUsed,
  };
}