import { generateAnswer } from "./answer.js";

// same prompt/model as the graph-based approach — the only difference
// is that "context" here is raw conversation turns, not a subgraph.
export async function generateBaselineAnswer(question, conversationTurns) {
  const rawContext = conversationTurns.join("\n");
  return generateAnswer(question, rawContext);
}