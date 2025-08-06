import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://regex-generator-tester.vercel.app",
    "X-Title": "Regex Generator Tester",
  },
});

// Helper function to safely parse AI JSON responses
function parseAIResponse(content: string): any {
  if (!content) throw new Error("No response from AI");

  let cleanedContent = content.trim();

  // Remove markdown code blocks if present
  if (cleanedContent.startsWith("```json")) {
    cleanedContent = cleanedContent.replace(/^```json\s*/, "").replace(/\s*```[\s\S]*$/, "");
  } else if (cleanedContent.startsWith("```")) {
    cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/\s*```[\s\S]*$/, "");
  }

  // Extract just the JSON part if there's additional text after
  const jsonStart = cleanedContent.indexOf("{");
  const jsonEnd = cleanedContent.lastIndexOf("}");

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(cleanedContent);
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    console.error("Raw content:", content);
    console.error("Cleaned content:", cleanedContent);
    throw new Error("AI returned invalid JSON format");
  }
}

export interface RegexAnalysis {
  explanation: string;
  components: Array<{ part: string; description: string; color: string }>;
  complexity: "Simple" | "Moderate" | "Complex";
  suggestions: string[];
}

export interface RegexGeneration {
  regex: string;
  explanation: string;
  testCases: Array<{
    text: string;
    isValid: boolean;
    actualResult?: boolean;
  }>;
  confidence: number;
}

export interface GenerationStep {
  step: number;
  regex: string;
  explanation: string;
  testCases: Array<{
    text: string;
    isValid: boolean;
    actualResult?: boolean;
  }>;
  confidence: number;
  failedTests: number;
  status: "success" | "failed" | "retrying";
}

// Step-by-step generation interfaces
export interface TestCasesGeneration {
  testCases: Array<{
    text: string;
    isValid: boolean;
  }>;
  explanation: string;
}

export interface StepByStepResult {
  regex: string;
  explanation: string;
  testResults: Array<{
    text: string;
    isValid: boolean;
    actualResult: boolean;
    passed: boolean;
  }>;
  confidence: number;
  allTestsPassed: boolean;
}

// Step 1: Generate test cases from description
export async function generateTestCases(description: string): Promise<TestCasesGeneration> {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a regex expert. Generate comprehensive test cases for a regex pattern based on a natural language description.

           Return a JSON object with:
           - testCases: array of {text, isValid} objects (4 valid, 4 invalid examples)
           - explanation: brief explanation of what the test cases cover

           For test cases, include:
           - Basic valid examples that should match
           - Edge cases that should match
           - Common invalid variations that should NOT match
           - Boundary cases that test limits
           
           CRITICAL RULES:
           - Keep test case text under 100 characters each
           - Use realistic, practical examples
           - Avoid extremely long numbers or repetitive patterns
           - Ensure all text values are properly escaped for JSON
           - Make test cases diverse and meaningful`,
        },
        {
          role: "user",
          content: `Generate test cases for: ${description}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");
    const result = parseAIResponse(content);

    // Validate the result structure
    if (!result.testCases || !Array.isArray(result.testCases)) {
      throw new Error("AI response missing testCases array");
    }

    if (!result.explanation || typeof result.explanation !== "string") {
      throw new Error("AI response missing explanation");
    }

    // Filter out test cases that are too long or problematic
    const validTestCases = result.testCases.filter((testCase: any) => {
      if (!testCase.text || typeof testCase.text !== "string") return false;
      if (typeof testCase.isValid !== "boolean") return false;
      if (testCase.text.length > 100) return false; // Skip extremely long test cases
      return true;
    });

    if (validTestCases.length < 4) {
      throw new Error("Not enough valid test cases generated");
    }

    return {
      ...result,
      testCases: validTestCases.slice(0, 8), // Limit to 8 test cases max
    };
  } catch (error) {
    console.error("AI test case generation error:", error);
    throw new Error("Failed to generate test cases");
  }
}

// Step 2: Generate regex from description and test cases
export async function generateRegexFromTestCases(
  description: string,
  testCases: Array<{ text: string; shouldMatch: boolean }>,
  previousAttempt?: { regex: string; failures: string[] }
): Promise<StepByStepResult> {
  try {
    const contextMessage = previousAttempt
      ? `\n\nPREVIOUS ATTEMPT FAILED:
Previous regex: "${previousAttempt.regex}"
Failed test cases:
${previousAttempt.failures.join("\n")}

CRITICAL: Analyze why the previous regex failed and create an improved version that specifically addresses these failures.`
      : "";

    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: `You are an expert regex engineer with 20+ years of experience. Your task is to create a precise, efficient regex pattern that correctly matches or rejects ALL provided test cases.

CRITICAL REQUIREMENTS:
1. **Perfect Accuracy**: The regex MUST pass ALL test cases exactly as specified
2. **JavaScript Compatibility**: Use only JavaScript-compatible regex syntax
3. **Proper Escaping**: Escape all special characters correctly for JavaScript
4. **Efficiency**: Prefer non-capturing groups (?:) over capturing groups when possible
5. **Clarity**: Use word boundaries (\\b) when appropriate to avoid partial matches
6. **Robustness**: Handle edge cases and ensure the pattern is practical for real-world use
7. **Proper JSON**: Return a JSON object with the regex, explanation, and confidence, no other text or comments

ANALYSIS APPROACH:
1. First, analyze the pattern described: "${description}"
2. Examine each test case carefully:
${testCases
  .map((tc, i) => `   ${i + 1}. "${tc.text}" - ${tc.shouldMatch ? "SHOULD MATCH" : "SHOULD NOT MATCH"}`)
  .join("\n")}
3. Identify the common patterns and constraints
4. Design a regex that captures the essence while being precise

REGEX DESIGN PRINCIPLES:
- Use anchors (^, $) when you need to match the entire string
- Use word boundaries (\\b) for word-based patterns
- Use character classes [a-z] instead of alternation (a|b|c) when possible
- Use quantifiers (*, +, ?, {n,m}) appropriately
- Escape special regex characters: . * + ? ^ $ { } ( ) [ ] \\ | /
- Use non-capturing groups (?:...) for grouping without capturing

${contextMessage}

RESPONSE FORMAT:
Return a JSON object with:
- "regex": The complete regex pattern (properly escaped for JavaScript)
- "explanation": Clear explanation of how the regex works, breaking down each part
- "confidence": Your confidence level (0-100) based on how well you think it will work

EXAMPLE OUTPUT:
{
  "regex": "\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b",
  "explanation": "This regex matches email addresses by requiring: word boundary, local part with alphanumeric and common email characters, @ symbol, domain with alphanumeric and dots, TLD of 2+ letters, word boundary",
  "confidence": 95
}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    console.log("RAAAAAAAAAAAAAAAAAAAAAAW: ", content);

    const result = parseAIResponse(content);

    // Test the generated regex against the test cases
    const testResults = [];
    let allTestsPassed = true;

    try {
      const regex = new RegExp(result.regex);

      for (const testCase of testCases) {
        const actualResult = regex.test(testCase.text);
        const passed = testCase.shouldMatch === actualResult;

        if (!passed) {
          allTestsPassed = false;
        }

        testResults.push({
          text: testCase.text,
          isValid: testCase.shouldMatch,
          actualResult,
          passed,
        });
      }
    } catch (regexError) {
      console.warn("Invalid regex generated:", result.regex, regexError);
      allTestsPassed = false;

      // Mark all tests as failed
      for (const testCase of testCases) {
        testResults.push({
          text: testCase.text,
          isValid: testCase.shouldMatch,
          actualResult: false,
          passed: false,
        });
      }
    }

    return {
      regex: result.regex,
      explanation: result.explanation,
      testResults,
      confidence: result.confidence,
      allTestsPassed,
    };
  } catch (error) {
    console.error("AI regex generation error:", error);
    throw new Error("Failed to generate regex");
  }
}

// Legacy function for backward compatibility
export async function generateRegexFromDescriptionWithRetry(
  description: string,
  maxRetries: number = 3
): Promise<{ steps: GenerationStep[]; finalResult: RegexGeneration }> {
  // For now, just use the old single-step approach
  const result = await generateRegexFromDescription(description);
  return {
    steps: [
      {
        step: 1,
        regex: result.regex,
        explanation: result.explanation,
        testCases: result.testCases,
        confidence: result.confidence,
        failedTests: 0,
        status: "success" as const,
      },
    ],
    finalResult: result,
  };
}

export async function generateRegexFromDescription(description: string): Promise<RegexGeneration> {
  const { finalResult } = await generateRegexFromDescriptionWithRetry(description, 1);
  return finalResult;
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
    const result = parseAIResponse(content);
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
    const result = parseAIResponse(content);

    // Validate test cases against the generated regex
    if (result.testCases && Array.isArray(result.testCases)) {
      try {
        const regex = new RegExp(result.regex);
        result.testCases = result.testCases.map((testCase: { text: string; isValid: boolean }) => ({
          ...testCase,
          actualResult: regex.test(testCase.text),
        }));
      } catch (regexError) {
        console.warn("Invalid regex generated:", result.regex, regexError);
        result.testCases = result.testCases.map((testCase: { text: string; isValid: boolean }) => ({
          ...testCase,
          actualResult: false,
        }));
      }
    }

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
