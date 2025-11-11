import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, LogOut, History, Pause, Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/features/theme-toggle";
import { CodeDisplay, StatsPanel } from "@/features/practice";
import { practiceModel } from "@/entities/practice";
import { practiceSessionModel } from "@/processes/practice-session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "sonner";

const Practice = () => {
  const navigate = useNavigate();
  const session = practiceSessionModel.usePracticeSession();
  const { lastResult, clearLastResult } = session;

  useEffect(() => {
    if (lastResult) {
      toast.success("Test completed!", {
        description: `${lastResult.wpm} WPM | ${lastResult.accuracy}% accuracy`,
      });
      clearLastResult();
    }
  }, [lastResult, clearLastResult]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">CodeType</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/history")}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                value={session.language}
                onValueChange={(val) =>
                  session.changeLanguage(val as practiceModel.PracticeLanguage)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                </SelectContent>
              </Select>
              
              {!session.isStarted && !session.isFinished && (
                <Button
                  onClick={() => {
                    if (session.start()) {
                      toast.info("Test started! Start typing...");
                    }
                  }}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Test
                </Button>
              )}
              
              {session.isStarted && !session.isFinished && (
                <>
                  <Button
                    onClick={() => {
                      const paused = session.togglePause();
                      toast.info(paused ? "Test paused" : "Test resumed");
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    {session.isPaused ? (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      session.restart();
                      toast.info("Test restarted!");
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restart
                  </Button>
                  <Button
                    onClick={() => {
                      if (session.stop()) {
                        toast.info("Test stopped");
                      }
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </>
              )}
              
              {session.isFinished && (
                <Button onClick={session.newTest} variant="outline" className="gap-2">
                  New Test
                </Button>
              )}
            </div>
          </div>

          <StatsPanel
            wpm={session.wpm}
            accuracy={session.accuracy}
            errors={session.errors.size}
            timeElapsed={session.timeElapsed}
          />

          <CodeDisplay
            code={session.snippet}
            language={session.language}
            currentIndex={session.currentIndex}
            errors={session.errors}
          />

          {!session.isStarted && (
            <div className="text-center text-muted-foreground">
              <p>Press "Start Test" to begin typing</p>
            </div>
          )}

          {session.isPaused && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Test Paused</h2>
              <p className="text-muted-foreground">Press "Resume" to continue</p>
            </div>
          )}

          {session.isFinished && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Test Complete!</h2>
              <p className="text-muted-foreground">Great job! Try another snippet to improve your skills.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Practice;

