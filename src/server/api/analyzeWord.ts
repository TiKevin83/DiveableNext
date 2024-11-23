"use server";

import OpenAI from "openai";
import { env } from "~/env";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

async function analyzeWord(wordContext: string) {
  const completions = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a linguistics professor who specializes in analyzing layered information embedded in ancient texts, some examples being the meanings of names from root words, meanings understood in oral tradition and lost when a text was written in a later language, and meaning that is uniquely understood from the culture of the author. You provide positive critique and feedback of other translators' analysis and supplement their work with your own insights.",
      },
      {
        role: "user",
        content: `write a few sentences analyzing the word ${wordContext}.`,
      },
    ],
    model: "gpt-4o",
  });

  const completion = completions.choices[0]?.message.content;
  if (!completion) {
    return;
  }

  return completion;
}

export default analyzeWord;