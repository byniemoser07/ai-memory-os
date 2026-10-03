import { prisma } from "./db.js";

function normalize(name) {
  return name.trim().toLowerCase();
}

async function findOrCreateEntity(name, type = "Unknown") {
  const normalized = normalize(name);

  const existing = await prisma.entity.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
  });

  if (existing) return existing;

  return prisma.entity.create({
    data: { name, type },
  });
}

export async function consolidateMigrations(sourceEntityId) {
  const migrations = await prisma.relation.findMany({
    where: {
      sourceId: sourceEntityId,
      relationType: { in: ["migrated_from", "migrated_to"] },
      validTo: null,
    },
    orderBy: { validFrom: "desc" },
    take: 2,
  });

  const from = migrations.find((m) => m.relationType === "migrated_from");
  const to = migrations.find((m) => m.relationType === "migrated_to");

  if (!from || !to) return null; // need both halves of the pair

  const oldUsesRelation = await prisma.relation.findFirst({
    where: {
      sourceId: sourceEntityId,
      targetId: from.targetId,
      relationType: "uses",
      validTo: null,
    },
  });

  if (!oldUsesRelation) return null; // nothing to supersede

  await prisma.relation.update({
    where: { id: oldUsesRelation.id },
    data: { validTo: new Date() },
  });

  const newUsesRelation = await prisma.relation.create({
    data: {
      sourceId: sourceEntityId,
      targetId: to.targetId,
      relationType: "uses",
      confidence: to.confidence,
      supersedesId: oldUsesRelation.id,
      sourceText: to.sourceText,
    },
  });

  return { superseded: oldUsesRelation, created: newUsesRelation };
}

export async function persistTriples(triples, sourceText) {
  const results = [];

  for (const triple of triples) {
    const source = await findOrCreateEntity(triple.subject, triple.subject_type);
    const target = await findOrCreateEntity(triple.object, triple.object_type);

    // skip if an identical active relation already exists
    const existing = await prisma.relation.findFirst({
      where: {
        sourceId: source.id,
        targetId: target.id,
        relationType: triple.relation,
        validTo: null,
      },
    });

    if (existing) {
      results.push(existing);
      continue;
    }

    const relation = await prisma.relation.create({
      data: {
        sourceId: source.id,
        targetId: target.id,
        relationType: triple.relation,
        confidence: triple.confidence ?? 1.0,
        sourceText,
      },
    });

    results.push(relation);
  }

  const uniqueSourceIds = [...new Set(results.map((r) => r.sourceId))];
  for (const sourceId of uniqueSourceIds) {
    await consolidateMigrations(sourceId);
  }

  return results;
}