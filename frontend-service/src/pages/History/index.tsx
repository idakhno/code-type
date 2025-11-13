import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  ArrowLeft,
  Trash2,
  TrendingUp,
  AlertTriangle,
  History as HistoryIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/features/theme-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Card } from "@/shared/ui/card";
import { toast } from "sonner";
import { historyModel } from "@/entities/history";

const getErrorMessage = (message?: string | null) => {
  if (!message) {
    return "Something went wrong while loading your history. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  if (normalized.includes("failed to load history")) {
    return "We couldn't load your history right now. Please try again.";
  }

  return message;
};

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<historyModel.HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const entries = await historyModel.getHistory();
      setHistory(entries);
    } catch (error) {
      console.error("Failed to load history:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load history. Please try again.";
      const userMessage = getErrorMessage(message);
      setErrorMessage(userMessage);
      toast.error(userMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const clearHistory = useCallback(async () => {
    if (history.length === 0) {
      return;
    }
    setIsClearing(true);
    try {
      await historyModel.clearHistory();
      setHistory([]);
      toast.success("History cleared");
    } catch (error) {
      console.error("Failed to clear history:", error);
      const message = error instanceof Error ? error.message : "Failed to clear history";
      toast.error(message);
    } finally {
      setIsClearing(false);
    }
  }, [history.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const avgWpm =
    history.length > 0
      ? Math.round(history.reduce((sum, entry) => sum + entry.wpm, 0) / history.length)
      : 0;

  const avgAccuracy =
    history.length > 0
      ? Math.round(history.reduce((sum, entry) => sum + entry.accuracy, 0) / history.length)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/practice")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Typing History</h1>
            </div>
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {errorMessage && history.length > 0 && (
            <Card className="border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadHistory()}
                disabled={isLoading}
              >
                Retry
              </Button>
            </Card>
          )}

          {history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Avg WPM</p>
                    <p className="text-2xl font-bold text-primary">{avgWpm}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                    <p className="text-2xl font-bold text-green-500">{avgAccuracy}%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Tests</p>
                    <p className="text-2xl font-bold">{history.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {history.length > 0 ? (
            <>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void clearHistory()}
                  className="gap-2"
                  disabled={isClearing}
                >
                  <Trash2 className="h-4 w-4" />
                  {isClearing ? "Clearing..." : "Clear History"}
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>WPM</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                            {entry.language}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {entry.wpm}
                        </TableCell>
                        <TableCell className="font-semibold text-green-500">
                          {entry.accuracy}%
                        </TableCell>
                        <TableCell className="text-destructive">
                          {entry.errors}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTime(entry.time)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : errorMessage ? (
            <Card className="p-12 text-center space-y-4">
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">Unable to load history</h2>
                <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => void loadHistory()}
                  disabled={isLoading}
                >
                  Retry
                </Button>
                <Button onClick={() => navigate("/practice")}>Go To Practice</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center space-y-4">
              <HistoryIcon className="mx-auto h-10 w-10 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">No typing history yet</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your first test to see your progress over time.
                </p>
              </div>
              <Button onClick={() => navigate("/practice")}>Start Your First Test</Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;

