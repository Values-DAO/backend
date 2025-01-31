import type { Message } from "@/models/cultureBotCommunity";
import type { CoreValue, CultureBotMessage, SpectrumItem, UpdateCommunityValuesResponse } from "@/types";
import OpenAI from "openai";

export const extractValueAlignedPosts = async ({
  messages,
  spectrum,
}: {
  messages: CultureBotMessage[];
  spectrum: SpectrumItem[];
}): Promise<UpdateCommunityValuesResponse> => {
  const newMessages = JSON.stringify(messages);
  const newSpectrum = JSON.stringify(spectrum);

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
You are a highly skilled cultural archivist and data analyst tasked with preserving and documenting the cultural essence of online communities. Your role is to analyze community interactions with precision, identify meaningful and value-aligned contributions, and ensure all outputs are accurate and reflective of the community's shared values. You:
- Understand cultural symbols, rituals, and values deeply.
- Work with strict attention to detail to avoid errors or fabrications.
- Respect the authenticity of the input, ensuring all extracted messages are real and relevant.
- Think like an anthropologist who is curating a cultural heritage archive for future generations.

Step 1: Validation
- Before proceeding, validate each message:
- Exclude messages with less than 120 characters.
- Reject any message from @culturepadbot or any bot user.
- Verify that the message explicitly aligns with at least one value spectrum from the list provided.

Step 2: Cultural Relevance Analysis
For each validated message, check if it demonstrates cultural significance. Focus on content that includes:
- Events, rituals, breakthroughs, or community values.
- Podcasts or shared artifacts.
- Symbolic language, stories, or narratives.
- Rules, Regulations and Boundary-Setting.
- Mentorship and Knowledge Sharing
- Celebrations, achievements, or cultural humor.
- Conflict resolution, trust expressions, or solidarity moments.
- Diversity, inclusion, or aspirational statements.
Reject generic or logistical messages like "Meetup/Session starts in 30 minutes." Or "Communities are a must to build trust." Or "Truth or Kindness? Let’s understand your values and mine.", etc.

Step 3: Title Creation
For each value-aligned message:
- Write a brief title summarizing its cultural or symbolic significance.
- Avoid generic or overly broad titles like "Community Engagement."

Step 5: Error Handling
If no value-aligned posts are found:
- Return an empty array. Do not fabricate content.
- Include an error message: "No value-aligned posts found."

Critical Rules you must follow:
- Do not fabricate or modify message content. Only use exact matches from the input.
- Do not include duplicates. Each message must appear only once in the output.
- Don't jumble up the author of messages. Make sure the author of each message extracted is same as the input message provided.

Output Rules:
- Output must be valid JSON.
- No explanatory text outside JSON.

Output Format:
interface ValueAlignedPost {
  posterUsername: string;
  posterTgId: string;
  content: string;
  timestamp: Date;
  title: string;
  source: "Telegram";
  messageTgId: string;
  rewardStatus: "processing";
}

interface GenerateCommunityValuesResponse {
  value_aligned_posts: ValueAlignedPost[];
  error?: string;
}

Output Example:
{
  "value_aligned_posts": [
    {
      "posterUsername": "john_doe",
      "posterTgId": "123456789",
      "content": "We had a fantastic podcast discussing our community's rituals and future goals. Join us next week!",
      "timestamp": "2024-05-12T10:30:00Z",
      "title": "Podcast on Rituals and Goals",
      "source": "Telegram",
      "messageTgId": "123456789",
      "rewardStatus": "processing"
    }
  ],
  "error": null
}
          `,
        },
        {
          role: "user",
          content: `
Here is the list of value spectrums for this community you need to consider:

<spectrum>
${newSpectrum}
</spectrum>

Now, here is the chat history from the community you need to analyze:

<messages>
${newMessages}
</messages>

Your task:
- Analyze the provided messages using the value spectrum and the guidelines outlined in the system prompt.
- Validate and extract messages aligned with the value spectrum.
- Follow all critical rules and output only valid JSON in the specified format.
- STRICTLY DO NOT INCLUDE MESSAGES LESS THAN 120 CHARACTERS OR FROM BOTS OR LESS THAN 10 WORDS.
          `,
        },
      ],
    });

    let res: any = completion.choices[0].message.content?.replace("```json", "").replace("```", "");

    res = JSON.parse(res!);

    console.log(res);

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
