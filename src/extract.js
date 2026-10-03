import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const EXTRACTION_PROMPT = `You extract factual knowledge triples from text.

Given a piece of text, extract every clear factual relationship as a triple:
{"subject": "...", "subject_type": "...", "relation": "...", "object": "...", "object_type": "...", "confidence": 0.0-1.0}

Rules:
- subject and object must be SHORT entity names only (a project, technology, person, event) — never a phrase, never multiple entities joined together, never qualifiers like "for caching" or "to X". Use natural spacing ("relational queries", not "relational_queries").
- subject_type and object_type must be one of: "Project", "Technology", "Person", "Event", "Concept", "Organization". Use "Concept" for abstract ideas/reasons (e.g. "caching", "relational queries") rather than inventing new types.
- relation MUST be exactly one of these values: uses, migrated_from, migrated_to, deployed_on, introduced, used_for, created_by, depends_on, replaces. Do not invent new relation types or synonyms — if none fits perfectly, pick the closest one from this list. For example, "created using Python" should use relation "uses", not "created_using".
- If a sentence describes a CHANGE from one thing to another (e.g. "migrated from X to Y", "switched from X to Y"), extract it as TWO separate triples: one "migrated_from" triple and one "migrated_to" triple — never combine X and Y into a single object.
- If a sentence gives a reason or purpose (e.g. "added Redis for caching", "because relational queries were difficult"), put the reason in a SEPARATE triple with relation "used_for", not folded into the object, and not as a new relation type.
- Only extract facts explicitly stated or clearly implied. Do not invent information.
- confidence should reflect how directly the text states the fact (1.0 = explicit statement, 0.6 = implied).

Examples:
Text: "migrated Alpha from MongoDB to PostgreSQL"
Correct: [{"subject":"Alpha","subject_type":"Project","relation":"migrated_from","object":"MongoDB","object_type":"Technology","confidence":1.0}, {"subject":"Alpha","subject_type":"Project","relation":"migrated_to","object":"PostgreSQL","object_type":"Technology","confidence":1.0}]

Text: "Redis was added for caching"
Correct: [{"subject":"Alpha","subject_type":"Project","relation":"uses","object":"Redis","object_type":"Technology","confidence":1.0}, {"subject":"Redis","subject_type":"Technology","relation":"used_for","object":"caching","object_type":"Concept","confidence":1.0}]

Respond with ONLY a JSON object: {"triples": [...]}. No other text.`;

export async function extractTriples(text) {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    reasoning_effort: "low",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: text },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content);

  return {
    triples: parsed.triples || [],
    usage: response.usage,
  };
}