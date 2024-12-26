import type { Message } from "@/models/cultureBotCommunity";
import type { CoreValue, CultureBotMessage, SpectrumItem, UpdateCommunityValuesResponse } from "@/types";
import OpenAI from "openai";

export const extractValueAlignedPosts = async ({
  messages,
}: {
  messages: CultureBotMessage[];
}): Promise<UpdateCommunityValuesResponse> => {
  const newMessages = JSON.stringify(messages);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `
Here is the chat history from a community you need to analyze:

<messages>
${newMessages}
</messages>

Your task is to analyze this data and provide output in the following key area:

1. VALUE-ALIGNED POSTS
-	Identify messages that align with the value spectrums of the community.
- Each message must include:
	- Poster’s username
	- Message content
	- Timestamp
	- A brief title that shows the culture and symbolism of the post
	- Source (always “Telegram”) 
- Do not modify or fabricate any message content
- If no posts clearly demonstrate values, return empty array
- Make sure to find culturally significant posts containing an event, ritual, community value, or other important cultural element.
- Output format is provided below (value_aligned_posts)

Output must be valid JSON matching this structure:

enum SourceEnum {
	Twitter = "Twitter",
	Youtube = "Youtube",
	Farcaster = "Farcaster",
	Telegram = "Telegram",
}

interface ValueAlignedPost {
	posterUsername: string;
	content: string;
	timestamp: Date;
	title: string;
	source: SourceEnum;
}

interface GenerateCommunityValuesResponse {
	value_aligned_posts: ValueAlignedPost[];
	error?: string;
}

CRITICAL RULES:
- Output must be valid JSON
- Include value_aligned_posts 
- Use only actual usernames and message content, not fabricated examples
- No explanatory text outside JSON
- No empty or null fields
`,
        },
      ],
    });

    let res: any = completion.choices[0].message.content?.replace("```json", "").replace("```", "");

    res = JSON.parse(res!);
    
    return {
      value_aligned_posts: res.value_aligned_posts,
    };
  } catch (error) {
    console.error("Error updating community values:", error);
    return {
      error: `Error updating community values: ${error}`,
      value_aligned_posts: [],
    };
  }
};
