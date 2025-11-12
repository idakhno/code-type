const codeSnippets = {
  javascript: [
    `function greet(name) {
  return \`Hello, \${name}!\`;
}

const user = {
  firstName: "John",
  lastName: "Doe",
};

console.log(greet(user.firstName));`,
    `const debounce = (func, delay) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};`,
    `class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(listener);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(data));
    }
  }
}`,
  ],
  python: [
    `def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence


print(fibonacci(10))`,
    `def flatten_list(nested_list):
    result = []
    for item in nested_list:
        if isinstance(item, list):
            result.extend(flatten_list(item))
        else:
            result.append(item)
    return result`,
    `class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None

    def is_empty(self):
        return len(self.items) == 0`,
  ],
  go: [
    `package main

import "fmt"

func main() {
\tnums := []int{1, 2, 3, 4, 5}
\tsum := 0
\tfor _, num := range nums {
\t\tsum += num
\t}
\tfmt.Println("Sum:", sum)
}`,
    `package main

import "fmt"

func Fibonacci(n int) []int {
\tsequence := []int{0, 1}
\tfor len(sequence) < n {
\t\tnext := sequence[len(sequence)-1] + sequence[len(sequence)-2]
\t\tsequence = append(sequence, next)
\t}
\treturn sequence
}

func main() {
\tfmt.Println(Fibonacci(10))
}`,
    `package main

import (
\t"fmt"
\t"time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
\tfor job := range jobs {
\t\tfmt.Printf("worker %d processing job %d", id, job)
\t\ttime.Sleep(100 * time.Millisecond)
\t\tresults <- job * 2
\t}
}

func main() {
\tjobs := make(chan int, 5)
\tresults := make(chan int, 5)

\tfor w := 1; w <= 3; w++ {
\t\tgo worker(w, jobs, results)
\t}

\tfor j := 1; j <= 5; j++ {
\t\tjobs <- j
\t}
\tclose(jobs)

\tfor a := 1; a <= 5; a++ {
\t\tfmt.Println(<-results)
\t}
}`,
  ],
} as const;

type Language = keyof typeof codeSnippets;

const getRandomSnippet = (language: Language): string => {
  const snippets = codeSnippets[language];
  const randomIndex = Math.floor(Math.random() * snippets.length);
  return snippets[randomIndex] ?? "";
};

const getInitialSnippet = (language: Language): string => {
  const snippets = codeSnippets[language];
  return snippets[0] ?? "";
};

export { codeSnippets, getRandomSnippet, getInitialSnippet };
export type { Language };

