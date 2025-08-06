"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  AlertCircle,
  Code,
  Copy,
  RefreshCw,
  FileText,
  Zap,
  ChevronDown,
  ChevronUp,
  Save,
  Bookmark,
  CheckCircle,
  XCircle,
  Plus,
  X,
  RotateCcw,
  TestTube,
} from "lucide-react";
import { toast } from "sonner";
import { RegexHighlighter } from "@/components/regex-highlighter";

interface TestCase {
  id: string;
  text: string;
  isValid: boolean;
  actualResult?: boolean;
  passed?: boolean;
}

interface InteractiveSandboxProps {
  state: {
    regex: string;
    testText: string;
    matches: Array<{ match: string; index: number; length: number }>;
    error: string;
    showQuickActions: boolean;
    savedPatterns: Array<{ name: string; regex: string; testText: string }>;
    testCases: TestCase[];
    showTestCases: boolean;
  };
  updateState: (updates: Partial<InteractiveSandboxProps["state"]>) => void;
}

export function InteractiveSandbox({ state, updateState }: InteractiveSandboxProps) {
  const {
    regex,
    testText,
    matches,
    error,
    showQuickActions,
    savedPatterns,
    testCases = [],
    showTestCases = false,
  } = state;

  const setRegex = (value: string) => updateState({ regex: value });
  const setTestText = (value: string) => updateState({ testText: value });
  const setMatches = (value: Array<{ match: string; index: number; length: number }>) =>
    updateState({ matches: value });
  const setError = (value: string) => updateState({ error: value });
  const setShowQuickActions = (value: boolean) => updateState({ showQuickActions: value });
  const setSavedPatterns = (value: Array<{ name: string; regex: string; testText: string }>) =>
    updateState({ savedPatterns: value });
  const setTestCases = (value: TestCase[]) => updateState({ testCases: value });
  const setShowTestCases = (value: boolean) => updateState({ showTestCases: value });

  // Check for regex from other tabs
  useEffect(() => {
    const storedRegex = localStorage.getItem("sandboxRegex");
    const storedTestText = localStorage.getItem("sandboxTestText");

    if (storedRegex) {
      setRegex(storedRegex);
      localStorage.removeItem("sandboxRegex");
    }

    if (storedTestText) {
      setTestText(storedTestText);
      localStorage.removeItem("sandboxTestText");
    }
  }, []);

  useEffect(() => {
    testRegex();
  }, [regex, testText]);

  useEffect(() => {
    if (testCases.length > 0 && regex.trim()) {
      // Use a timeout to debounce the test case running
      const timeoutId = setTimeout(() => {
        runTestCases();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [regex, testCases.length, ...testCases.map(tc => tc.text + tc.isValid)]);

  const testRegex = () => {
    setError("");
    setMatches([]);

    if (!regex.trim()) return;

    try {
      const regexObj = new RegExp(regex, "g");
      const foundMatches = [];
      let match;

      while ((match = regexObj.exec(testText)) !== null) {
        foundMatches.push({
          match: match[0],
          index: match.index,
          length: match[0].length,
        });
      }

      setMatches(foundMatches);
    } catch (err) {
      setError("Invalid regex pattern");
    }
  };

  const runTestCases = () => {
    if (!regex.trim() || testCases.length === 0) return;

    try {
      const regexObj = new RegExp(regex);
      const updatedTestCases = testCases.map(testCase => {
        if (!testCase.text.trim()) {
          return { ...testCase, actualResult: undefined, passed: undefined };
        }

        const actualResult = regexObj.test(testCase.text);
        const passed = actualResult === testCase.isValid;

        return {
          ...testCase,
          actualResult,
          passed,
        };
      });

      // Only update if there's actually a change to avoid infinite loops
      const hasChanges = testCases.some((tc, index) => {
        const updated = updatedTestCases[index];
        return tc.actualResult !== updated.actualResult || tc.passed !== updated.passed;
      });

      if (hasChanges) {
        setTestCases(updatedTestCases);
      }
    } catch (err) {
      // Handle regex error - clear test results
      const clearedTestCases = testCases.map(tc => ({
        ...tc,
        actualResult: undefined,
        passed: undefined,
      }));
      setTestCases(clearedTestCases);
    }
  };

  const addTestCase = (isValid: boolean) => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      text: "",
      isValid,
    };
    setTestCases([...testCases, newTest]);
  };

  const editTestCase = (id: string, text: string) => {
    const updatedTestCases = testCases.map(tc => (tc.id === id ? { ...tc, text } : tc));
    setTestCases(updatedTestCases);
  };

  const toggleTestValidity = (id: string) => {
    const updatedTestCases = testCases.map(tc => (tc.id === id ? { ...tc, isValid: !tc.isValid } : tc));
    setTestCases(updatedTestCases);
  };

  const deleteTestCase = (id: string) => {
    const updatedTestCases = testCases.filter(tc => tc.id !== id);
    setTestCases(updatedTestCases);
  };

  const clearAllTestCases = () => {
    setTestCases([]);
  };

  const addQuickTestCases = () => {
    const quickTests: TestCase[] = [
      { id: "1", text: "test@example.com", isValid: true },
      { id: "2", text: "invalid.email", isValid: false },
      { id: "3", text: "user@domain.co.uk", isValid: true },
      { id: "4", text: "@invalid.com", isValid: false },
    ];
    setTestCases(quickTests);
    toast.success("Quick test cases added!");
  };

  const highlightMatches = (text: string) => {
    if (matches.length === 0) return text;

    let result = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        result.push(
          <span key={`before-${i}`} className="text-zinc-300">
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add highlighted match
      result.push(
        <span key={`match-${i}`} className="bg-blue-600 text-white px-1 rounded">
          {match.match}
        </span>
      );

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="after" className="text-zinc-300">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return result;
  };

  const quickPatterns = [
    {
      name: "Email",
      regex: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      testText: "john@example.com\ninvalid.email\ntest@domain.co.uk",
    },
    { name: "Phone", regex: "\\+?[1-9]\\d{1,14}", testText: "+1234567890\n1234567890\nabc123" },
    {
      name: "URL",
      regex:
        "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
      testText: "https://example.com\nhttp://www.site.org/path\ninvalid-url",
    },
    { name: "Date", regex: "\\d{2}/\\d{2}/\\d{4}", testText: "25/12/2023\n01/01/2024\n2023/12/25" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Interactive Regex Sandbox</h1>
            <p className="text-zinc-400">Test and refine your regex patterns in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTestCases(!showTestCases)}
              className="text-zinc-400 hover:text-white"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Cases
              {showTestCases ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="text-zinc-400 hover:text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Actions
              {showQuickActions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>

        {showQuickActions && (
          <div className="mt-4 p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50">
            <h3 className="text-white font-medium mb-3">Quick Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickPatterns.map((pattern, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-700/50 backdrop-blur-sm rounded-lg border border-zinc-600/50 hover:bg-zinc-600/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setRegex(pattern.regex);
                    setTestText(pattern.testText);
                    toast.success(`${pattern.name} pattern loaded!`);
                  }}
                >
                  <div className="font-medium text-white mb-2">{pattern.name}</div>
                  <div className="bg-zinc-800/50 backdrop-blur-sm p-2 rounded text-xs font-mono text-green-400 break-all">
                    {pattern.regex}
                  </div>
                </div>
              ))}
            </div>

            {savedPatterns.length > 0 && (
              <>
                <h3 className="text-white font-medium mb-3 mt-6">Saved Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {savedPatterns.map((pattern, index) => (
                    <div key={index} className="relative">
                      <div
                        className="p-3 bg-zinc-700/50 backdrop-blur-sm rounded-lg border border-zinc-600/50 hover:bg-zinc-600/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setRegex(pattern.regex);
                          setTestText(pattern.testText);
                          toast.success(`${pattern.name} loaded!`);
                        }}
                      >
                        <div className="font-medium text-white mb-2">{pattern.name}</div>
                        <div className="bg-zinc-800/50 backdrop-blur-sm p-2 rounded text-xs font-mono text-green-400 break-all">
                          {pattern.regex}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSavedPatterns(savedPatterns.filter((_, i) => i !== index));
                          toast.success("Pattern removed!");
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {showTestCases && (
          <div className="mt-4 p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Test Cases</h3>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={() => addTestCase(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Valid Test
                </Button>
                <Button variant="destructive" size="sm" onClick={() => addTestCase(false)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Invalid Test
                </Button>
                {testCases.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllTestCases}>
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {testCases.length > 0 && (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {testCases.map(testCase => (
                    <Card key={testCase.id} className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={
                                testCase.isValid ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                              }
                            >
                              {testCase.isValid ? "✓ Should Match" : "✗ Should NOT Match"}
                            </Badge>
                            {testCase.actualResult !== undefined && (
                              <Badge
                                variant="outline"
                                className={
                                  testCase.passed ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                                }
                              >
                                {testCase.passed ? "✓ PASS" : "✗ FAIL"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleTestValidity(testCase.id)}
                              className="p-1 h-6 w-6"
                              title="Toggle validity"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTestCase(testCase.id)}
                              className="p-1 h-6 w-6"
                              title="Delete test case"
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
                        {testCase.actualResult !== undefined && (
                          <div className="mt-2 text-xs text-zinc-400">
                            Expected: {testCase.isValid ? "Match" : "No Match"} | Actual:{" "}
                            {testCase.actualResult ? "Match" : "No Match"}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Test Results Summary */}
                {testCases.length > 0 && testCases.some(tc => tc.actualResult !== undefined) && (
                  <div className="p-3 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-700/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Test Results Summary</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">
                            {testCases.filter(tc => tc.passed).length} Passed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">
                            {testCases.filter(tc => tc.passed === false).length} Failed
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            testCases.every(tc => tc.passed)
                              ? "border-green-500 text-green-400"
                              : "border-red-500 text-red-400"
                          }
                        >
                          {testCases.every(tc => tc.passed) ? "All Tests Pass" : "Some Tests Failed"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {testCases.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No test cases yet. Add some test cases to validate your regex pattern.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                Regex Pattern (Syntax Highlighted)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter your regex pattern"
                  value={regex}
                  onChange={e => setRegex(e.target.value)}
                  className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white font-mono"
                />
                <div className="bg-zinc-800/50 backdrop-blur-sm p-2 rounded border border-zinc-700/50">
                  <RegexHighlighter pattern={regex} className="text-white" />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(regex);
                    toast.success("Regex copied to clipboard!");
                  }}
                  disabled={!regex}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Regex
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRegex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
                    setTestText(`Here are some emails:
john.doe@example.com
invalid.email
test@domain.co.uk
another@test
user123+tag@site.org
@invalid.com`);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Example
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    const name = prompt("Enter a name for this pattern:");
                    if (name && name.trim()) {
                      const newPattern = { name: name.trim(), regex, testText };
                      setSavedPatterns([...savedPatterns, newPattern]);
                      toast.success("Pattern saved!");
                    }
                  }}
                  disabled={!regex.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Pattern
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Test Text</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTestText("")}
                  className="text-zinc-400 hover:text-white"
                  disabled={!testText}
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter text to test against your regex"
                value={testText}
                onChange={e => setTestText(e.target.value)}
                className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white min-h-[200px] font-mono"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Results
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {matches.length} matches
                  </Badge>
                  {matches.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const results = matches.map(m => m.match).join("\n");
                        navigator.clipboard.writeText(results);
                        toast.success("Matches copied to clipboard!");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Matches
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-800/50 backdrop-blur-sm p-4 rounded-lg min-h-[200px] font-mono text-sm whitespace-pre-wrap">
                {highlightMatches(testText)}
              </div>
            </CardContent>
          </Card>

          {matches.length > 0 && (
            <Card className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
              <CardHeader>
                <CardTitle className="text-white">Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-zinc-800/50 backdrop-blur-sm rounded"
                    >
                      <code className="text-blue-400 font-mono">{match.match}</code>
                      <span className="text-zinc-400 text-sm">
                        Position: {match.index}-{match.index + match.length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
