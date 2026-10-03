import { retrieveSubgraph } from "./retrieve.js";
import { prisma } from "./db.js";

const question = "Why did Alpha migrate to PostgreSQL?";

const result = await retrieveSubgraph(question, 120);
console.log("Entities found:", result.entitiesFound);
console.log(`Facts selected: ${result.factCount} / ${result.totalFactsAvailable} available`);
console.log(`Estimated tokens: ${result.tokensUsed}`);
console.log("\nSubgraph context:\n" + result.context);

await prisma.$disconnect();