import { retrieveSubgraph } from "./retrieve.js";
import { generateAnswer } from "./answer.js";
import { generateBaselineAnswer } from "./baseline.js";
import { prisma } from "./db.js";

const question = "Why did Alpha migrate to PostgreSQL?";

const turns = [
  "Project Alpha was created using Python and MongoDB.",
  "Alpha was deployed on AWS shortly after launch.",
  "The team also started Project Zeta, a separate internal tool built with Go.",
  "Zeta uses PostgreSQL from the start.",
  "Alpha's team added a logging service using the ELK stack.",
  "The team migrated Alpha from MongoDB to PostgreSQL because relational queries were becoming difficult to manage.",
  "Redis was added to Alpha for caching purposes.",
  "Zeta was deployed on Google Cloud Platform.",
  "The team introduced a microservices architecture for Alpha to improve scalability.",
  "Alpha's authentication was migrated from custom JWT handling to Auth0.",
  "Zeta added a Redis cache as well, separate from Alpha's.",
  "The team wrote unit tests for Alpha using Jest.",
  "Alpha's CI pipeline was set up using GitHub Actions.",
  "Zeta's CI pipeline uses CircleCI instead.",
  "Alpha added rate limiting using a token bucket algorithm.",
  "The team deprecated Zeta due to low internal adoption.",
  "Alpha introduced a GraphQL API layer on top of its existing REST endpoints.",
  "Alpha's PostgreSQL database was later sharded across three nodes for scale.",
  "The team added Prometheus and Grafana for monitoring Alpha.",
  "Alpha's microservices were containerized using Docker.",
  "The team orchestrated Alpha's containers using Kubernetes.",
  "Alpha migrated its CI pipeline from GitHub Actions to Jenkins for more control.",
  "A new caching layer using Memcached was evaluated but ultimately rejected in favor of keeping Redis.",
  "Alpha's team adopted a trunk-based development workflow.",
  "The team documented Alpha's architecture in a shared wiki for onboarding.",
];

async function main() {
  console.log(`Question: "${question}"`);
  console.log(`Baseline conversation length: ${turns.length} turns\n`);
  console.log("=".repeat(60));

  const graphResult = await retrieveSubgraph(question, 120);
  const graphAnswer = await generateAnswer(question, graphResult.context);

  console.log("\n[GRAPH APPROACH]");
  console.log(`Facts used: ${graphResult.factCount} / ${graphResult.totalFactsAvailable} available in graph`);
  console.log(`Input tokens: ${graphAnswer.usage.prompt_tokens}`);
  console.log(`Answer: ${graphAnswer.answer}`);

  console.log("\n" + "=".repeat(60));

  const baselineAnswer = await generateBaselineAnswer(question, turns);

  console.log("\n[BASELINE APPROACH]");
  console.log(`Turns sent: ${turns.length} (all of them)`);
  console.log(`Input tokens: ${baselineAnswer.usage.prompt_tokens}`);
  console.log(`Answer: ${baselineAnswer.answer}`);

  console.log("\n" + "=".repeat(60));
  const saved = baselineAnswer.usage.prompt_tokens - graphAnswer.usage.prompt_tokens;
  const pct = ((saved / baselineAnswer.usage.prompt_tokens) * 100).toFixed(1);
  console.log(`\nToken difference: ${saved} tokens saved by graph approach (${pct}% reduction)`);

  await prisma.$disconnect();
}

main();