"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  TestTube,
  BookOpen,
  Search,
  Sparkles,
  Code,
  Brain,
  Target,
  ArrowRight,
  Github,
  Star,
  Play,
  X,
} from "lucide-react";

import { useState } from "react";

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 relative overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Regex Hub</span>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
              Pattern Intelligence
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="https://github.com/KrzysztofStaron/regex-generator-tester"
                className="flex items-center space-x-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Testing
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Regex Generator
            <br />
            <span className="text-blue-400">& Tester</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            A powerful, AI-powered regex pattern generator and testing tool. Create, test, and understand regular
            expressions with intelligent assistance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg" asChild>
              <Link href="/app" className="flex items-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8 py-3 text-lg"
              onClick={() => setShowDemo(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              View Demo
            </Button>
          </div>

          {/* App Screenshot */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
            <img
              src="/app-screenshot.png"
              alt="Regex Hub Interface"
              className="relative z-10 w-full rounded-lg border border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Everything you need to master regular expressions with AI assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-zinc-100">AI-Powered Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Describe what you want to match in plain English and get perfect regex patterns with detailed
                  explanations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <TestTube className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-zinc-100">Interactive Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Test your regex patterns instantly with real-time validation and comprehensive test suites.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-zinc-100">Pattern Library</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Browse curated regex patterns for common use cases, from beginner to advanced levels.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-orange-400" />
                </div>
                <CardTitle className="text-zinc-100">Regex Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  Understand complex patterns with component breakdowns, error detection, and optimization suggestions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-zinc-400">Generate perfect regex patterns in just a few steps</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-100">Describe Your Pattern</h3>
                <p className="text-zinc-400">
                  Simply describe what you want to match in natural language - email addresses, phone numbers, or any
                  custom pattern.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-100">AI Generates Test Cases</h3>
                <p className="text-zinc-400">
                  Our AI creates comprehensive test cases to ensure your regex pattern works correctly in all scenarios.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-100">Perfect Regex Created</h3>
                <p className="text-zinc-400">
                  Get an optimized regex pattern with detailed explanations and the ability to test it immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Master Regular Expressions?</h2>
          <p className="text-xl text-zinc-400 mb-8">
            Join thousands of developers who are already using AI to create perfect regex patterns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg" asChild>
              <Link href="/app" className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Start Creating Regex</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8 py-3 text-lg"
              asChild
            >
              <Link
                href="https://github.com/KrzysztofStaron/regex-generator-tester"
                className="flex items-center space-x-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="w-5 h-5" />
                <span>Star on GitHub</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-zinc-400 mb-4">Made with ❤️ for the regex community</p>
          <p className="text-sm text-zinc-500">Transform your regex workflow with AI-powered intelligence</p>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-zinc-900 rounded-lg border border-zinc-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-xl font-semibold text-zinc-100">Regex Generator Tester Demo</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDemo(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Video */}
            <div className="p-6">
              <video controls className="w-full rounded-lg" autoPlay muted>
                <source
                  src="https://sif1zatsxq.ufs.sh/f/jSQcP3yxNjoauyhOB8JTbBZRYfqJnA6724oS3GEMz1kIOCmh"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
              <p className="text-zinc-400 text-sm text-center">
                Watch how easy it is to create, test, and understand regex patterns with AI assistance
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
