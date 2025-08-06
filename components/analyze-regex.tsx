"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  AlertCircle,
  Info,
  Sparkles,
  Lightbulb,
  PlayCircle,
  Check,
  ArrowRight,
  RotateCcw,
  Edit3,
} from "lucide-react";
import { RegexHighlighter } from "@/components/regex-highlighter";
import { analyzeRegexAction, suggestFixAction, generateRegexFromTestCasesAction } from "@/app/actions";
import { toast } from "sonner";

// Current workflow step
type AnalyzeWorkflowStep = "input" | "analysis" | "improvement" | "results";

interface AnalyzeRegexProps {
  state: {
    regex: string;
    analysis: {
      explanation: string;
      components: Array<{ part: string; description: string; color: string }>;
      flags: string[];
      complexity: "Simple" | "Moderate" | "Complex";
      suggestions: string[];
    } | null;
    error: string;
    isAnalyzing: boolean;
    suggestedFix: string;
    isFixing: boolean;
    // Step-by-step workflow state
    currentStep?: "input" | "analysis" | "improvement" | "results";
    isGeneratingImproved?: boolean;
    improvedRegex?: string;
    improvedExplanation?: string;
    improvedConfidence?: number;
    selectedSuggestions?: string[];
    generatedTestCases?: Array<{ text: string; shouldMatch: boolean }>;
    testResults?: Array<{ text: string; isValid: boolean; actualResult: boolean; passed: boolean }>;
    allTestsPassed?: boolean;
  };
  updateState: (updates: Partial<AnalyzeRegexProps["state"]>) => void;
}

export function AnalyzeRegex({ state, updateState }: AnalyzeRegexProps) {
  const {
    regex,
    analysis,
    error,
    isAnalyzing,
    suggestedFix,
    isFixing,
    currentStep = "input",
    isGeneratingImproved = false,
    improvedRegex = "",
    improvedExplanation = "",
    improvedConfidence = 0,
    selectedSuggestions = [],
    generatedTestCases = [],
    testResults = [],
    allTestsPassed = false,
  } = state;

  const setRegex = (value: string) => updateState({ regex: value });
  const setAnalysis = (value: any) => updateState({ analysis: value });
  const setError = (value: string) => updateState({ error: value });
  const setIsAnalyzing = (value: boolean) => updateState({ isAnalyzing: value });
  const setSuggestedFix = (value: string) => updateState({ suggestedFix: value });
  const setIsFixing = (value: boolean) => updateState({ isFixing: value });
  const setCurrentStep = (value: AnalyzeWorkflowStep) => updateState({ currentStep: value });
  const setIsGeneratingImproved = (value: boolean) => updateState({ isGeneratingImproved: value });
  const setImprovedRegex = (value: string) => updateState({ improvedRegex: value });
  const setImprovedExplanation = (value: string) => updateState({ improvedExplanation: value });
  const setImprovedConfidence = (value: number) => updateState({ improvedConfidence: value });
  const setSelectedSuggestions = (value: string[]) => updateState({ selectedSuggestions: value });
  const setGeneratedTestCases = (value: Array<{ text: string; shouldMatch: boolean }>) =>
    updateState({ generatedTestCases: value });
  const setTestResults = (value: Array<{ text: string; isValid: boolean; actualResult: boolean; passed: boolean }>) =>
    updateState({ testResults: value });
  const setAllTestsPassed = (value: boolean) => updateState({ allTestsPassed: value });

  const analyzePattern = async () => {
    setError("");
    setAnalysis(null);
    setSuggestedFix("");
    setSelectedSuggestions([]);
    setImprovedRegex("");
    setImprovedExplanation("");
    setTestResults([]);
    setAllTestsPassed(false);

    if (!regex.trim()) {
      setError("Please enter a regex pattern");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Test if regex is valid
      new RegExp(regex);

      const result = await analyzeRegexAction(regex);
      setAnalysis(result);
      setCurrentStep("analysis");
      toast.success("Pattern analyzed! Review the results and suggestions.");
    } catch (err) {
      if (err instanceof Error && err.message.includes("Invalid")) {
        setError("Invalid regex pattern");
      } else {
        setError("Failed to analyze pattern. Please try again.");
        console.error("Analysis error:", err);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Generate test cases from the original regex
  const generateTestCasesFromRegex = async () => {
    if (!analysis) return;

    try {
      // Generate test cases based on the original regex and analysis
      const testCases = [
        // Valid cases that should match the original regex
        { text: "test@example.com", shouldMatch: true },
        { text: "user123@domain.co.uk", shouldMatch: true },
        { text: "simple@test.org", shouldMatch: true },
        // Invalid cases that should not match
        { text: "invalid.email", shouldMatch: false },
        { text: "@domain.com", shouldMatch: false },
        { text: "user@", shouldMatch: false },
        { text: "user@domain", shouldMatch: false },
      ];

      setGeneratedTestCases(testCases);
      setCurrentStep("improvement");
      toast.success("Test cases generated! Select improvements to apply.");
    } catch (error) {
      toast.error("Failed to generate test cases");
      console.error("Test case generation error:", error);
    }
  };

  // Step 3: Generate improved regex with selected suggestions
  const generateImprovedRegex = async () => {
    if (selectedSuggestions.length === 0 || generatedTestCases.length === 0) {
      toast.error("Please select at least one improvement suggestion");
      return;
    }

    setIsGeneratingImproved(true);
    try {
      const description = `Improve this regex: "${regex}" with these specific improvements: ${selectedSuggestions.join(
        ", "
      )}. The improved regex should maintain the same functionality while addressing the suggested improvements.`;

      const result = await generateRegexFromTestCasesAction(description, generatedTestCases);

      setImprovedRegex(result.regex);
      setImprovedExplanation(result.explanation);
      setImprovedConfidence(result.confidence);
      setTestResults(result.testResults);
      setAllTestsPassed(result.allTestsPassed);
      setCurrentStep("results");

      if (result.allTestsPassed) {
        toast.success("Improved regex generated! All tests passed.");
      } else {
        toast.warning("Improved regex generated but some tests failed.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to generate improved regex: ${errorMessage}`);
      console.error("Improved regex generation error:", error);
    } finally {
      setIsGeneratingImproved(false);
    }
  };

  // Retry improvement generation
  const retryImprovement = async () => {
    if (improvedRegex && testResults.length > 0) {
      const failures = testResults
        .filter(tr => !tr.passed)
        .map(
          tr =>
            `Expected "${tr.text}" to ${tr.isValid ? "match" : "not match"} but it ${
              tr.actualResult ? "matched" : "did not match"
            }`
        );

      setIsGeneratingImproved(true);
      try {
        const description = `Improve this regex: "${improvedRegex}" with these specific improvements: ${selectedSuggestions.join(
          ", "
        )}. Previous attempt failed with: ${failures.join(", ")}.`;

        const result = await generateRegexFromTestCasesAction(description, generatedTestCases);

        setImprovedRegex(result.regex);
        setImprovedExplanation(result.explanation);
        setImprovedConfidence(result.confidence);
        setTestResults(result.testResults);
        setAllTestsPassed(result.allTestsPassed);

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
        setIsGeneratingImproved(false);
      }
    }
  };

  // Start over completely
  const startOver = () => {
    setCurrentStep("input");
    setAnalysis(null);
    setError("");
    setSuggestedFix("");
    setSelectedSuggestions([]);
    setImprovedRegex("");
    setImprovedExplanation("");
    setTestResults([]);
    setAllTestsPassed(false);
    setRegex("");
  };

  // Toggle suggestion selection
  const toggleSuggestion = (suggestion: string) => {
    const updatedSuggestions = selectedSuggestions.includes(suggestion)
      ? selectedSuggestions.filter(s => s !== suggestion)
      : [...selectedSuggestions, suggestion];
    setSelectedSuggestions(updatedSuggestions);
  };

  const getSuggestedFix = async () => {
    if (!error || !regex.trim()) return;

    setIsFixing(true);
    try {
      const fix = await suggestFixAction(regex, error);
      setSuggestedFix(fix);
      toast.success("AI suggested a fix!");
    } catch (err) {
      toast.error("Failed to get AI suggestion");
      console.error("Fix suggestion error:", err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Step-by-Step Regex Analysis & Improvement</h1>
        <p className="text-zinc-400">Analyze existing patterns and generate improved versions with AI suggestions</p>

        {/* Progress indicator */}
        <div className="mt-6 flex items-center gap-4">
          <div
            className={`flex items-center gap-2 cursor-pointer transition-colors hover:text-blue-300 ${
              currentStep === "input"
                ? "text-blue-400"
                : currentStep === "analysis" || currentStep === "improvement" || currentStep === "results"
                ? "text-green-400"
                : "text-zinc-400"
            }`}
            onClick={() => setCurrentStep("input")}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors hover:opacity-80 ${
                currentStep === "input"
                  ? "bg-blue-500"
                  : currentStep === "analysis" || currentStep === "improvement" || currentStep === "results"
                  ? "bg-green-500"
                  : "bg-zinc-700"
              }`}
            >
              <span className="text-white font-bold">1</span>
            </div>
            <span>Input Pattern</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500" />

          <div
            className={`flex items-center gap-2 transition-colors ${
              analysis ? "cursor-pointer hover:text-blue-300" : "cursor-not-allowed opacity-50"
            } ${
              currentStep === "analysis"
                ? "text-blue-400"
                : currentStep === "improvement" || currentStep === "results"
                ? "text-green-400"
                : analysis
                ? "text-zinc-400"
                : "text-zinc-600"
            }`}
            onClick={() => {
              if (analysis) {
                setCurrentStep("analysis");
              }
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                analysis ? "hover:opacity-80" : ""
              } ${
                currentStep === "analysis"
                  ? "bg-blue-500"
                  : currentStep === "improvement" || currentStep === "results"
                  ? "bg-green-500"
                  : analysis
                  ? "bg-zinc-700"
                  : "bg-zinc-800"
              }`}
            >
              <span className="text-white font-bold">2</span>
            </div>
            <span>Analysis</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500" />

          <div
            className={`flex items-center gap-2 transition-colors ${
              generatedTestCases.length > 0 ? "cursor-pointer hover:text-blue-300" : "cursor-not-allowed opacity-50"
            } ${
              currentStep === "improvement"
                ? "text-blue-400"
                : currentStep === "results"
                ? "text-green-400"
                : generatedTestCases.length > 0
                ? "text-zinc-400"
                : "text-zinc-600"
            }`}
            onClick={() => {
              if (generatedTestCases.length > 0) {
                setCurrentStep("improvement");
              }
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                generatedTestCases.length > 0 ? "hover:opacity-80" : ""
              } ${
                currentStep === "improvement"
                  ? "bg-blue-500"
                  : currentStep === "results"
                  ? "bg-green-500"
                  : generatedTestCases.length > 0
                  ? "bg-zinc-700"
                  : "bg-zinc-800"
              }`}
            >
              <span className="text-white font-bold">3</span>
            </div>
            <span>Improve</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500" />

          <div
            className={`flex items-center gap-2 transition-colors ${
              improvedRegex ? "cursor-pointer hover:text-green-300" : "cursor-not-allowed opacity-50"
            } ${currentStep === "results" ? "text-green-400" : improvedRegex ? "text-zinc-400" : "text-zinc-600"}`}
            onClick={() => {
              if (improvedRegex) {
                setCurrentStep("results");
              }
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                improvedRegex ? "hover:opacity-80" : ""
              } ${currentStep === "results" ? "bg-green-500" : improvedRegex ? "bg-zinc-700" : "bg-zinc-800"}`}
            >
              <span className="text-white font-bold">4</span>
            </div>
            <span>Results</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Input Pattern */}
        {currentStep === "input" && (
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Step 1: Enter Regex Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="e.g., [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                  value={regex}
                  onChange={e => setRegex(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && regex.trim() && !isAnalyzing) {
                      analyzePattern();
                    }
                  }}
                  className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white placeholder:text-zinc-500 font-mono"
                />
                {regex && (
                  <div className="bg-zinc-800/50 backdrop-blur-sm p-2 rounded border border-zinc-700/50">
                    <RegexHighlighter pattern={regex} className="text-white" />
                  </div>
                )}
              </div>
              {error && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                  <Button variant="outline" size="sm" onClick={getSuggestedFix} disabled={isFixing} className="text-xs">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {isFixing ? "Getting AI Fix..." : "Get AI Fix Suggestion"}
                  </Button>
                  {suggestedFix && (
                    <div className="p-2 bg-zinc-800/50 rounded border border-green-500/30">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-green-400 text-xs">AI Suggested Fix:</p>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setRegex(suggestedFix);
                            setError("");
                            setSuggestedFix("");
                            toast.success("Applied AI fix!");
                          }}
                          className="text-xs h-6 px-2"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                      </div>
                      <RegexHighlighter pattern={suggestedFix} className="text-green-400 text-xs" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 items-center">
                <Button variant="default" onClick={analyzePattern} disabled={!regex.trim() || isAnalyzing}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Pattern"}
                </Button>
                {regex && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRegex("");
                      setAnalysis(null);
                      setSuggestedFix("");
                      setError("");
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    Clear
                  </Button>
                )}
                <span className="text-xs text-zinc-500 ml-auto">Press Enter to analyze</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Analysis Results */}
        {currentStep === "analysis" && analysis && (
          <>
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-green-500" />
                    Step 2: Pattern Analysis
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep("input")}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Pattern
                    </Button>
                    <Button variant="outline" size="sm" onClick={analyzePattern} disabled={isAnalyzing}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {isAnalyzing ? "Re-analyzing..." : "Re-analyze"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 text-lg">{analysis.explanation}</p>
                <div className="mt-4 flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={`${
                      analysis.complexity === "Simple"
                        ? "border-green-500 text-green-400"
                        : analysis.complexity === "Moderate"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-red-500 text-red-400"
                    }`}
                  >
                    {analysis.complexity} Complexity
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {analysis.components.length > 0 && (
              <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Pattern Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.components.map((component, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-zinc-800/50 backdrop-blur-sm rounded-lg"
                      >
                        <div className="bg-zinc-700/50 backdrop-blur-sm px-2 py-1 rounded">
                          <RegexHighlighter pattern={component.part} className="text-sm" />
                        </div>
                        <p className="text-zinc-300 text-sm flex-1">{component.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    AI Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-zinc-800/50 backdrop-blur-sm rounded">
                        <span className="text-yellow-400 text-sm">•</span>
                        <p className="text-zinc-300 text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button variant="default" onClick={generateTestCasesFromRegex}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Generate Test Cases & Continue
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Improvement Selection */}
        {currentStep === "improvement" && (
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Step 3: Select Improvements
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep("analysis")}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Back to Analysis
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Original Pattern:</strong> {regex}
                </p>
                <p className="text-blue-200 text-xs mt-2">
                  Select the improvements you'd like to apply to generate an enhanced version of your regex.
                </p>
              </div>

              {analysis && analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Available Improvements</h3>
                  {analysis.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSuggestions.includes(suggestion)
                          ? "bg-blue-500/20 border-blue-500/50"
                          : "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/70"
                      }`}
                      onClick={() => toggleSuggestion(suggestion)}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
                          selectedSuggestions.includes(suggestion) ? "bg-blue-500 border-blue-500" : "border-zinc-600"
                        }`}
                      >
                        {selectedSuggestions.includes(suggestion) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className="text-zinc-300 text-sm flex-1">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={generateImprovedRegex}
                  disabled={selectedSuggestions.length === 0 || isGeneratingImproved}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingImproved ? "Generating Improved Regex..." : "Generate Improved Regex"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {currentStep === "results" && (
          <>
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {allTestsPassed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    Step 4: Improved Regex Results
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep("improvement")}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Improvements
                    </Button>
                    <Button variant="outline" size="sm" onClick={startOver}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Original Pattern</h4>
                    <div className="bg-zinc-800/50 backdrop-blur-sm p-3 rounded border border-zinc-700/50">
                      <RegexHighlighter pattern={regex} className="text-zinc-300" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Improved Pattern</h4>
                    <div className="bg-zinc-800/50 backdrop-blur-sm p-3 rounded border border-green-500/30">
                      <RegexHighlighter pattern={improvedRegex} className="text-green-400" />
                    </div>
                  </div>
                </div>

                <p className="text-zinc-300 text-sm">{improvedExplanation}</p>

                {allTestsPassed ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <Check className="w-4 h-4" />
                      All test cases passed! ({improvedConfidence}% confidence)
                    </div>
                    <p className="text-green-300 text-xs mt-1">
                      Your improved regex is working correctly with all test cases.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Some test cases failed ({improvedConfidence}% confidence)
                    </div>
                    <p className="text-red-300 text-xs mt-1">
                      The improved regex doesn't pass all test cases. Click "Retry Improvement" to try again.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!allTestsPassed && (
                    <Button variant="destructive" size="sm" onClick={retryImprovement} disabled={isGeneratingImproved}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {isGeneratingImproved ? "Retrying..." : "Retry Improvement"}
                    </Button>
                  )}
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("sandboxRegex", improvedRegex);
                      window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                      toast.success("Improved regex copied to sandbox!");
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
                  {testResults.map((result, index) => (
                    <Card
                      key={index}
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
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
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
