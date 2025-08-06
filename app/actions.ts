"use server";

import {
  generateRegexFromDescription,
  generateRegexFromDescriptionWithRetry,
  analyzeRegexPattern,
  generateRegexFromExamples,
  suggestRegexFix,
  generateTestCases,
  generateRegexFromTestCases,
  type RegexGeneration,
  type RegexAnalysis,
  type TestCasesGeneration,
  type StepByStepResult,
} from "@/lib/ai-service";

export async function generateRegexAction(description: string): Promise<RegexGeneration> {
  if (!description.trim()) {
    throw new Error("Description is required");
  }

  return await generateRegexFromDescription(description);
}

export async function generateRegexWithRetryAction(description: string) {
  if (!description.trim()) {
    throw new Error("Description is required");
  }

  return await generateRegexFromDescriptionWithRetry(description, 3);
}

export async function analyzeRegexAction(pattern: string): Promise<RegexAnalysis> {
  if (!pattern.trim()) {
    throw new Error("Pattern is required");
  }

  return await analyzeRegexPattern(pattern);
}

export async function generateFromExamplesAction(
  examples: Array<{ input: string; output: string }>
): Promise<RegexGeneration> {
  if (examples.length === 0) {
    throw new Error("At least one example is required");
  }

  const validExamples = examples.filter(ex => ex.input.trim() && ex.output.trim());
  if (validExamples.length === 0) {
    throw new Error("Valid examples are required");
  }

  return await generateRegexFromExamples(validExamples);
}

export async function suggestFixAction(pattern: string, error: string): Promise<string> {
  if (!pattern.trim()) {
    throw new Error("Pattern is required");
  }

  return await suggestRegexFix(pattern, error);
}

// Step-by-step generation actions
export async function generateTestCasesAction(description: string): Promise<TestCasesGeneration> {
  if (!description.trim()) {
    throw new Error("Description is required");
  }

  return await generateTestCases(description);
}

export async function generateRegexFromTestCasesAction(
  description: string,
  testCases: Array<{ text: string; shouldMatch: boolean }>,
  previousAttempt?: { regex: string; failures: string[] }
): Promise<StepByStepResult> {
  if (!description.trim()) {
    throw new Error("Description is required");
  }

  if (!testCases || testCases.length === 0) {
    throw new Error("Test cases are required");
  }

  return await generateRegexFromTestCases(description, testCases, previousAttempt);
}
