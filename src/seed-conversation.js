import { extractTriples } from "./extract.js";
import { persistTriples } from "./store.js";
import { prisma } from "./db.js";

const turns = [
  "Project Alpha was created using Python and MongoDB.",
  "Alpha was deployed on AWS shortly after launch.",
  "The team migrated Alpha from MongoDB to PostgreSQL because relational queries were becoming difficult to manage.",
  "Redis was added to Alpha for caching purposes.",
  "The team introduced a microservices architecture for Alpha to improve scalability.",
];

async function main() {
  let totalTokens = 0;

  for (const [i, turn] of turns.entries()) {
    const { triples, usage } = await extractTriples(turn);
    const saved = await persistTriples(triples, turn);
    totalTokens += usage.total_tokens;
    console.log(`Turn ${i + 1}: "${turn}"`);
    console.log(`  -> ${saved.length} relations, ${usage.total_tokens} tokens`);
  }

  console.log(`\nTotal tokens across ${turns.length} turns: ${totalTokens}`);
  await prisma.$disconnect();
}

main();