import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: "Find me a diesel vehicle in Hyderabad under 20 lakh.",
  });

  console.log(response.output_text);
}

main().catch(console.error);
