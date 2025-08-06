"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { GenerateFromText } from "@/components/generate-from-text";
import { AnalyzeRegex } from "@/components/analyze-regex";
import { ExampleBased } from "@/components/example-based";
import { InteractiveSandbox } from "@/components/interactive-sandbox";
import { PatternLibrary } from "@/components/pattern-library";

export default function Home() {
  const [activeTab, setActiveTab] = useState("generate");

  // Generate tab state
  const [generateDescription, setGenerateDescription] = useState("");
  const [generateRegex, setGenerateRegex] = useState("");
  const [generateExplanation, setGenerateExplanation] = useState("");
  const [generateTestCases, setGenerateTestCases] = useState<any[]>([]);
  const [generateGenerationSteps, setGenerateGenerationSteps] = useState<any[]>([]);
  const [generateIsGenerating, setGenerateIsGenerating] = useState(false);

  // Generate tab step-by-step workflow state
  const [generateCurrentStep, setGenerateCurrentStep] = useState<
    "description" | "test-cases" | "regex-generation" | "results"
  >("description");
  const [generateIsGeneratingTestCases, setGenerateIsGeneratingTestCases] = useState(false);
  const [generateIsGeneratingRegex, setGenerateIsGeneratingRegex] = useState(false);
  const [generateGeneratedTestCases, setGenerateGeneratedTestCases] = useState<any[]>([]);
  const [generateTestCasesExplanation, setGenerateTestCasesExplanation] = useState("");
  const [generateFinalRegex, setGenerateFinalRegex] = useState("");
  const [generateRegexExplanation, setGenerateRegexExplanation] = useState("");
  const [generateTestResults, setGenerateTestResults] = useState<any[]>([]);
  const [generateConfidence, setGenerateConfidence] = useState(0);
  const [generateAllTestsPassed, setGenerateAllTestsPassed] = useState(false);
  const [generatePreviousAttempt, setGeneratePreviousAttempt] = useState<any>(undefined);

  // Analyze tab state
  const [analyzeRegex, setAnalyzeRegex] = useState("");
  const [analyzeAnalysis, setAnalyzeAnalysis] = useState<any>(null);
  const [analyzeError, setAnalyzeError] = useState("");
  const [analyzeIsAnalyzing, setAnalyzeIsAnalyzing] = useState(false);
  const [analyzeSuggestedFix, setAnalyzeSuggestedFix] = useState("");
  const [analyzeIsFixing, setAnalyzeIsFixing] = useState(false);

  // Analyze tab step-by-step workflow state
  const [analyzeCurrentStep, setAnalyzeCurrentStep] = useState<"input" | "analysis" | "improvement" | "results">(
    "input"
  );
  const [analyzeIsGeneratingImproved, setAnalyzeIsGeneratingImproved] = useState(false);
  const [analyzeImprovedRegex, setAnalyzeImprovedRegex] = useState("");
  const [analyzeImprovedExplanation, setAnalyzeImprovedExplanation] = useState("");
  const [analyzeImprovedConfidence, setAnalyzeImprovedConfidence] = useState(0);
  const [analyzeSelectedSuggestions, setAnalyzeSelectedSuggestions] = useState<string[]>([]);
  const [analyzeGeneratedTestCases, setAnalyzeGeneratedTestCases] = useState<
    Array<{ text: string; shouldMatch: boolean }>
  >([]);
  const [analyzeTestResults, setAnalyzeTestResults] = useState<
    Array<{ text: string; isValid: boolean; actualResult: boolean; passed: boolean }>
  >([]);
  const [analyzeAllTestsPassed, setAnalyzeAllTestsPassed] = useState(false);

  // Examples tab state
  const [examplesList, setExamplesList] = useState([{ id: "1", input: "", output: "" }]);
  const [examplesRegex, setExamplesRegex] = useState("");
  const [examplesConfidence, setExamplesConfidence] = useState(0);
  const [examplesExplanation, setExamplesExplanation] = useState("");
  const [examplesTestCases, setExamplesTestCases] = useState<any[]>([]);
  const [examplesIsGenerating, setExamplesIsGenerating] = useState(false);

  // Sandbox tab state
  const [sandboxRegex, setSandboxRegex] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [sandboxTestText, setSandboxTestText] = useState(`Here are some emails:
john.doe@example.com
invalid.email
test@domain.co.uk
another@test
user123+tag@site.org
@invalid.com`);
  const [sandboxMatches, setSandboxMatches] = useState<any[]>([]);
  const [sandboxError, setSandboxError] = useState("");
  const [sandboxShowQuickActions, setSandboxShowQuickActions] = useState(false);
  const [sandboxSavedPatterns, setSandboxSavedPatterns] = useState<any[]>([]);

  // Library tab state
  const [librarySearchTerm, setLibrarySearchTerm] = useState("");
  const [librarySelectedCategory, setLibrarySelectedCategory] = useState("All");
  const [libraryRecentPatterns, setLibraryRecentPatterns] = useState<string[]>([]);

  useEffect(() => {
    const handleNavigateToSandbox = () => {
      setActiveTab("sandbox");
    };

    window.addEventListener("navigateToSandbox", handleNavigateToSandbox);
    return () => window.removeEventListener("navigateToSandbox", handleNavigateToSandbox);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "generate":
        return (
          <GenerateFromText
            state={{
              description: generateDescription,
              generatedRegex: generateRegex,
              explanation: generateExplanation,
              testCases: generateTestCases,
              generationSteps: generateGenerationSteps,
              isGenerating: generateIsGenerating,
              // Step-by-step workflow state
              currentStep: generateCurrentStep,
              isGeneratingTestCases: generateIsGeneratingTestCases,
              isGeneratingRegex: generateIsGeneratingRegex,
              generatedTestCases: generateGeneratedTestCases,
              testCasesExplanation: generateTestCasesExplanation,
              finalRegex: generateFinalRegex,
              regexExplanation: generateRegexExplanation,
              testResults: generateTestResults,
              confidence: generateConfidence,
              allTestsPassed: generateAllTestsPassed,
              previousAttempt: generatePreviousAttempt,
            }}
            updateState={updates => {
              if (updates.description !== undefined) setGenerateDescription(updates.description);
              if (updates.generatedRegex !== undefined) setGenerateRegex(updates.generatedRegex);
              if (updates.explanation !== undefined) setGenerateExplanation(updates.explanation);
              if (updates.testCases !== undefined) setGenerateTestCases(updates.testCases);
              if (updates.generationSteps !== undefined) setGenerateGenerationSteps(updates.generationSteps);
              if (updates.isGenerating !== undefined) setGenerateIsGenerating(updates.isGenerating);
              // Step-by-step workflow state updates
              if (updates.currentStep !== undefined) setGenerateCurrentStep(updates.currentStep);
              if (updates.isGeneratingTestCases !== undefined)
                setGenerateIsGeneratingTestCases(updates.isGeneratingTestCases);
              if (updates.isGeneratingRegex !== undefined) setGenerateIsGeneratingRegex(updates.isGeneratingRegex);
              if (updates.generatedTestCases !== undefined) setGenerateGeneratedTestCases(updates.generatedTestCases);
              if (updates.testCasesExplanation !== undefined)
                setGenerateTestCasesExplanation(updates.testCasesExplanation);
              if (updates.finalRegex !== undefined) setGenerateFinalRegex(updates.finalRegex);
              if (updates.regexExplanation !== undefined) setGenerateRegexExplanation(updates.regexExplanation);
              if (updates.testResults !== undefined) setGenerateTestResults(updates.testResults);
              if (updates.confidence !== undefined) setGenerateConfidence(updates.confidence);
              if (updates.allTestsPassed !== undefined) setGenerateAllTestsPassed(updates.allTestsPassed);
              if (updates.previousAttempt !== undefined) setGeneratePreviousAttempt(updates.previousAttempt);
            }}
          />
        );
      case "analyze":
        return (
          <AnalyzeRegex
            state={{
              regex: analyzeRegex,
              analysis: analyzeAnalysis,
              error: analyzeError,
              isAnalyzing: analyzeIsAnalyzing,
              suggestedFix: analyzeSuggestedFix,
              isFixing: analyzeIsFixing,
              // Step-by-step workflow state
              currentStep: analyzeCurrentStep,
              isGeneratingImproved: analyzeIsGeneratingImproved,
              improvedRegex: analyzeImprovedRegex,
              improvedExplanation: analyzeImprovedExplanation,
              improvedConfidence: analyzeImprovedConfidence,
              selectedSuggestions: analyzeSelectedSuggestions,
              generatedTestCases: analyzeGeneratedTestCases,
              testResults: analyzeTestResults,
              allTestsPassed: analyzeAllTestsPassed,
            }}
            updateState={updates => {
              if (updates.regex !== undefined) setAnalyzeRegex(updates.regex);
              if (updates.analysis !== undefined) setAnalyzeAnalysis(updates.analysis);
              if (updates.error !== undefined) setAnalyzeError(updates.error);
              if (updates.isAnalyzing !== undefined) setAnalyzeIsAnalyzing(updates.isAnalyzing);
              if (updates.suggestedFix !== undefined) setAnalyzeSuggestedFix(updates.suggestedFix);
              if (updates.isFixing !== undefined) setAnalyzeIsFixing(updates.isFixing);
              // Step-by-step workflow state updates
              if (updates.currentStep !== undefined) setAnalyzeCurrentStep(updates.currentStep);
              if (updates.isGeneratingImproved !== undefined)
                setAnalyzeIsGeneratingImproved(updates.isGeneratingImproved);
              if (updates.improvedRegex !== undefined) setAnalyzeImprovedRegex(updates.improvedRegex);
              if (updates.improvedExplanation !== undefined) setAnalyzeImprovedExplanation(updates.improvedExplanation);
              if (updates.improvedConfidence !== undefined) setAnalyzeImprovedConfidence(updates.improvedConfidence);
              if (updates.selectedSuggestions !== undefined) setAnalyzeSelectedSuggestions(updates.selectedSuggestions);
              if (updates.generatedTestCases !== undefined) setAnalyzeGeneratedTestCases(updates.generatedTestCases);
              if (updates.testResults !== undefined) setAnalyzeTestResults(updates.testResults);
              if (updates.allTestsPassed !== undefined) setAnalyzeAllTestsPassed(updates.allTestsPassed);
            }}
          />
        );
      case "examples":
        return (
          <ExampleBased
            state={{
              examples: examplesList,
              generatedRegex: examplesRegex,
              confidence: examplesConfidence,
              explanation: examplesExplanation,
              testCases: examplesTestCases,
              isGenerating: examplesIsGenerating,
            }}
            updateState={updates => {
              if (updates.examples !== undefined) setExamplesList(updates.examples);
              if (updates.generatedRegex !== undefined) setExamplesRegex(updates.generatedRegex);
              if (updates.confidence !== undefined) setExamplesConfidence(updates.confidence);
              if (updates.explanation !== undefined) setExamplesExplanation(updates.explanation);
              if (updates.testCases !== undefined) setExamplesTestCases(updates.testCases);
              if (updates.isGenerating !== undefined) setExamplesIsGenerating(updates.isGenerating);
            }}
          />
        );
      case "sandbox":
        return (
          <InteractiveSandbox
            state={{
              regex: sandboxRegex,
              testText: sandboxTestText,
              matches: sandboxMatches,
              error: sandboxError,
              showQuickActions: sandboxShowQuickActions,
              savedPatterns: sandboxSavedPatterns,
            }}
            updateState={updates => {
              if (updates.regex !== undefined) setSandboxRegex(updates.regex);
              if (updates.testText !== undefined) setSandboxTestText(updates.testText);
              if (updates.matches !== undefined) setSandboxMatches(updates.matches);
              if (updates.error !== undefined) setSandboxError(updates.error);
              if (updates.showQuickActions !== undefined) setSandboxShowQuickActions(updates.showQuickActions);
              if (updates.savedPatterns !== undefined) setSandboxSavedPatterns(updates.savedPatterns);
            }}
          />
        );
      case "library":
        return (
          <PatternLibrary
            state={{
              searchTerm: librarySearchTerm,
              selectedCategory: librarySelectedCategory,
              recentPatterns: libraryRecentPatterns,
            }}
            updateState={updates => {
              if (updates.searchTerm !== undefined) setLibrarySearchTerm(updates.searchTerm);
              if (updates.selectedCategory !== undefined) setLibrarySelectedCategory(updates.selectedCategory);
              if (updates.recentPatterns !== undefined) setLibraryRecentPatterns(updates.recentPatterns);
            }}
          />
        );
      default:
        return (
          <GenerateFromText
            state={{
              description: generateDescription,
              generatedRegex: generateRegex,
              explanation: generateExplanation,
              testCases: generateTestCases,
              generationSteps: generateGenerationSteps,
              isGenerating: generateIsGenerating,
            }}
            updateState={updates => {
              if (updates.description !== undefined) setGenerateDescription(updates.description);
              if (updates.generatedRegex !== undefined) setGenerateRegex(updates.generatedRegex);
              if (updates.explanation !== undefined) setGenerateExplanation(updates.explanation);
              if (updates.testCases !== undefined) setGenerateTestCases(updates.testCases);
              if (updates.generationSteps !== undefined) setGenerateGenerationSteps(updates.generationSteps);
              if (updates.isGenerating !== undefined) setGenerateIsGenerating(updates.isGenerating);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto md:ml-64">{renderContent()}</main>
      </div>
      <footer className="border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm p-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab("generate")} className="hover:text-white transition-colors">
              Generate
            </button>
            <button onClick={() => setActiveTab("analyze")} className="hover:text-white transition-colors">
              Analyze
            </button>
            <button onClick={() => setActiveTab("sandbox")} className="hover:text-white transition-colors">
              Sandbox
            </button>
            <button onClick={() => setActiveTab("library")} className="hover:text-white transition-colors">
              Library
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Ctrl+Enter: Generate | Enter: Analyze</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
