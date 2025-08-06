# Regex Generator Tester

A comprehensive AI-powered regex testing and generation tool built with Next.js, React, and Tailwind CSS.

## 🚀 Features

### AI-Powered Regex Generation

- **Natural Language to Regex**: Describe what you want to match in plain English
- **Example-Based Generation**: Provide input-output pairs to generate matching patterns
- **Smart Analysis**: Get detailed explanations of existing regex patterns
- **AI Fix Suggestions**: Get intelligent suggestions for invalid patterns

### Interactive Testing

- **Real-time Sandbox**: Test regex patterns with live syntax highlighting
- **Match Visualization**: See matches highlighted in your test text
- **Error Detection**: Instant feedback on invalid patterns

### Pattern Library

- **Common Patterns**: Pre-built regex for emails, URLs, dates, etc.
- **Search & Filter**: Find patterns by category or description
- **One-click Copy**: Copy patterns to clipboard instantly

## 🛠️ Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:

   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

   Get your API key from [OpenRouter](https://openrouter.ai/)

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

## 🎨 Design Features

- **Dark Theme**: Beautiful dark interface with gradient backgrounds
- **Syntax Highlighting**: Color-coded regex patterns for better readability
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: Polished user experience with transitions

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: OpenAI API via OpenRouter (Claude 3.5 Sonnet)
- **Icons**: Lucide React
- **Notifications**: Sonner toast

## 🎯 Usage Examples

### Natural Language Generation

```
Input: "find all email addresses"
Output: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
```

### Example-Based Generation

```
Input: "My email is john@example.com" → Output: "john@example.com"
Input: "Contact me at jane@test.org" → Output: "jane@test.org"
Generated: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
```

### Pattern Analysis

```
Input: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
Output: Detailed explanation with syntax highlighting and suggestions
```
