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

export async function generateRegexFromDescriptionWithRetry(
  description: string,
  maxRetries: number = 3
): Promise<{ steps: GenerationStep[]; finalResult: RegexGeneration }> {
  const steps: GenerationStep[] = [];
  let currentStep = 1;
  let previousFailures: string[] = [];

  while (currentStep <= maxRetries) {
    try {
      const contextMessage =
        currentStep > 1
          ? `Previous attempts failed. Problems encountered:\n${previousFailures.join(
              "\n"
            )}\n\nImprove the regex to address these issues.`
          : "";

      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: `You are a regex expert. Generate regex patterns based on natural language descriptions. 
            ${contextMessage}
            Return a JSON object with:
            - regex: the regex pattern (escaped for JavaScript)
            - explanation: plain English explanation
            - testCases: array of {text, isValid} objects (4 valid, 4 invalid examples that test edge cases)
            - confidence: number 0-100
            
            For test cases, include:
            - Basic valid examples
            - Edge cases that should match
            - Common invalid variations
            - Boundary cases
            Focus on practical, commonly used patterns. Make sure the regex actually works with your test cases.`,
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

      // Validate test cases against the generated regex
      let failedTests = 0;
      let failureReasons: string[] = [];

      if (result.testCases && Array.isArray(result.testCases)) {
        try {
          const regex = new RegExp(result.regex);
          result.testCases = result.testCases.map(testCase => {
            const actualResult = regex.test(testCase.text);
            const isCorrect = testCase.isValid === actualResult;
            if (!isCorrect) {
              failedTests++;
              failureReasons.push(
                `Expected "${testCase.text}" to ${testCase.isValid ? "match" : "not match"} but it ${
                  actualResult ? "matched" : "did not match"
                }`
              );
            }
            return {
              ...testCase,
              actualResult,
              isValid: testCase.isValid, // Keep original expectation
            };
          });
        } catch (regexError) {
          console.warn("Invalid regex generated:", result.regex, regexError);
          failureReasons.push(`Invalid regex syntax: ${regexError.message}`);
          result.testCases = result.testCases.map(testCase => ({
            ...testCase,
            actualResult: false,
          }));
          failedTests = result.testCases.length;
        }
      }

      // Add failure reasons to context for next retry
      if (failureReasons.length > 0) {
        previousFailures = previousFailures.concat(failureReasons);
      }

      const step: GenerationStep = {
        step: currentStep,
        regex: result.regex,
        explanation: result.explanation,
        testCases: result.testCases,
        confidence: result.confidence,
        failedTests,
        status: failedTests === 0 ? "success" : currentStep === maxRetries ? "failed" : "retrying",
      };

      steps.push(step);

      // If all tests pass or we've reached max retries, return the result
      if (failedTests === 0 || currentStep === maxRetries) {
        return { steps, finalResult: result };
      }

      currentStep++;
    } catch (error) {
      console.error(`AI generation error on step ${currentStep}:`, error);
      const errorStep: GenerationStep = {
        step: currentStep,
        regex: "",
        explanation: "Failed to generate regex",
        testCases: [],
        confidence: 0,
        failedTests: 0,
        status: "failed",
      };
      steps.push(errorStep);
      throw new Error("Failed to generate regex");
    }
  }

  throw new Error("Failed to generate regex after maximum retries");
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

    // Validate test cases against the generated regex
    if (result.testCases && Array.isArray(result.testCases)) {
      try {
        const regex = new RegExp(result.regex);
        result.testCases = result.testCases.map(testCase => ({
          ...testCase,
          actualResult: regex.test(testCase.text),
        }));
      } catch (regexError) {
        console.warn("Invalid regex generated:", result.regex, regexError);
        result.testCases = result.testCases.map(testCase => ({
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
