import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Code2, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ThemeToggle } from "@/features/theme-toggle";
import { toast } from "sonner";
import {
  initiateRecoveryFlow,
  getRecoveryFlow,
  submitRecovery,
  submitRecoveryWithPassword,
  type RecoveryFlow,
} from "@/shared/lib/kratos";

const Recovery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryFlow, setRecoveryFlow] = useState<RecoveryFlow | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const flowId = searchParams.get("flow");
  const token = searchParams.get("token");

  // Initialize flow
  useEffect(() => {
    const initFlow = async () => {
      try {
        if (flowId) {
          // Get existing flow from URL
          try {
            const flow = await getRecoveryFlow(flowId);
            setRecoveryFlow(flow);
            
            // Check flow state
            if (flow.state === 'sent_email') {
              setIsEmailSent(true);
            } else if (flow.state === 'passed_challenge' && token) {
              // Ready to reset password
            }
          } catch (error) {
            // Flow expired or invalid, create new one
            const newFlow = await initiateRecoveryFlow();
            setRecoveryFlow(newFlow);
          }
        } else if (token) {
          // Token present but no flow ID - need to create flow
          // Kratos will handle token verification when we submit
          const flow = await initiateRecoveryFlow();
          setRecoveryFlow(flow);
        } else {
          // Create new recovery flow
          const flow = await initiateRecoveryFlow();
          setRecoveryFlow(flow);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initialize recovery flow");
        console.error("Failed to initialize recovery flow:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initFlow();
  }, [flowId, token]);

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryFlow) {
      toast.error("Recovery flow not initialized");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const updatedFlow = await submitRecovery(recoveryFlow, trimmedEmail);
      setRecoveryFlow(updatedFlow);
      setIsEmailSent(true);
      toast.success("Recovery email sent! Please check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send recovery email");
      
      // If flow expired, try to get new flow
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes('expired') || errorMessage.includes('flow')) {
        try {
          const newFlow = await initiateRecoveryFlow();
          setRecoveryFlow(newFlow);
        } catch (e) {
          console.error("Failed to refresh recovery flow:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryFlow || !token) {
      toast.error("Recovery flow or token not found");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await submitRecoveryWithPassword(recoveryFlow, token, newPassword);
      setIsPasswordReset(true);
      toast.success("Password reset successfully! You can now login with your new password.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
      
      // If flow expired, try to get new flow
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes('expired') || errorMessage.includes('flow')) {
        try {
          const newFlow = await initiateRecoveryFlow();
          setRecoveryFlow(newFlow);
        } catch (e) {
          console.error("Failed to refresh recovery flow:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <KeyRound className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been reset. You can now login with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate("/auth")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEmailSent || (token && recoveryFlow)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code2 className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold">CodeType</h1>
            </div>
            <p className="text-muted-foreground">Reset your password</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                Enter your new password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="text-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">CodeType</h1>
          </div>
          <p className="text-muted-foreground">Recover your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Account Recovery</CardTitle>
            <CardDescription className="text-center">
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Recovery Email
                  </>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => navigate("/auth")}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Recovery;

