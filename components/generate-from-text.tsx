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
  };
  updateState: (updates: Partial<GenerateFromTextProps["state"]>) => void;
}

export function GenerateFromText({ state, updateState }: GenerateFromTextProps) {
  const { description } = state;

  // Step-by-step workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("description");
  const [isGeneratingTestCases, setIsGeneratingTestCases] = useState(false);
  const [isGeneratingRegex, setIsGeneratingRegex] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);
  const [testCasesExplanation, setTestCasesExplanation] = useState("");
  const [finalRegex, setFinalRegex] = useState("");
  const [regexExplanation, setRegexExplanation] = useState("");
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [previousAttempt, setPreviousAttempt] = useState<{ regex: string; failures: string[] } | undefined>();

  const setDescription = (value: string) => updateState({ description: value });

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
        isValid: tc.isValid,
      }));

      const result = await generateRegexFromTestCasesAction(description, testCasesData, previousAttempt);

      setFinalRegex(result.regex);
      setRegexExplanation(result.explanation);
      setConfidence(result.confidence);
      setAllTestsPassed(result.allTestsPassed);

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

  // Retry workflow - go back to test cases with context
  const retryWorkflow = () => {
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
    }

    setCurrentStep("test-cases");
    setFinalRegex("");
    setRegexExplanation("");
    setTestResults([]);
    setAllTestsPassed(false);
    toast.info("Retrying generation with improved context...");
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
    setGeneratedTestCases(prev => prev.map(tc => (tc.id === id ? { ...tc, text } : tc)));
  };

  const toggleTestValidity = (id: string) => {
    setGeneratedTestCases(prev => prev.map(tc => (tc.id === id ? { ...tc, isValid: !tc.isValid } : tc)));
  };

  const deleteTestCase = (id: string) => {
    setGeneratedTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const addTestCase = (isValid: boolean) => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      text: "",
      isValid,
    };
    setGeneratedTestCases(prev => [...prev, newTest]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalRegex);
    toast.success("Regex copied to clipboard!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Step-by-Step Regex Generation</h1>
        <p className="text-zinc-400">Follow the guided workflow to create perfect regex patterns</p>

        {/* Progress indicator */}
        <div className="mt-6 flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              currentStep === "description"
                ? "text-blue-400"
                : currentStep === "test-cases" || currentStep === "results"
                ? "text-green-400"
                : "text-zinc-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "description"
                  ? "bg-blue-500"
                  : currentStep === "test-cases" || currentStep === "results"
                  ? "bg-green-500"
                  : "bg-zinc-700"
              }`}
            >
              1
            </div>
            <span>Describe Pattern</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500" />

          <div
            className={`flex items-center gap-2 ${
              currentStep === "test-cases"
                ? "text-blue-400"
                : currentStep === "results"
                ? "text-green-400"
                : "text-zinc-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "test-cases"
                  ? "bg-blue-500"
                  : currentStep === "results"
                  ? "bg-green-500"
                  : "bg-zinc-700"
              }`}
            >
              2
            </div>
            <span>Review Test Cases</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500" />

          <div className={`flex items-center gap-2 ${currentStep === "results" ? "text-green-400" : "text-zinc-400"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "results" ? "bg-green-500" : "bg-zinc-700"
              }`}
            >
              3
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
                      Retry Generation
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
