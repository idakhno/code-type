import { useEffect, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorState, Extension } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";

import { practiceModel } from "@/entities/practice";

interface TypingEditorProps {
  code: string;
  language: practiceModel.PracticeLanguage;
  currentIndex: number;
  errors: Set<number>;
  isActive: boolean;
  onInput: (char: string) => void;
}

const baseTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    height: "100%",
  },
  ".cm-content": {
    fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
    minHeight: "100%",
  },
  ".cm-line": {
    padding: "0",
    lineHeight: "1.7",
  },
  ".cm-gutters": {
    display: "none",
  },
  ".cm-scroller": {
    overflow: "hidden",
  },
});

class CaretWidget extends WidgetType {
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-typing-caret";
    span.textContent = "\u00A0";
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

const caretWidget = Decoration.widget({
  widget: new CaretWidget(),
  side: 1,
});

const typedDecoration = Decoration.mark({
  class: "cm-typed",
});

const errorDecoration = Decoration.mark({
  class: "cm-error-char",
});

const typingDecorations = (currentIndex: number, errors: Set<number>, code: string): Extension =>
  EditorView.decorations.compute([], () => {
    const ranges: { from: number; to: number; decoration: Decoration }[] = [];

    if (currentIndex > 0) {
      ranges.push({
        from: 0,
        to: Math.min(currentIndex, code.length),
        decoration: typedDecoration,
      });
    }

    Array.from(errors)
      .filter((index) => index < code.length)
      .sort((a, b) => a - b)
      .forEach((index) => {
        ranges.push({
          from: index,
          to: index + 1,
          decoration: errorDecoration,
        });
      });

    const caretPosition = Math.min(currentIndex, code.length);
    ranges.push({
      from: caretPosition,
      to: caretPosition,
      decoration: caretWidget,
    });

    return Decoration.set(
      ranges.map(({ from, to, decoration }) => decoration.range(from, to)),
      true,
    );
  });

export const TypingEditor = ({
  code,
  language,
  currentIndex,
  errors,
  isActive,
  onInput,
}: TypingEditorProps) => {
  const extensions = useMemo(() => {
    const baseExtensions: Extension[] = [
      EditorState.readOnly.of(true),
      indentUnit.of(language === "go" ? "\t" : "  "),
      baseTheme,
      EditorView.lineWrapping,
      typingDecorations(currentIndex, errors, code),
    ];

    return baseExtensions;
  }, [code, currentIndex, errors, language]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!isActive) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        event.preventDefault();
        return;
      }

      let inputChar = event.key;

      if (inputChar === "Shift") {
        event.preventDefault();
        return;
      }

      if (inputChar === "Enter") {
        event.preventDefault();
        inputChar = "\n";
      } else if (inputChar === "Tab") {
        event.preventDefault();
        inputChar = "\t";
      } else if (inputChar.length !== 1) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      onInput(inputChar);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, onInput]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-[hsl(var(--code-bg))]">
      <CodeMirror
        value={code}
        height="100%"
        extensions={[
          ...extensions,
          EditorView.editable.of(false),
          EditorState.tabSize.of(language === "go" ? 4 : 2),
        ]}
        basicSetup={false}
        className="cm-typing-editor"
      />
    </div>
  );
};
