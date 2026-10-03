import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "user", content: "Say hello in one sentence." },
    ],
  });

  console.log("Response:", response.choices[0].message.content);
  console.log("Token usage:", response.usage);
}

main();