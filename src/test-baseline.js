import { generateBaselineAnswer } from "./baseline.js";
import { prisma } from "./db.js";

const question = "Why did Alpha migrate to PostgreSQL?";

// the SAME 5 turns you fed into seed-conversation.js
const turns = [
  "Project Alpha was created using Python and MongoDB.",
  "Alpha was deployed on AWS shortly after launch.",
  "The team migrated Alpha from MongoDB to PostgreSQL because relational queries were becoming difficult to manage.",
  "Redis was added to Alpha for caching purposes.",
  "The team introduced a microservices architecture for Alpha to improve scalability.",
];

async function main() {
  const { answer, usage } = await generateBaselineAnswer(question, turns);

  console.log("Baseline Answer:", answer);
  console.log("\nToken usage (baseline):", usage);
  console.log("  -> input tokens:", usage.prompt_tokens);

  await prisma.$disconnect();
}

main();