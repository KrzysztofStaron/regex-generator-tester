"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Copy, Sparkles, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { RegexHighlighter } from "@/components/regex-highlighter";
import { generateFromExamplesAction } from "@/app/actions";

interface Example {
  id: string;
  input: string;
  output: string;
}

interface TestCase {
  id: string;
  text: string;
  isValid: boolean;
  actualResult?: boolean;
}

interface ExampleBasedProps {
  state: {
    examples: Example[];
    generatedRegex: string;
    confidence: number;
    explanation: string;
    testCases: TestCase[];
    isGenerating: boolean;
  };
  updateState: (updates: Partial<ExampleBasedProps["state"]>) => void;
}

export function ExampleBased({ state, updateState }: ExampleBasedProps) {
  const { examples, generatedRegex, confidence, explanation, testCases, isGenerating } = state;

  const setExamples = (value: Example[]) => updateState({ examples: value });
  const setGeneratedRegex = (value: string) => updateState({ generatedRegex: value });
  const setConfidence = (value: number) => updateState({ confidence: value });
  const setExplanation = (value: string) => updateState({ explanation: value });
  const setTestCases = (value: TestCase[]) => updateState({ testCases: value });
  const setIsGenerating = (value: boolean) => updateState({ isGenerating: value });

  const addExample = () => {
    setExamples([...examples, { id: Date.now().toString(), input: "", output: "" }]);
  };

  const removeExample = (id: string) => {
    if (examples.length > 1) {
      setExamples(examples.filter(ex => ex.id !== id));
    }
  };

  const updateExample = (id: string, field: "input" | "output", value: string) => {
    setExamples(examples.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const generateFromExamples = async () => {
    const validExamples = examples.filter(ex => ex.input.trim() && ex.output.trim());

    if (validExamples.length === 0) {
      toast.error("Please provide at least one complete example");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateFromExamplesAction(validExamples);

      setGeneratedRegex(result.regex);
      setExplanation(result.explanation);
      setConfidence(result.confidence);
      setTestCases(result.testCases || []);
    } catch (error) {
      toast.error("Failed to generate regex from examples. Please try again.");
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedRegex);
    toast.success("Regex copied to clipboard!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generate from Input-Output Examples</h1>
        <p className="text-zinc-400">Provide examples of input text and desired output to generate a matching regex</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Training Examples (AI-Powered)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {examples.map((example, index) => (
              <div
                key={example.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg"
              >
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Input Text</label>
                  <Input
                    placeholder="e.g., My email is john@example.com"
                    value={example.input}
                    onChange={e => updateExample(example.id, "input", e.target.value)}
                    className="bg-zinc-700/50 backdrop-blur-sm border-zinc-600/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Expected Output</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., john@example.com"
                      value={example.output}
                      onChange={e => updateExample(example.id, "output", e.target.value)}
                      className="bg-zinc-700/50 backdrop-blur-sm border-zinc-600/50 text-white"
                    />
                    {examples.length > 1 && (
                      <Button variant="destructive" size="sm" onClick={() => removeExample(example.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={addExample} title="Add another example">
                <Plus className="w-4 h-4 mr-2" />
                Add Example
              </Button>
              <Button variant="default" onClick={generateFromExamples} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Regex"}
              </Button>
              {examples.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setExamples([{ id: "1", input: "", output: "" }]);
                    setGeneratedRegex("");
                    setConfidence(0);
                    setExplanation("");
                  }}
                  className="text-zinc-400 hover:text-white ml-auto"
                >
                  Reset All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {generatedRegex && (
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-white">Generated Pattern</CardTitle>
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
              {explanation && <p className="text-zinc-300 text-sm">{explanation}</p>}
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={`${
                    confidence >= 80
                      ? "border-green-500 text-green-400"
                      : confidence >= 60
                      ? "border-yellow-500 text-yellow-400"
                      : "border-red-500 text-red-400"
                  }`}
                >
                  {confidence}% Confidence
                </Badge>
                <span className="text-zinc-400 text-sm">
                  Based on {examples.filter(ex => ex.input.trim() && ex.output.trim()).length} examples
                </span>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem("sandboxRegex", generatedRegex);
                    localStorage.setItem("sandboxTestText", examples.map(ex => ex.input).join("\n"));
                    window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                    toast.success("Regex copied to sandbox!");
                  }}
                  className="ml-auto"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Test in Sandbox
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {testCases.length > 0 && (
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-white">Generated Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testCases.map((testCase, index) => (
                  <div key={index} className="p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={testCase.isValid ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}
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
                    <p className="text-zinc-300 text-sm font-mono break-all">{testCase.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
