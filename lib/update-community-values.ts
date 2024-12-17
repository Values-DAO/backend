import type { Message } from "@/models/cultureBotCommunity";
import type { CoreValue, CultureBotMessage, SpectrumItem, UpdateCommunityValuesResponse } from "@/types";
import OpenAI from "openai";

export const updateCommunityValues = async ({
  messages,
  core_values,
  spectrum,
}: {
  messages: CultureBotMessage[];
  core_values: CoreValue,
  spectrum: SpectrumItem[],
}): Promise<UpdateCommunityValuesResponse> => {
  const newMessages = JSON.stringify(messages);
  const existingCoreValues = JSON.stringify(core_values);
  const existingSpectrum = JSON.stringify(spectrum);

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
You are a value analyst tasked with analyzing a community’s values based on their chat history. Your task is to analyze the provided new chat history, compare it with the existing core values and spectra, and update these fields accordingly. Additionally, identify recent top posters and posts that explicitly demonstrate core values. Finally, provide an overall short description of where the community’s culture is moving based on changes.
          
First, here is the fixed set of human values you should consider:

<values>
[
    "Acceptance", "Accomplishment", "Accountability", "Accuracy", "Achievement",
    "Adaptability", "Alertness", "Altruism", "Ambition", "Amusement", "Assertiveness",
    "Attentive", "Authenticity", "Awareness", "Balance", "Beauty", "Benevolence",
    "Boldness", "Bravery", "Brilliance", "Calm", "Candor", "Capable", "Careful",
    "Certainty", "Challenge", "Charity", "Cleanliness", "Clear", "Clever", "Comfort",
    "Commitment", "Common sense", "Communication", "Community", "Compassion",
    "Competence", "Concentration", "Confidence", "Connection", "Consciousness",
    "Consistency", "Contentment", "Contribution", "Control", "Conviction", "Cooperation",
    "Courage", "Courtesy", "Creation", "Creativity", "Credibility", "Curiosity", "Decisive",
    "Decisiveness", "Dedication", "Dependability", "Determination", "Development",
    "Devotion", "Dignity", "Diligence", "Discipline", "Discovery", "Diversity", "Drive",
    "Effectiveness", "Efficiency", "Empathy", "Empower", "Endurance", "Energy",
    "Enjoyment", "Enthusiasm", "Equality", "Ethical", "Excellence", "Experience",
    "Exploration", "Expressive", "Fairness", "Family", "Famous", "Fearless", "Feelings",
    "Ferocious", "Fidelity", "Flexibility", "Focus", "Foresight", "Fortitude", "Freedom",
    "Friendliness", "Friendship", "Fun", "Generosity", "Genius", "Giving", "Goodness",
    "Grace", "Gratitude", "Greatness", "Growth", "Happiness", "Hard work", "Harmony",
    "Health", "Honesty", "Honor", "Hope", "Humility", "Imagination", "Improvement",
    "Independence", "Individuality", "Influence", "Inclusivity", "Innovation", "Inquisitive",
    "Insightful", "Inspiration", "Integrity", "Intelligence", "Intensity", "Intuitive",
    "Irreverent", "Joy", "Joyfulness", "Justice", "Kindness", "Knowledge", "Lawful",
    "Leadership", "Learning", "Liberty", "Logic", "Love", "Loyalty", "Magnanimity",
    "Mastery", "Maturity", "Meaning", "Mindfulness", "Moderation", "Modesty",
    "Motivation", "Open-mindedness", "Openness", "Optimism", "Order", "Organization",
    "Originality", "Passion", "Patience", "Peace", "Perseverance", "Performance",
    "Persistence", "Playfulness", "Poise", "Politeness", "Potential", "Power", "Pragmatism",
    "Precision", "Present", "Proactivity", "Productivity", "Professionalism", "Prosperity",
    "Prudence", "Punctuality", "Purpose", "Purity", "Quality", "Quietness", "Realism",
    "Reason", "Recognition", "Recreation", "Reflection", "Reflective", "Reliability",
    "Resilience", "Resourcefulness", "Respect", "Respectfulness", "Responsibility",
    "Restraint", "Results-oriented", "Reverence", "Righteousness", "Rigor", "Risk",
    "Satisfaction", "Security", "Self-control", "Self-improvement", "Self-reliance",
    "Selfless", "Sensitivity", "Serenity", "Service", "Sharing", "Significance", "Silence",
    "Simplicity", "Sincerity", "Skill", "Skillfulness", "Smart", "Solitude", "Solidarity",
    "Spirit", "Spirituality", "Spontaneity", "Spontaneous", "Stability", "Status",
    "Stewardship", "Strength", "Structure", "Success", "Support", "Supportiveness",
    "Surprise", "Sustainability", "Sympathy", "Talent", "Teamwork", "Temperance",
    "Thankful", "Thorough", "Thoughtful", "Thoughtfulness", "Thrift", "Timeliness",
    "Tolerance", "Toughness", "Traditional", "Tranquility", "Transparency", "Trust",
    "Trustworthy", "Truth", "Understanding", "Uniqueness", "Unity", "Valor", "Victory",
    "Vigor", "Vision", "Vitality", "Volunteering", "Warmth", "Watchfulness", "Wealth",
    "Welcoming", "Willpower", "Winning", "Wisdom", "Wonder", "Zeal", "Zest"
]
</values>

Now, here is the chat history from the community you need to analyze:

<messages>
${newMessages}
</messages>

<existing_core_values>
${existingCoreValues}
</existing_core_values>

<existing_spectrum>
${existingSpectrum}
</existing_spectrum>

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
