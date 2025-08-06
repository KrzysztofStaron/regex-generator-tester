# 🔍 Regex Generator Tester

A powerful, AI-powered regex pattern generator and testing tool built with Next.js, TypeScript, and Tailwind CSS. Create, test, and understand regular expressions with intelligent assistance.

## 🎬 Demo

See the Regex Generator Tester in action! Watch our demo video to see how easy it is to create, test, and understand regex patterns with AI assistance.

[![Watch Demo](https://img.shields.io/badge/Watch_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://github.com/KrzysztofStaron/regex-generator-tester/raw/main/public/demo.mp4)

**Or download the demo video directly:**
[📥 Download Demo (MP4)](public/demo.mp4)

## ✨ Features

### 🎯 **AI-Powered Regex Generation**

- **Natural Language to Regex**: Describe what you want to match in plain English
- **Step-by-Step Generation**: Generate test cases first, then create the perfect regex
- **Intelligent Breakdown**: Get detailed explanations of each regex component
- **Context-Aware**: AI understands your specific use case and requirements

### 🧪 **Interactive Testing**

- **Real-time Validation**: Test your regex patterns instantly
- **Structured Test Cases**: Create and manage comprehensive test suites
- **Visual Feedback**: See which tests pass or fail with clear indicators
- **Sandbox Mode**: Experiment with regex patterns in a dedicated environment

### 📚 **Pattern Library**

- **Curated Collection**: Pre-built regex patterns for common use cases
- **Difficulty Levels**: Beginner, Intermediate, and Advanced patterns
- **Search & Filter**: Find patterns by category, difficulty, or tags
- **Copy & Test**: Instantly copy patterns to your sandbox for testing

### 🔍 **Regex Analysis**

- **Pattern Breakdown**: Understand complex regex patterns component by component
- **Error Detection**: Identify and fix regex syntax errors
- **Optimization Suggestions**: Get AI-powered recommendations for improvement
- **Visual Syntax Highlighting**: Color-coded regex components for easy understanding

### 🎨 **Modern UI/UX**

- **Beautiful Design**: Modern, responsive interface with dark theme
- **Smooth Animations**: Polished interactions and transitions
- **Mobile-First**: Fully responsive design that works on all devices
- **Accessibility**: Built with accessibility best practices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/KrzysztofStaron/regex-generator-tester.git
   cd regex-generator-tester
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **AI Integration**: OpenAI API (Claude 3.5 Sonnet)
- **State Management**: React Hooks
- **Notifications**: Sonner

## 📖 Usage Guide

### 1. **Generate from Text**

The most powerful feature - create regex patterns from natural language descriptions:

1. **Describe your pattern**: Enter what you want to match (e.g., "email addresses", "phone numbers")
2. **Generate test cases**: AI creates comprehensive test cases
3. **Review and edit**: Modify test cases if needed
4. **Generate regex**: AI creates the perfect regex pattern
5. **View breakdown**: Get detailed explanation of each component

### 2. **Interactive Sandbox**

Test and experiment with regex patterns:

- **Enter regex**: Type or paste your regex pattern
- **Add test text**: Input text to test against
- **Create test cases**: Build structured test suites
- **Real-time results**: See matches and captures instantly
- **Save patterns**: Store frequently used patterns

### 3. **Pattern Library**

Browse pre-built regex patterns:

- **Browse by category**: Email, URLs, Phone numbers, etc.
- **Filter by difficulty**: Beginner to Advanced
- **Search patterns**: Find specific patterns quickly
- **Copy to sandbox**: Test patterns immediately
- **Learn from examples**: Understand how patterns work

### 4. **Analyze Regex**

Understand and improve existing patterns:

- **Paste regex**: Input any regex pattern
- **Get breakdown**: Detailed component analysis
- **Find errors**: Identify syntax issues
- **Get suggestions**: AI-powered optimization tips
- **Test patterns**: Validate against sample text

### 5. **Example-Based Generation**

Create patterns from examples:

- **Input examples**: Provide sample matches and non-matches
- **Generate pattern**: AI infers the pattern from examples
- **Test thoroughly**: Validate against your examples
- **Refine if needed**: Iterate to perfection

## 🎯 Key Features Deep Dive

### **AI-Powered Generation**

The app uses Claude 3.5 Sonnet to understand your requirements and generate precise regex patterns. The AI:

- Analyzes your description contextually
- Creates comprehensive test cases
- Generates optimized regex patterns
- Provides detailed breakdowns
- Suggests improvements

### **Intelligent Test Case Management**

- **Automatic generation**: AI creates relevant test cases
- **Manual editing**: Fine-tune test cases as needed
- **Validation**: Real-time testing against your regex
- **Results tracking**: See pass/fail status for each test
- **Quick presets**: Common test case templates

### **Visual Regex Breakdown**

- **Component highlighting**: Color-coded regex parts
- **Type classification**: Escape sequences, character classes, groups, etc.
- **Educational explanations**: Learn how each part works
- **Examples**: See what each component matches
- **Complexity assessment**: Understand pattern difficulty

### **Responsive Design**

- **Mobile-first approach**: Works perfectly on all screen sizes
- **Touch-friendly**: Optimized for mobile interactions
- **Keyboard navigation**: Full keyboard accessibility
- **Dark theme**: Easy on the eyes for extended use

## 🔧 Configuration

### Environment Variables

| Variable         | Description                         | Required |
| ---------------- | ----------------------------------- | -------- |
| `OPENAI_API_KEY` | Your OpenAI API key for AI features | Yes      |

### Customization

The app is built with Tailwind CSS and can be easily customized:

- **Colors**: Modify the color scheme in `tailwind.config.ts`
- **Components**: Customize UI components in `components/ui/`
- **Styling**: Update styles in `app/globals.css`

## 📁 Project Structure

```
regex-generator-tester/
├── app/                    # Next.js App Router
│   ├── actions.ts         # Server actions for AI integration
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main page with tab navigation
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── analyze-regex.tsx # Regex analysis component
│   ├── example-based.tsx # Example-based generation
│   ├── generate-from-text.tsx # Main generation workflow
│   ├── interactive-sandbox.tsx # Testing sandbox
│   ├── pattern-library.tsx # Pattern library
│   ├── regex-highlighter.tsx # Syntax highlighting
│   └── sidebar.tsx       # Navigation sidebar
├── lib/                  # Utility functions
│   ├── ai-service.ts     # AI integration logic
│   └── utils.ts          # Helper functions
└── public/              # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Add proper error handling
- Write meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the AI capabilities
- **Next.js team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Shadcn/ui** for the beautiful component library
- **Lucide** for the excellent icon set

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem
4. Provide your environment details

---

**Made with ❤️ for the regex community**

_Transform your regex workflow with AI-powered intelligence_
