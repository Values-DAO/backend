import type { CultureBotMessage, GenerateCommunityValuesResponse } from "@/types";
import OpenAI from "openai";

export const generateCommunityValues = async (
	messages: CultureBotMessage[]
): Promise<GenerateCommunityValuesResponse> => {
	const content = JSON.stringify(messages);
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
You are a value analyst tasked with predicting a community's values based on their chat history. Your task is to thoroughly analyze the chat history provided, identify the community's core values, and rate its alignment with predefined spectra. Your output should strictly follow the JSON format provided.

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
${content}
</messages>

Your task is to analyze this data and provide output in 2 key areas:

1. CORE VALUES ANALYSIS
- Read through each message carefully
- Identify values from the provided list that appear in messages
- Assign a weight (1-100) to each value based on frequency and emphasis
- Output format is shown below (core_values)

2. SPECTRUM ANALYSIS
Rate the community on these spectrums (1-100, where 1 = left term, 100 = right term):
- Individualism vs Collectivism
- Capitalism vs Communism
- Holistic vs Reductive
- Internal-focused vs External-focused
- More control vs Less control
- People vs Systems
- Asceticism vs Hedonism
- Past-oriented vs Future-oriented
- Highly trusting vs Highly cynical
- Process-oriented vs Outcome-oriented
- High risk tolerance vs Low risk tolerance
- Tribalism vs Universalism
- Idealism vs Utilitarianism
- Global vs Local
- Specific vs Abstract

Output must be valid JSON matching this structure:
interface CoreValue {
	[key: string]: number;
}

interface SpectrumItem {
	name: string;
	description: string;
	score: number;
}

interface GenerateCommunityValuesResponse {
	core_values: CoreValue;
	spectrum: SpectrumItem[];
	error?: string;
}

CRITICAL RULES:
- Output must be valid JSON
- Include all sections (core_values, spectrum)
- Use only actual usernames and message content, not fabricated examples
- No explanatory text outside JSON
- No empty or null fields
`,
        },
      ],
    });

		let res: any = completion.choices[0].message.content
			?.replace("```json", "")
			.replace("```", "");

		res = JSON.parse(res!);
		
		return {
			core_values: res.core_values,
			spectrum: res.spectrum,
		};
	} catch (error) {
		console.error("Error generating community values:", error);
		return {
      error: `Error generating community values: ${error}`,
      core_values: {},
      spectrum: [],
    };
	}
};