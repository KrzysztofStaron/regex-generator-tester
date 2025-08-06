"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Zap,
  CheckCircle,
  XCircle,
  Plus,
  RotateCcw,
  X,
  Sparkles,
  PlayCircle,
  ArrowRight,
  Edit3,
  Eye,
  EyeOff,
  Info,
  Layers,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { RegexHighlighter } from "@/components/regex-highlighter";
import { generateTestCasesAction, generateRegexFromTestCasesAction } from "@/app/actions";

// Current workflow step
type WorkflowStep = "description" | "test-cases" | "regex-generation" | "results";

interface TestCase {
  id: string;
  text: string;
  isValid: boolean;
  actualResult?: boolean;
  passed?: boolean;
}

interface GenerateFromTextProps {
  state: {
    description: string;
    generatedRegex: string;
    explanation: string;
    testCases: TestCase[];
    isGenerating: boolean;
    generationSteps: any[];
    // Step-by-step workflow state
    currentStep?: "description" | "test-cases" | "regex-generation" | "results";
    isGeneratingTestCases?: boolean;
    isGeneratingRegex?: boolean;
    generatedTestCases?: TestCase[];
    testCasesExplanation?: string;
    finalRegex?: string;
    regexExplanation?: string;
    testResults?: TestCase[];
    confidence?: number;
    allTestsPassed?: boolean;
    previousAttempt?: { regex: string; failures: string[] } | undefined;
    breakdown?: {
      purpose: string;
      complexity: "Beginner" | "Intermediate" | "Advanced";
      parts: Array<{
        text: string;
        type: string;
        description: string;
        example: string;
        color: string;
      }>;
    };
  };
  updateState: (updates: Partial<GenerateFromTextProps["state"]>) => void;
}

export function GenerateFromText({ state, updateState }: GenerateFromTextProps) {
  const {
    description,
    currentStep = "description",
    isGeneratingTestCases = false,
    isGeneratingRegex = false,
    generatedTestCases = [],
    testCasesExplanation = "",
    finalRegex = "",
    regexExplanation = "",
    testResults = [],
    confidence = 0,
    allTestsPassed = false,
    previousAttempt = undefined,
    breakdown,
  } = state;

  const [showRegexBreakdown, setShowRegexBreakdown] = useState(false);

  const setDescription = (value: string) => updateState({ description: value });
  const setCurrentStep = (value: WorkflowStep) => updateState({ currentStep: value });
  const setIsGeneratingTestCases = (value: boolean) => updateState({ isGeneratingTestCases: value });
  const setIsGeneratingRegex = (value: boolean) => updateState({ isGeneratingRegex: value });
  const setGeneratedTestCases = (value: TestCase[]) => updateState({ generatedTestCases: value });
  const setTestCasesExplanation = (value: string) => updateState({ testCasesExplanation: value });
  const setFinalRegex = (value: string) => updateState({ finalRegex: value });
  const setRegexExplanation = (value: string) => updateState({ regexExplanation: value });
  const setTestResults = (value: TestCase[]) => updateState({ testResults: value });
  const setConfidence = (value: number) => updateState({ confidence: value });
  const setAllTestsPassed = (value: boolean) => updateState({ allTestsPassed: value });
  const setPreviousAttempt = (value: { regex: string; failures: string[] } | undefined) =>
    updateState({ previousAttempt: value });

  // Step 1: Generate test cases
  const generateTestCases = async () => {
    if (!description.trim()) return;

    setIsGeneratingTestCases(true);
    try {
      const result = await generateTestCasesAction(description);

      const testCasesWithIds = result.testCases.map((tc, index) => ({
        id: (index + 1).toString(),
        text: tc.text,
        isValid: tc.isValid,
      }));

      setGeneratedTestCases(testCasesWithIds);
      setTestCasesExplanation(result.explanation);
      setCurrentStep("test-cases");
      toast.success("Test cases generated! Review and approve them.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to generate test cases: ${errorMessage}`);
      console.error("Test case generation error:", error);
    } finally {
      setIsGeneratingTestCases(false);
    }
  };

  // Step 2: Generate regex from approved test cases
  const generateRegex = async () => {
    if (generatedTestCases.length === 0) return;

    setIsGeneratingRegex(true);
    try {
      const testCasesData = generatedTestCases.map(tc => ({
        text: tc.text,
        shouldMatch: tc.isValid,
      }));

      const result = await generateRegexFromTestCasesAction(description, testCasesData, previousAttempt);

      setFinalRegex(result.regex);
      setRegexExplanation(result.explanation);
      setConfidence(result.confidence);
      setAllTestsPassed(result.allTestsPassed);

      // Set breakdown if available from AI response
      if (result.breakdown) {
        updateState({ breakdown: result.breakdown });
      }

      // Convert test results to our format
      const resultsWithIds = result.testResults.map((tr, index) => ({
        id: (index + 1).toString(),
        text: tr.text,
        isValid: tr.isValid,
        actualResult: tr.actualResult,
        passed: tr.passed,
      }));

      setTestResults(resultsWithIds);
      setCurrentStep("results");

      if (result.allTestsPassed) {
        toast.success("Regex generated successfully! All tests passed.");
      } else {
        toast.warning("Regex generated but some tests failed. Review and retry if needed.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to generate regex: ${errorMessage}`);
      console.error("Regex generation error:", error);
    } finally {
      setIsGeneratingRegex(false);
    }
  };

  // Retry workflow - regenerate with context from failures
  const retryWorkflow = async () => {
    if (finalRegex && testResults.length > 0) {
      const failures = testResults
        .filter(tr => !tr.passed)
        .map(
          tr =>
            `Expected "${tr.text}" to ${tr.isValid ? "match" : "not match"} but it ${
              tr.actualResult ? "matched" : "did not match"
            }`
        );

      setPreviousAttempt({ regex: finalRegex, failures });

      // Immediately regenerate with the failure context
      setIsGeneratingRegex(true);
      try {
        const testCasesData = generatedTestCases.map(tc => ({
          text: tc.text,
          shouldMatch: tc.isValid,
        }));

        const result = await generateRegexFromTestCasesAction(description, testCasesData, {
          regex: finalRegex,
          failures,
        });

        setFinalRegex(result.regex);
        setRegexExplanation(result.explanation);
        setConfidence(result.confidence);
        setAllTestsPassed(result.allTestsPassed);

        // Set breakdown if available from AI response
        if (result.breakdown) {
          updateState({ breakdown: result.breakdown });
        }

        // Convert test results to our format
        const resultsWithIds = result.testResults.map((tr, index) => ({
          id: (index + 1).toString(),
          text: tr.text,
          isValid: tr.isValid,
          actualResult: tr.actualResult,
          passed: tr.passed,
        }));

        setTestResults(resultsWithIds);

        if (result.allTestsPassed) {
          toast.success("Retry successful! All tests now pass.");
        } else {
          toast.warning("Regex improved but some tests still fail.");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        toast.error(`Retry failed: ${errorMessage}`);
        console.error("Retry generation error:", error);
      } finally {
        setIsGeneratingRegex(false);
      }
    }
  };

  // Start over completely
  const startOver = () => {
    setCurrentStep("description");
    setGeneratedTestCases([]);
    setTestCasesExplanation("");
    setFinalRegex("");
    setRegexExplanation("");
    setTestResults([]);
    setConfidence(0);
    setAllTestsPassed(false);
    setPreviousAttempt(undefined);
    setDescription("");
  };

  // Edit test cases
  const editTestCase = (id: string, text: string) => {
    const updatedTestCases = generatedTestCases.map(tc => (tc.id === id ? { ...tc, text } : tc));
    setGeneratedTestCases(updatedTestCases);
  };

  const toggleTestValidity = (id: string) => {
    const updatedTestCases = generatedTestCases.map(tc => (tc.id === id ? { ...tc, isValid: !tc.isValid } : tc));
    setGeneratedTestCases(updatedTestCases);
  };

  const deleteTestCase = (id: string) => {
    const updatedTestCases = generatedTestCases.filter(tc => tc.id !== id);
    setGeneratedTestCases(updatedTestCases);
  };

  const addTestCase = (isValid: boolean) => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      text: "",
      isValid,
    };
    setGeneratedTestCases([...generatedTestCases, newTest]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalRegex);
    toast.success("Regex copied to clipboard!");
  };

  // Toggle breakdown display
  const toggleBreakdown = () => {
    setShowRegexBreakdown(!showRegexBreakdown);
  };

  // Legacy manual parsing function (fallback)
  const parseRegexPattern = (pattern: string) => {
    const parts = [];
    let i = 0;

    while (i < pattern.length) {
      const char = pattern[i];

      if (char === "\\" && i + 1 < pattern.length) {
        const nextChar = pattern[i + 1];
        let description = "";
        let example = "";

        switch (nextChar) {
          case "d":
            description = "Any digit";
            example = "0-9";
            break;
          case "w":
            description = "Any word character";
            example = "a-z, A-Z, 0-9, _";
            break;
          case "s":
            description = "Any whitespace";
            example = "space, tab, newline";
            break;
          case "D":
            description = "Any non-digit";
            example = "letters, symbols";
            break;
          case "W":
            description = "Any non-word character";
            example = "symbols, spaces";
            break;
          case "S":
            description = "Any non-whitespace";
            example = "letters, digits, symbols";
            break;
          case "n":
            description = "Newline character";
            example = "line break";
            break;
          case "t":
            description = "Tab character";
            example = "tab space";
            break;
          case ".":
            description = "Literal dot";
            example = ".";
            break;
          case "+":
            description = "Literal plus";
            example = "+";
            break;
          case "*":
            description = "Literal asterisk";
            example = "*";
            break;
          case "?":
            description = "Literal question mark";
            example = "?";
            break;
          case "[":
            description = "Literal opening bracket";
            example = "[";
            break;
          case "]":
            description = "Literal closing bracket";
            example = "]";
            break;
          case "(":
            description = "Literal opening parenthesis";
            example = "(";
            break;
          case ")":
            description = "Literal closing parenthesis";
            example = ")";
            break;
          case "{":
            description = "Literal opening brace";
            example = "{";
            break;
          case "}":
            description = "Literal closing brace";
            example = "}";
            break;
          case "^":
            description = "Literal caret";
            example = "^";
            break;
          case "$":
            description = "Literal dollar sign";
            example = "$";
            break;
          case "|":
            description = "Literal pipe";
            example = "|";
            break;
          case "/":
            description = "Literal forward slash";
            example = "/";
            break;
          case "\\":
            description = "Literal backslash";
            example = "\\";
            break;
          default:
            description = `Escaped character`;
            example = nextChar;
        }

        parts.push({
          text: `\\${nextChar}`,
          type: "escape",
          description,
          example,
          color: "text-purple-400",
        });
        i += 2;
      } else if (char === "[") {
        // Character class
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== "]") {
          j++;
        }
        if (j < pattern.length) {
          const content = pattern.slice(i + 1, j);
          let description = "Character class";
          let example = "";

          if (content.startsWith("^")) {
            description = "Negated character class";
            example = `Any character except: ${content.slice(1)}`;
          } else if (content.includes("-")) {
            description = "Character range";
            example = `Characters in range: ${content}`;
          } else {
            description = "Any of these characters";
            example = content;
          }

          parts.push({
            text: pattern.slice(i, j + 1),
            type: "charClass",
            description,
            example,
            color: "text-blue-400",
          });
          i = j + 1;
        } else {
          parts.push({
            text: char,
            type: "literal",
            description: "Literal character",
            example: char,
            color: "text-gray-400",
          });
          i++;
        }
      } else if (char === "(") {
        // Group
        let j = i + 1;
        let depth = 1;
        while (j < pattern.length && depth > 0) {
          if (pattern[j] === "(") depth++;
          if (pattern[j] === ")") depth--;
          j++;
        }
        if (depth === 0) {
          const content = pattern.slice(i + 1, j - 1);
          parts.push({
            text: pattern.slice(i, j),
            type: "group",
            description: "Capturing group",
            example: `Captures: ${content}`,
            color: "text-yellow-400",
          });
          i = j;
        } else {
          parts.push({
            text: char,
            type: "literal",
            description: "Literal character",
            example: char,
            color: "text-gray-400",
          });
          i++;
        }
      } else if (char === "+") {
        parts.push({
          text: char,
          type: "quantifier",
          description: "One or more",
          example: "Matches 1+ times",
          color: "text-green-400",
        });
        i++;
      } else if (char === "*") {
        parts.push({
          text: char,
          type: "quantifier",
          description: "Zero or more",
          example: "Matches 0+ times",
          color: "text-green-400",
        });
        i++;
      } else if (char === "?") {
        parts.push({
          text: char,
          type: "quantifier",
          description: "Zero or one",
          example: "Optional match",
          color: "text-green-400",
        });
        i++;
      } else if (char === "^") {
        parts.push({
          text: char,
          type: "anchor",
          description: "Start of string",
          example: "Beginning anchor",
          color: "text-red-400",
        });
        i++;
      } else if (char === "$") {
        parts.push({
          text: char,
          type: "anchor",
          description: "End of string",
          example: "Ending anchor",
          color: "text-red-400",
        });
        i++;
      } else if (char === ".") {
        parts.push({
          text: char,
          type: "wildcard",
          description: "Any character",
          example: "Matches any single character",
          color: "text-orange-400",
        });
        i++;
      } else if (char === "|") {
        parts.push({
          text: char,
          type: "alternation",
          description: "OR operator",
          example: "Matches either option",
          color: "text-pink-400",
        });
        i++;
      } else if (char === "{") {
        // Quantifier
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== "}") {
          j++;
        }
        if (j < pattern.length) {
          const content = pattern.slice(i + 1, j);
          let description = "Exact repetition";
          let example = "";

          if (content.includes(",")) {
            const [min, max] = content.split(",");
            if (max === "") {
              description = "Minimum repetition";
              example = `At least ${min} times`;
            } else {
              description = "Range repetition";
              example = `Between ${min} and ${max} times`;
            }
          } else {
            description = "Exact repetition";
            example = `Exactly ${content} times`;
          }

          parts.push({
            text: pattern.slice(i, j + 1),
            type: "quantifier",
            description,
            example,
            color: "text-green-400",
          });
          i = j + 1;
        } else {
          parts.push({
            text: char,
            type: "literal",
            description: "Literal character",
            example: char,
            color: "text-gray-400",
          });
          i++;
        }
      } else {
        // Literal character
        parts.push({
          text: char,
          type: "literal",
          description: "Literal character",
          example: `Matches "${char}"`,
          color: "text-gray-400",
        });
        i++;
      }
    }

    return parts;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Step-by-Step Regex Generation</h1>
        <p className="text-zinc-400">Follow the guided workflow to create perfect regex patterns</p>

        {/* Progress indicator */}
        <div className="mt-6 flex items-center gap-4">
          <div
            className={`flex items-center gap-2 cursor-pointer transition-colors hover:text-blue-300 ${
              currentStep === "description"
                ? "text-blue-400"
                : currentStep === "test-cases" || currentStep === "results"
                ? "text-green-400"
                : "text-zinc-400"
            }`}
            onClick={() => {
              // Can always go back to description
              setCurrentStep("description");
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors hover:opacity-80 ${
                currentStep === "description"
                  ? "bg-blue-500"
                  : currentStep === "test-cases" || currentStep === "results"
                  ? "bg-green-500"
                  : "bg-zinc-700"
              }`}
            >
              <span className="text-white font-bold">1</span>
            </div>
            <span>Describe Pattern</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500" />

          <div
            className={`flex items-center gap-2 transition-colors ${
              generatedTestCases.length > 0 ? "cursor-pointer hover:text-blue-300" : "cursor-not-allowed opacity-50"
            } ${
              currentStep === "test-cases"
                ? "text-blue-400"
                : currentStep === "results"
                ? "text-green-400"
                : generatedTestCases.length > 0
                ? "text-zinc-400"
                : "text-zinc-600"
            }`}
            onClick={() => {
              // Can only go to test cases if we have generated them
              if (generatedTestCases.length > 0) {
                setCurrentStep("test-cases");
              }
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                generatedTestCases.length > 0 ? "hover:opacity-80" : ""
              } ${
                currentStep === "test-cases"
                  ? "bg-blue-500"
                  : currentStep === "results"
                  ? "bg-green-500"
                  : generatedTestCases.length > 0
                  ? "bg-zinc-700"
                  : "bg-zinc-800"
              }`}
            >
              <span className="text-white font-bold">2</span>
            </div>
            <span>Review Test Cases</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500" />

          <div
            className={`flex items-center gap-2 transition-colors ${
              isGeneratingRegex
                ? "cursor-not-allowed opacity-40"
                : finalRegex
                ? "cursor-pointer hover:text-green-300"
                : "cursor-not-allowed opacity-50"
            } ${
              isGeneratingRegex
                ? "text-zinc-500"
                : currentStep === "results"
                ? "text-green-400"
                : finalRegex
                ? "text-zinc-400"
                : "text-zinc-600"
            }`}
            onClick={() => {
              // Can only go to results if we have generated a regex and not currently generating
              if (finalRegex && !isGeneratingRegex) {
                setCurrentStep("results");
              }
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                isGeneratingRegex ? "bg-zinc-800 animate-pulse" : finalRegex ? "hover:opacity-80" : ""
              } ${
                isGeneratingRegex
                  ? "bg-zinc-800"
                  : currentStep === "results"
                  ? "bg-green-500"
                  : finalRegex
                  ? "bg-zinc-700"
                  : "bg-zinc-800"
              }`}
            >
              <span className="text-white font-bold">3</span>
            </div>
            <span>Generate & Test</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Description */}
        {currentStep === "description" && (
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Step 1: Describe Your Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., 'find all email addresses' or 'extract dates in DD/MM/YYYY format'"
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && e.ctrlKey && description.trim() && !isGeneratingTestCases) {
                    generateTestCases();
                  }
                }}
                className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white placeholder:text-zinc-500 min-h-[100px] resize-none"
              />

              <div className="flex gap-2 items-center">
                <Button
                  variant="default"
                  onClick={generateTestCases}
                  disabled={!description.trim() || isGeneratingTestCases}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingTestCases ? "Generating Test Cases..." : "Generate Test Cases"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("test-cases");
                    setTestCasesExplanation("Manual test cases - Add your own examples below");
                  }}
                  disabled={!description.trim() || generatedTestCases.length === 0}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Test Cases
                </Button>
                {description && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDescription("")}
                    className="text-zinc-400 hover:text-white"
                  >
                    Clear
                  </Button>
                )}
                <span className="text-xs text-zinc-500 ml-auto">Ctrl+Enter to generate</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Test Cases Review */}
        {currentStep === "test-cases" && (
          <>
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Step 2: Review & Approve Test Cases
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep("description")}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Description
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateTestCases} disabled={isGeneratingTestCases}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {isGeneratingTestCases ? "Regenerating..." : "Regenerate Test Cases"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Pattern:</strong> {description}
                  </p>
                  {testCasesExplanation && <p className="text-blue-200 text-xs mt-2">{testCasesExplanation}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Test Cases</h3>
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" onClick={() => addTestCase(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Valid Test
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => addTestCase(false)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Invalid Test
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedTestCases.map(testCase => (
                    <Card key={testCase.id} className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            variant="outline"
                            className={
                              testCase.isValid ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                            }
                          >
                            {testCase.isValid ? "✓ Should Match" : "✗ Should NOT Match"}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleTestValidity(testCase.id)}
                              className="p-1 h-6 w-6"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTestCase(testCase.id)}
                              className="p-1 h-6 w-6"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Input
                          placeholder="Enter test text..."
                          value={testCase.text}
                          onChange={e => editTestCase(testCase.id, e.target.value)}
                          className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white placeholder:text-zinc-500 font-mono text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="default"
                    onClick={generateRegex}
                    disabled={
                      generatedTestCases.length === 0 ||
                      generatedTestCases.some(tc => !tc.text.trim()) ||
                      isGeneratingRegex
                    }
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isGeneratingRegex ? "Generating Regex..." : "Generate Regex"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Step 3: Results */}
        {currentStep === "results" && (
          <>
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {allTestsPassed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    Step 3: Generated Regex
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep("test-cases")}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Test Cases
                    </Button>
                    <Button variant="outline" size="sm" onClick={startOver}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-800/50 backdrop-blur-sm p-3 rounded-lg">
                    <RegexHighlighter pattern={finalRegex} className="text-green-400" />
                  </div>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-zinc-300 text-sm">{regexExplanation}</p>

                {/* AI-Powered Regex Breakdown */}
                <div className="border-t border-zinc-700/50 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleBreakdown}
                    className="text-zinc-400 hover:text-white"
                    disabled={!breakdown}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    {showRegexBreakdown ? "Hide" : "Show"} Pattern Breakdown
                    {showRegexBreakdown ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}
                  </Button>

                  {showRegexBreakdown && finalRegex && breakdown && (
                    <div className="mt-4 p-4 bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-700/30">
                      {/* Header with purpose and complexity */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <h4 className="text-white font-medium">AI Pattern Analysis</h4>
                          </div>
                          <p className="text-zinc-300 text-sm leading-relaxed">{breakdown.purpose}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-4 ${
                            breakdown.complexity === "Beginner"
                              ? "text-green-400 border-green-500/30"
                              : breakdown.complexity === "Intermediate"
                              ? "text-yellow-400 border-yellow-500/30"
                              : "text-red-400 border-red-500/30"
                          }`}
                        >
                          {breakdown.complexity}
                        </Badge>
                      </div>

                      {/* Overall explanation */}
                      <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-200 text-sm">{regexExplanation}</p>
                      </div>

                      {/* Pattern breakdown */}
                      <div className="space-y-3">
                        <h5 className="text-white font-medium text-sm flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-400" />
                          Pattern Components
                        </h5>
                        {breakdown.parts.map((part, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="bg-zinc-800/50 px-3 py-2 rounded-lg font-mono text-sm border border-zinc-700/50 min-w-fit">
                                <span className={part.color}>{part.text}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-white text-sm font-medium mb-1">{part.description}</div>
                                <div className="text-zinc-400 text-xs">{part.example}</div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs border-zinc-600/50 ${
                                part.type === "escape"
                                  ? "text-purple-400 border-purple-500/30"
                                  : part.type === "charClass"
                                  ? "text-blue-400 border-blue-500/30"
                                  : part.type === "group"
                                  ? "text-yellow-400 border-yellow-500/30"
                                  : part.type === "quantifier"
                                  ? "text-green-400 border-green-500/30"
                                  : part.type === "anchor"
                                  ? "text-red-400 border-red-500/30"
                                  : part.type === "wildcard"
                                  ? "text-orange-400 border-orange-500/30"
                                  : part.type === "alternation"
                                  ? "text-pink-400 border-pink-500/30"
                                  : "text-zinc-400 border-zinc-500/30"
                              }`}
                            >
                              {part.type}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {/* Pattern Legend */}
                      <div className="mt-6 pt-4 border-t border-zinc-700/30">
                        <h5 className="text-zinc-400 text-xs font-medium mb-3">Component Types:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span className="text-zinc-400">Escape Sequences</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span className="text-zinc-400">Character Classes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <span className="text-zinc-400">Groups</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-zinc-400">Quantifiers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span className="text-zinc-400">Anchors</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                            <span className="text-zinc-400">Wildcards</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                            <span className="text-zinc-400">Alternation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                            <span className="text-zinc-400">Literals</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {allTestsPassed ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      All test cases passed! ({confidence}% confidence)
                    </div>
                    <p className="text-green-300 text-xs mt-1">Your regex is working correctly with all test cases.</p>
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Some test cases failed ({confidence}% confidence)
                    </div>
                    <p className="text-red-300 text-xs mt-1">
                      The generated regex doesn't pass all test cases. Click "Retry Generation" to improve it.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!allTestsPassed && (
                    <Button variant="destructive" size="sm" onClick={retryWorkflow} disabled={isGeneratingRegex}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {isGeneratingRegex ? "Retrying..." : "Retry Generation"}
                    </Button>
                  )}
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("sandboxRegex", finalRegex);
                      localStorage.setItem("sandboxTestText", testResults.map(tc => tc.text).join("\n"));
                      window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                      toast.success("Regex copied to sandbox!");
                    }}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Test in Sandbox
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <CardTitle className="text-white">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testResults.map(result => (
                    <Card
                      key={result.id}
                      className={`bg-zinc-900/40 backdrop-blur-sm border ${
                        result.passed ? "border-green-500/30" : "border-red-500/30"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={"border-zinc-500 text-zinc-400"}>
                              {result.isValid ? "Should Match" : "Should NOT Match"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                result.passed ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                              }
                            >
                              {result.passed ? "✓" : "✗"}
                              {result.actualResult ? " Does match" : " Does not match"}
                            </Badge>
                          </div>
                          {result.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="bg-zinc-800/50 p-2 rounded text-sm font-mono text-white">{result.text}</div>
                        <div className="mt-2 text-xs text-zinc-400">
                          Expected: {result.isValid ? "Match" : "No Match"} | Actual:{" "}
                          {result.actualResult ? "Match" : "No Match"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
