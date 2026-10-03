import { extractTriples } from "./extract.js";
import { persistTriples } from "./store.js";
import { prisma } from "./db.js";

const sampleText = `
Project Alpha was created using Python and MongoDB. It was later deployed on AWS.
After a few months, the team migrated Alpha from MongoDB to PostgreSQL because
relational queries were becoming difficult to manage. Redis was also added for caching,
and the team introduced a microservices architecture.
`;

async function main() {
  const { triples, usage } = await extractTriples(sampleText);
  console.log(`Extracted ${triples.length} triples. Tokens used:`, usage.total_tokens);

  const saved = await persistTriples(triples, sampleText);
  console.log(`Saved ${saved.length} relations to the graph.`);

  await prisma.$disconnect();
}

main();
