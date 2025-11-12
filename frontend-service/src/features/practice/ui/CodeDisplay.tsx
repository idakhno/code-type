import { cn } from "@/shared/lib/utils";
import { practiceModel } from "@/entities/practice";

interface CodeDisplayProps {
  code: string;
  language: practiceModel.PracticeLanguage;
  currentIndex: number;
  errors: Set<number>;
}

export const CodeDisplay = ({ code, language, currentIndex, errors }: CodeDisplayProps) => {
  const characters = Array.from(code);

  const renderCodeWithHighlight = () => {
    return characters.map((char, index) => {
      const isCurrent = index === currentIndex;
      const isTyped = index < currentIndex;
      const isError = errors.has(index);
      const isNewline = char === "\n";

      const className = cn(
        "relative whitespace-pre",
        isTyped &&
          (isError ? "bg-destructive/20 text-destructive" : "text-muted-foreground"),
        isCurrent && "code-cursor",
      );

      if (isNewline) {
        return (
          <span key={index} className={className}>
            {isCurrent && <span aria-hidden className="typing-caret" />}
            {"\n"}
          </span>
        );
      }

      const displayChar =
        char === " " ? "\u00A0" : char === "\t" ? "\t" : char;

      return (
        <span key={index} className={className}>
          {isCurrent && <span aria-hidden className="typing-caret" />}
          {displayChar}
        </span>
      );
    });
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-[hsl(var(--code-bg))]">
      <pre className="relative p-6 bg-transparent whitespace-pre-wrap">
        <code
          className="font-mono text-base leading-relaxed text-foreground"
          style={{ tabSize: language === "go" ? 4 : 2 }}
        >
          {renderCodeWithHighlight()}
          {currentIndex === characters.length && (
            <span className="code-cursor">
              <span aria-hidden className="typing-caret" />
              {"\u00A0"}
            </span>
          )}
        </code>
      </pre>
    </div>
  );
};
