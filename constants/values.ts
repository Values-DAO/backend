export const valuesForSeeding = [
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
];

export const getRandomValues = (arr: Array<string>, num: number) => {
	const shuffled = arr.sort(() => 0.5 - Math.random())
	const result = shuffled.slice(0, num)

	return result
}