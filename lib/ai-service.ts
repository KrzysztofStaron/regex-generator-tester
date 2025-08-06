import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://regex-generator-tester.vercel.app",
    "X-Title": "Regex Generator Tester",
  },
});

export interface RegexAnalysis {
  explanation: string;
  components: Array<{ part: string; description: string; color: string }>;
  complexity: "Simple" | "Moderate" | "Complex";
  suggestions: string[];
}

export interface RegexGeneration {
  regex: string;
  explanation: string;
  testCases: Array<{ text: string; isValid: boolean }>;
  confidence: number;
}

export async function generateRegexFromDescription(description: string): Promise<RegexGeneration> {
  try {
    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are a regex expert. Generate regex patterns based on natural language descriptions. 
          Return a JSON object with:
          - regex: the regex pattern (escaped for JavaScript)
          - explanation: plain English explanation
          - testCases: array of {text, isValid} objects (3 valid, 3 invalid examples)
          - confidence: number 0-100
          
          Focus on practical, commonly used patterns.`,
        },
        {
          role: "user",
          content: `Generate a regex for: ${description}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate regex");
  }
}

export async function analyzeRegexPattern(pattern: string): Promise<RegexAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are a regex expert. Analyze regex patterns and provide detailed explanations.
          Return a JSON object with:
          - explanation: plain English explanation of what the regex matches
          - components: array of {part, description, color} objects for syntax highlighting
          - complexity: "Simple", "Moderate", or "Complex"
          - suggestions: array of improvement suggestions
          
          Use these colors for syntax highlighting:
          - Literals: #aaa (neutral gray)
          - Character classes: #3b82f6 (blue)
          - Quantifiers: #f59e0b (orange)
          - Groups: #8b5cf6 (purple)
          - Assertions: #f43f5e (red)
          - Alternation: #10b981 (green)
          - Escapes: #14b8a6 (teal)`,
        },
        {
          role: "user",
          content: `Analyze this regex pattern: ${pattern}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("AI analysis error:", error);
    throw new Error("Failed to analyze regex");
  }
}

export async function generateRegexFromExamples(
  examples: Array<{ input: string; output: string }>
): Promise<RegexGeneration> {
  try {
    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are a regex expert. Generate regex patterns from input-output examples.
          Return a JSON object with:
          - regex: the regex pattern (escaped for JavaScript)
          - explanation: plain English explanation
          - testCases: array of {text, isValid} objects
          - confidence: number 0-100
          
          Analyze the pattern between input and output to create a regex that extracts the output from similar inputs.`,
        },
        {
          role: "user",
          content: `Generate a regex from these examples:
          ${examples.map(ex => `Input: "${ex.input}" → Output: "${ex.output}"`).join("\n")}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate regex from examples");
  }
}

export async function suggestRegexFix(pattern: string, error: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are a regex expert. Fix invalid regex patterns and explain the issue.
          Return only the corrected regex pattern as a string.`,
        },
        {
          role: "user",
          content: `Fix this regex pattern: ${pattern}
          Error: ${error}`,
        },
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    return content.trim();
  } catch (error) {
    console.error("AI fix error:", error);
    throw new Error("Failed to suggest fix");
  }
}
