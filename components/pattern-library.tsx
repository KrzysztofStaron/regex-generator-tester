"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Copy,
  Search,
  PlayCircle,
  Sparkles,
  Filter,
  Clock,
  Zap,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { RegexHighlighter } from "@/components/regex-highlighter";

interface Pattern {
  id: string;
  name: string;
  regex: string;
  description: string;
  category: string;
  examples: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
}

const patterns: Pattern[] = [
  {
    id: "1",
    name: "Email Address",
    regex: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    description: "Matches standard email addresses with proper domain validation",
    category: "Communication",
    examples: ["user@example.com", "test.email+tag@domain.co.uk", "admin@company.org"],
    difficulty: "Beginner",
    tags: ["email", "validation", "communication"],
  },
  {
    id: "2",
    name: "Phone Number (US)",
    regex: "\\$?([0-9]{3})\\$?[-. ]?([0-9]{3})[-. ]?([0-9]{4})",
    description: "Matches US phone numbers in various formats with optional separators",
    category: "Communication",
    examples: ["(555) 123-4567", "555-123-4567", "555.123.4567", "5551234567"],
    difficulty: "Intermediate",
    tags: ["phone", "us", "formatting"],
  },
  {
    id: "3",
    name: "URL Validation",
    regex:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    description: "Matches HTTP and HTTPS URLs with comprehensive path support",
    category: "Web",
    examples: ["https://example.com", "http://www.site.org/path", "https://api.github.com/users/123"],
    difficulty: "Advanced",
    tags: ["url", "web", "protocol"],
  },
  {
    id: "4",
    name: "Date (DD/MM/YYYY)",
    regex: "(0[1-9]|[12][0-9]|3[01])\\/(0[1-9]|1[012])\\/(19|20)\\d\\d",
    description: "Matches dates in DD/MM/YYYY format with proper day/month validation",
    category: "Date & Time",
    examples: ["25/12/2023", "01/01/2024", "31/03/2025"],
    difficulty: "Intermediate",
    tags: ["date", "format", "validation"],
  },
  {
    id: "5",
    name: "Credit Card Number",
    regex: "\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b",
    description: "Matches credit card numbers with optional separators (spaces or hyphens)",
    category: "Financial",
    examples: ["1234 5678 9012 3456", "1234-5678-9012-3456", "1234567890123456"],
    difficulty: "Beginner",
    tags: ["credit", "card", "financial"],
  },
  {
    id: "6",
    name: "IPv4 Address",
    regex: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    description: "Matches valid IPv4 addresses with proper octet validation",
    category: "Network",
    examples: ["192.168.1.1", "10.0.0.1", "255.255.255.255"],
    difficulty: "Advanced",
    tags: ["ip", "network", "address"],
  },
  {
    id: "7",
    name: "Hex Color Code",
    regex: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})",
    description: "Matches hexadecimal color codes in 3 or 6 digit format",
    category: "Web",
    examples: ["#FF5733", "#abc", "#123456", "#FFFFFF"],
    difficulty: "Beginner",
    tags: ["color", "hex", "web"],
  },
  {
    id: "8",
    name: "Social Security Number",
    regex: "\\b\\d{3}-\\d{2}-\\d{4}\\b",
    description: "Matches US Social Security Numbers in XXX-XX-XXXX format",
    category: "Personal",
    examples: ["123-45-6789", "987-65-4321", "111-22-3333"],
    difficulty: "Beginner",
    tags: ["ssn", "personal", "us"],
  },
  {
    id: "9",
    name: "Strong Password",
    regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    description: "Validates strong passwords with lowercase, uppercase, number, and special character requirements",
    category: "Security",
    examples: ["MyP@ssw0rd", "Str0ng#Pass", "Secure123!"],
    difficulty: "Advanced",
    tags: ["password", "security", "validation"],
  },
  {
    id: "10",
    name: "Time (24-hour)",
    regex: "([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?",
    description: "Matches 24-hour time format with optional seconds",
    category: "Date & Time",
    examples: ["14:30", "09:15:45", "23:59", "00:00"],
    difficulty: "Intermediate",
    tags: ["time", "24-hour", "format"],
  },
  {
    id: "11",
    name: "Postal Code (US)",
    regex: "\\b\\d{5}(?:-\\d{4})?\\b",
    description: "Matches US ZIP codes with optional 4-digit extension",
    category: "Location",
    examples: ["12345", "12345-6789", "90210", "10001-1234"],
    difficulty: "Beginner",
    tags: ["zip", "postal", "us"],
  },
  {
    id: "12",
    name: "MAC Address",
    regex: "([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})",
    description: "Matches MAC addresses with colon or hyphen separators",
    category: "Network",
    examples: ["00:1B:44:11:3A:B7", "00-1B-44-11-3A-B7", "A1:B2:C3:D4:E5:F6"],
    difficulty: "Intermediate",
    tags: ["mac", "network", "address"],
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
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch =
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Communication":
        return "📧";
      case "Web":
        return "🌐";
      case "Date & Time":
        return "📅";
      case "Financial":
        return "💰";
      case "Network":
        return "🌍";
      case "Personal":
        return "👤";
      case "Security":
        return "🔒";
      case "Location":
        return "📍";
      default:
        return "📋";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Pattern Library
              </h1>
              <p className="text-zinc-400 mt-1">Discover and use proven regex patterns</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <Input
                placeholder="Search patterns by name, description, or tags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-zinc-900/50 backdrop-blur-sm border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`h-10 px-4 ${
                    selectedCategory === category
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                      : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600/50 hover:text-white"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Patterns */}
        {recentPatterns.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Recent Patterns</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentPatterns.map((regex, index) => (
                <Card
                  key={index}
                  className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-200 group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                        Recent #{index + 1}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(regex, `Recent ${index + 1}`)}
                          className="h-7 w-7 p-0 border-zinc-600/50 hover:border-zinc-500/50"
                          title="Copy pattern"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem("sandboxRegex", regex);
                            window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                            toast.success("Pattern copied to sandbox!");
                          }}
                          className="h-7 w-7 p-0 border-zinc-600/50 hover:border-zinc-500/50"
                          title="Test in sandbox"
                        >
                          <PlayCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur-sm p-3 rounded-lg border border-zinc-700/50">
                      <RegexHighlighter
                        pattern={regex}
                        className="text-green-400 text-xs font-mono break-all leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Patterns Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                {filteredPatterns.length} Pattern{filteredPatterns.length !== 1 ? "s" : ""} Found
              </h3>
            </div>
            <Badge variant="outline" className="border-zinc-700/50 text-zinc-400">
              {categories.length - 1} Categories
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatterns.map(pattern => (
              <Card
                key={pattern.id}
                className="bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-200 group overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(pattern.category)}</span>
                        <CardTitle className="text-white text-lg font-semibold truncate">{pattern.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="border-zinc-600/50 text-zinc-400 text-xs">
                          {pattern.category}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(pattern.difficulty)}`}>
                          {pattern.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-zinc-300 text-sm leading-relaxed">{pattern.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {pattern.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-zinc-800/50 text-zinc-400 text-xs rounded-md border border-zinc-700/50"
                      >
                        #{tag}
                      </span>
                    ))}
                    {pattern.tags.length > 3 && (
                      <span className="px-2 py-1 bg-zinc-800/50 text-zinc-500 text-xs rounded-md border border-zinc-700/50">
                        +{pattern.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Pattern */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-xs font-medium">Pattern:</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(pattern.regex, pattern.name)}
                          className="h-7 w-7 p-0 border-zinc-600/50 hover:border-zinc-500/50"
                          title="Copy regex"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem("sandboxRegex", pattern.regex);
                            localStorage.setItem("sandboxTestText", pattern.examples.join("\n"));
                            window.dispatchEvent(new CustomEvent("navigateToSandbox"));
                            toast.success("Pattern copied to sandbox!");
                          }}
                          className="h-7 w-7 p-0 border-zinc-600/50 hover:border-zinc-500/50"
                          title="Test in sandbox"
                        >
                          <PlayCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 backdrop-blur-sm p-3 rounded-lg border border-zinc-700/50">
                      <RegexHighlighter
                        pattern={pattern.regex}
                        className="text-green-400 text-xs font-mono break-all leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <span className="text-zinc-400 text-xs font-medium">Examples:</span>
                    <div className="space-y-1">
                      {pattern.examples.slice(0, 2).map((example, index) => (
                        <div
                          key={index}
                          className="bg-zinc-800/50 backdrop-blur-sm p-2 rounded border border-zinc-700/50"
                        >
                          <code className="text-blue-400 font-mono text-xs break-all">{example}</code>
                        </div>
                      ))}
                      {pattern.examples.length > 2 && (
                        <div className="text-center">
                          <span className="text-zinc-500 text-xs">+{pattern.examples.length - 2} more examples</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredPatterns.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="p-4 bg-zinc-900/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Search className="w-8 h-8 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No patterns found</h3>
              <p className="text-zinc-400">Try adjusting your search terms or category filter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
