"use client";

import { useMemo } from "react";

interface RegexHighlighterProps {
  pattern: string;
  className?: string;
}

interface Token {
  text: string;
  type: "literal" | "character-class" | "quantifier" | "group" | "assertion" | "alternation" | "escape";
  color: string;
}

export function RegexHighlighter({ pattern, className = "" }: RegexHighlighterProps) {
  const tokens = useMemo(() => {
    const result: Token[] = [];
    let i = 0;

    while (i < pattern.length) {
      const char = pattern[i];
      const nextChar = pattern[i + 1];

      // Escapes
      if (char === "\\" && nextChar) {
        result.push({
          text: char + nextChar,
          type: "escape",
          color: "#14b8a6", // teal
        });
        i += 2;
        continue;
      }

      // Character classes
      if (char === "[") {
        let bracketContent = char;
        i++;
        while (i < pattern.length && pattern[i] !== "]") {
          bracketContent += pattern[i];
          i++;
        }
        if (i < pattern.length) {
          bracketContent += pattern[i];
          result.push({
            text: bracketContent,
            type: "character-class",
            color: "#3b82f6", // blue
          });
        } else {
          result.push({
            text: bracketContent,
            type: "literal",
            color: "#aaa", // neutral gray
          });
        }
        i++;
        continue;
      }

      // Groups
      if (char === "(") {
        let groupContent = char;
        let depth = 1;
        i++;
        while (i < pattern.length && depth > 0) {
          if (pattern[i] === "(") depth++;
          if (pattern[i] === ")") depth--;
          groupContent += pattern[i];
          i++;
        }
        result.push({
          text: groupContent,
          type: "group",
          color: "#8b5cf6", // purple
        });
        continue;
      }

      // Quantifiers
      if (char === "*" || char === "+" || char === "?") {
        result.push({
          text: char,
          type: "quantifier",
          color: "#f59e0b", // orange
        });
        i++;
        continue;
      }

      // Quantifier ranges
      if (char === "{") {
        let quantifierContent = char;
        i++;
        while (i < pattern.length && pattern[i] !== "}") {
          quantifierContent += pattern[i];
          i++;
        }
        if (i < pattern.length) {
          quantifierContent += pattern[i];
          result.push({
            text: quantifierContent,
            type: "quantifier",
            color: "#f59e0b", // orange
          });
        } else {
          result.push({
            text: quantifierContent,
            type: "literal",
            color: "#aaa", // neutral gray
          });
        }
        i++;
        continue;
      }

      // Assertions
      if (char === "^" || char === "$" || char === "\\b" || char === "\\B") {
        result.push({
          text: char,
          type: "assertion",
          color: "#f43f5e", // red
        });
        i++;
        continue;
      }

      // Alternation
      if (char === "|") {
        result.push({
          text: char,
          type: "alternation",
          color: "#10b981", // green
        });
        i++;
        continue;
      }

      // Literals
      result.push({
        text: char,
        type: "literal",
        color: "#aaa", // neutral gray
      });
      i++;
    }

    return result;
  }, [pattern]);

  return (
    <code className={`font-mono text-sm ${className}`}>
      {tokens.map((token, index) => (
        <span key={index} style={{ color: token.color }}>
          {token.text}
        </span>
      ))}
    </code>
  );
}
