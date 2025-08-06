"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Zap, CheckCircle, XCircle, Plus, RotateCcw, X, Sparkles, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { RegexHighlighter } from "@/components/regex-highlighter";
import { generateRegexWithRetryAction } from "@/app/actions";

interface TestCase {
  id: string;
  text: string;
  isValid: boolean;
  actualResult?: boolean;
}

interface GenerationStep {
  step: number;
  regex: string;
  explanation: string;
  testCases: TestCase[];
  confidence: number;
  failedTests: number;
  status: "success" | "failed" | "retrying";
}

interface GenerateFromTextProps {
  state: {
    description: string;
    generatedRegex: string;
    explanation: string;
    testCases: TestCase[];
    isGenerating: boolean;
    generationSteps: GenerationStep[];
  };
  updateState: (updates: Partial<GenerateFromTextProps["state"]>) => void;
}

export function GenerateFromText({ state, updateState }: GenerateFromTextProps) {
  const { description, generatedRegex, explanation, testCases, isGenerating, generationSteps } = state;

  const setDescription = (value: string) => updateState({ description: value });
  const setGeneratedRegex = (value: string) => updateState({ generatedRegex: value });
  const setExplanation = (value: string) => updateState({ explanation: value });
  const setTestCases = (value: TestCase[]) => updateState({ testCases: value });
  const setIsGenerating = (value: boolean) => updateState({ isGenerating: value });
  const setGenerationSteps = (value: GenerationStep[]) => updateState({ generationSteps: value });

  const generateRegex = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setGeneratedRegex("");
    setExplanation("");
    setTestCases([]);
    setGenerationSteps([]);

    try {
      const result = await generateRegexWithRetryAction(description);

      setGeneratedRegex(result.finalResult.regex);
      setExplanation(result.finalResult.explanation);
      setTestCases(
        result.finalResult.testCases.map((test, index) => ({
          id: (index + 1).toString(),
          text: test.text,
          isValid: test.isValid,
          actualResult: test.actualResult,
        }))
      );
      setGenerationSteps(result.steps);
    } catch (error) {
      toast.error("Failed to generate regex. Please try again.");
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedRegex);
    toast.success("Regex copied to clipboard!");
  };

  const addTestCase = (isValid: boolean) => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      text: "",
      isValid,
    };
    setTestCases([...testCases, newTest]);
  };

  const updateTestCase = (id: string, text: string) => {
    setTestCases(testCases.map(test => (test.id === id ? { ...test, text } : test)));
  };

  const deleteTestCase = (id: string) => {
    setTestCases(testCases.filter(test => test.id !== id));
  };

  const toggleTestValidity = (id: string) => {
    setTestCases(testCases.map(test => (test.id === id ? { ...test, isValid: !test.isValid } : test)));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generate Regex from Natural Language</h1>
        <p className="text-zinc-400">Describe what you want to match and get a regex pattern instantly</p>
        {!generatedRegex && !description && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm mb-3">
              💡 <strong>Tip:</strong> Try describing patterns like "find all email addresses", "match phone numbers",
              or "extract URLs from text". Our AI will generate the perfect regex for you!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {["find all email addresses", "match phone numbers", "extract URLs from text"].map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDescription(example)}
                  className="text-blue-300 hover:text-white hover:bg-blue-500/20 text-left justify-start"
                >
                  "{example}"
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Describe Your Pattern (AI-Powered)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., 'find all email addresses' or 'extract dates in DD/MM/YYYY format'"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && e.ctrlKey && description.trim() && !isGenerating) {
                  generateRegex();
                }
              }}
              className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white placeholder:text-zinc-500 min-h-[100px] resize-none"
            />
            <div className="flex gap-2 items-center">
              <Button variant="default" onClick={generateRegex} disabled={!description.trim() || isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Regex"}
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

        {generatedRegex && (
          <>
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Generated Pattern</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setGeneratedRegex("");
                      setExplanation("");
                      setTestCases([]);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-800/50 backdrop-blur-sm p-3 rounded-lg">
                    <RegexHighlighter pattern={generatedRegex} className="text-green-400" />
                  </div>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-zinc-300 text-sm">{explanation}</p>
                <div className="flex gap-2">
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => {
                      // Store regex in localStorage to pass to sandbox
                      localStorage.setItem("sandboxRegex", generatedRegex);
                      localStorage.setItem("sandboxTestText", testCases.map(tc => tc.text).join("\n"));
                      // Trigger navigation to sandbox
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

            {generationSteps.length > 1 && (
              <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-blue-500" />
                    Generation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generationSteps.map((step, index) => (
                      <div key={step.step} className="p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                step.status === "success"
                                  ? "border-green-500 text-green-400"
                                  : step.status === "failed"
                                  ? "border-red-500 text-red-400"
                                  : "border-yellow-500 text-yellow-400"
                              }
                            >
                              Step {step.step}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                step.failedTests === 0
                                  ? "border-green-500 text-green-400"
                                  : "border-red-500 text-red-400"
                              }
                            >
                              {step.failedTests === 0 ? "All Tests Pass" : `${step.failedTests} Failed`}
                            </Badge>
                            {step.status === "retrying" && (
                              <div className="flex items-center gap-2 text-yellow-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                                <span className="text-sm">Retrying...</span>
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-zinc-400">
                            {step.confidence}% Confidence
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-zinc-700/50 backdrop-blur-sm p-2 rounded">
                            <RegexHighlighter pattern={step.regex} className="text-sm" />
                          </div>
                          <p className="text-zinc-300 text-sm">{step.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {testCases.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Test Cases</h3>
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
                  {testCases.map(testCase => (
                    <Card key={testCase.id} className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={
                                testCase.isValid ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                              }
                            >
                              {testCase.isValid ? "✓ Positive Case" : "✗ Negative Case"}
                            </Badge>
                            {testCase.actualResult !== undefined && (
                              <Badge
                                variant="outline"
                                className={
                                  testCase.actualResult === testCase.isValid
                                    ? "border-green-500 text-green-400"
                                    : "border-red-500 text-red-400"
                                }
                              >
                                {testCase.actualResult === testCase.isValid ? "✓ Correct" : "✗ Incorrect"}
                                {testCase.actualResult !== testCase.isValid && " ❌"}
                              </Badge>
                            )}
                          </div>
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
                          onChange={e => updateTestCase(testCase.id, e.target.value)}
                          className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white placeholder:text-zinc-500 font-mono text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
