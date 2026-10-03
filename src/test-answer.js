import { retrieveSubgraph } from "./retrieve.js";
import { generateAnswer } from "./answer.js";
import { prisma } from "./db.js";

const question = "Why did Alpha migrate to PostgreSQL?";

async function main() {
  const { context, entitiesFound, factCount, totalFactsAvailable, tokensUsed } =
    await retrieveSubgraph(question, 120);

  console.log(`Entities matched: ${entitiesFound.join(", ")}`);
  console.log(`Facts selected: ${factCount} / ${totalFactsAvailable} available (~${tokensUsed} est. tokens)\n`);

  const { answer, usage } = await generateAnswer(question, context);

  console.log("Answer:", answer);
  console.log("\nLLM input tokens (actual):", usage.prompt_tokens);

  await prisma.$disconnect();
}

main();