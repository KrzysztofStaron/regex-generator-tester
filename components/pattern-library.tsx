"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy, Search, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { RegexHighlighter } from "@/components/regex-highlighter";

interface Pattern {
  id: string;
  name: string;
  regex: string;
  description: string;
  category: string;
  examples: string[];
}

const patterns: Pattern[] = [
  {
    id: "1",
    name: "Email Address",
    regex: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    description: "Matches standard email addresses",
    category: "Communication",
    examples: ["user@example.com", "test.email+tag@domain.co.uk"],
  },
  {
    id: "2",
    name: "Phone Number (US)",
    regex: "$$?([0-9]{3})$$?[-. ]?([0-9]{3})[-. ]?([0-9]{4})",
    description: "Matches US phone numbers in various formats",
    category: "Communication",
    examples: ["(555) 123-4567", "555-123-4567", "555.123.4567"],
  },
  {
    id: "3",
    name: "URL",
    regex:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    description: "Matches HTTP and HTTPS URLs",
    category: "Web",
    examples: ["https://example.com", "http://www.site.org/path"],
  },
  {
    id: "4",
    name: "Date (DD/MM/YYYY)",
    regex: "(0[1-9]|[12][0-9]|3[01])\\/(0[1-9]|1[012])\\/(19|20)\\d\\d",
    description: "Matches dates in DD/MM/YYYY format",
    category: "Date & Time",
    examples: ["25/12/2023", "01/01/2024"],
  },
  {
    id: "5",
    name: "Credit Card",
    regex: "\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b",
    description: "Matches credit card numbers with optional separators",
    category: "Financial",
    examples: ["1234 5678 9012 3456", "1234-5678-9012-3456"],
  },
  {
    id: "6",
    name: "IPv4 Address",
    regex: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    description: "Matches valid IPv4 addresses",
    category: "Network",
    examples: ["192.168.1.1", "10.0.0.1"],
  },
  {
    id: "7",
    name: "Hex Color",
    regex: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})",
    description: "Matches hexadecimal color codes",
    category: "Web",
    examples: ["#FF5733", "#abc", "#123456"],
  },
  {
    id: "8",
    name: "Social Security Number",
    regex: "\\b\\d{3}-\\d{2}-\\d{4}\\b",
    description: "Matches US Social Security Numbers",
    category: "Personal",
    examples: ["123-45-6789", "987-65-4321"],
  },
];

interface PatternLibraryProps {
  state: {
    searchTerm: string;
    selectedCategory: string;
    recentPatterns: string[];
  };
  updateState: (updates: Partial<PatternLibraryProps["state"]>) => void;
}

export function PatternLibrary({ state, updateState }: PatternLibraryProps) {
  const { searchTerm, selectedCategory, recentPatterns } = state;

  const setSearchTerm = (value: string) => updateState({ searchTerm: value });
  const setSelectedCategory = (value: string) => updateState({ selectedCategory: value });
  const setRecentPatterns = (value: string[]) => updateState({ recentPatterns: value });

  const categories = ["All", ...Array.from(new Set(patterns.map(p => p.category)))];

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch =
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || pattern.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (regex: string, name: string) => {
    navigator.clipboard.writeText(regex);
    toast.success(`${name} pattern copied to clipboard!`);

    // Add to recent patterns
    if (!recentPatterns.includes(regex)) {
      setRecentPatterns([regex, ...recentPatterns.slice(0, 4)]);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Common Pattern Library</h1>
        <p className="text-zinc-400">Browse and copy commonly used regex patterns</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            placeholder="Search patterns..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {recentPatterns.length > 0 && (
        <div className="mb-6 p-4 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50">
          <h3 className="text-white font-medium mb-3">Recent Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPatterns.map((regex, index) => (
              <div key={index} className="p-3 bg-zinc-700/50 backdrop-blur-sm rounded-lg border border-zinc-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-xs font-medium">Recent #{index + 1}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(regex, `Recent ${index + 1}`)}
                      className="h-6 w-6 p-0"
                      title="Copy pattern"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        localStorage.setItem("sandboxRegex", regex);
                        window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                        toast.success("Pattern copied to sandbox!");
                      }}
                      className="h-6 w-6 p-0"
                      title="Test in sandbox"
                    >
                      <PlayCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm p-2 rounded">
                  <RegexHighlighter pattern={regex} className="text-green-400 text-xs font-mono break-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatterns.map(pattern => (
          <Card key={pattern.id} className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    {pattern.name}
                  </CardTitle>
                  <Badge variant="outline" className="mt-2 border-zinc-600/50 text-zinc-400">
                    {pattern.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300 text-sm">{pattern.description}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-xs">Pattern:</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(pattern.regex, pattern.name)}
                      title="Copy regex"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        localStorage.setItem("sandboxRegex", pattern.regex);
                        localStorage.setItem("sandboxTestText", pattern.examples.join("\n"));
                        window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                        toast.success("Pattern copied to sandbox!");
                      }}
                      title="Test in sandbox"
                    >
                      <PlayCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm p-2 rounded">
                  <RegexHighlighter pattern={pattern.regex} className="text-green-400 text-xs break-all" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-zinc-400 text-xs">Examples:</span>
                <div className="space-y-1">
                  {pattern.examples.map((example, index) => (
                    <code
                      key={index}
                      className="block bg-zinc-800/50 backdrop-blur-sm p-1 rounded text-blue-400 font-mono text-xs"
                    >
                      {example}
                    </code>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatterns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No patterns found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
