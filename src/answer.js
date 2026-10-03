import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ANSWER_PROMPT = `You answer questions using ONLY the information provided below (either structured facts or raw conversation text).

Rules:
- Base your answer strictly on the information given. Do not invent facts, entities, dates, or justifications that are not present in the information below.
- You SHOULD connect related facts that are given together to form a coherent answer — for example, if one fact states an entity changed from X to Y, and another fact states what Y (or the change) was used for, combine them to explain the "why." This is synthesis, not invention.
- If a fact names a specific prior state (e.g. "migrated_from X"), explicitly mention X when relevant to the question.
- Only say the information is insufficient if there is truly no relevant fact given — not if the answer requires connecting two related facts that ARE present.
- Keep the answer to 2-3 sentences.`;

export async function generateAnswer(question, context) {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    reasoning_effort: "low",
    messages: [
      { role: "system", content: ANSWER_PROMPT },
      { role: "user", content: `Facts:\n${context}\n\nQuestion: ${question}` },
    ],
  });

  return {
    answer: response.choices[0].message.content,
    usage: response.usage,
  };
}