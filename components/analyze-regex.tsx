"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, Info, Sparkles, Lightbulb, PlayCircle } from "lucide-react";
import { RegexHighlighter } from "@/components/regex-highlighter";
import { analyzeRegexAction, suggestFixAction } from "@/app/actions";
import { toast } from "sonner";

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
  };
  updateState: (updates: Partial<AnalyzeRegexProps["state"]>) => void;
}

export function AnalyzeRegex({ state, updateState }: AnalyzeRegexProps) {
  const { regex, analysis, error, isAnalyzing, suggestedFix, isFixing } = state;

  const setRegex = (value: string) => updateState({ regex: value });
  const setAnalysis = (value: any) => updateState({ analysis: value });
  const setError = (value: string) => updateState({ error: value });
  const setIsAnalyzing = (value: boolean) => updateState({ isAnalyzing: value });
  const setSuggestedFix = (value: string) => updateState({ suggestedFix: value });
  const setIsFixing = (value: boolean) => updateState({ isFixing: value });

  const analyzePattern = async () => {
    setError("");
    setAnalysis(null);
    setSuggestedFix("");

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
        <h1 className="text-3xl font-bold text-white mb-2">Analyze Existing Regex</h1>
        <p className="text-zinc-400">Paste a regex pattern to get a plain English explanation</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Enter Regex Pattern (AI Analysis)
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
                    <p className="text-green-400 text-xs mb-1">AI Suggested Fix:</p>
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

        {analysis && (
          <>
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-green-500" />
                  Pattern Explanation
                </CardTitle>
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
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("sandboxRegex", regex);
                      window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                      toast.success("Pattern copied to sandbox!");
                    }}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Test in Sandbox
                  </Button>
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
                    AI Suggestions
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
          </>
        )}
      </div>
    </div>
  );
}
