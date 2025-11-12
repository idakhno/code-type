import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Code2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ThemeToggle } from "@/features/theme-toggle";
import { toast } from "sonner";
import { useAuth } from "@/shared/hooks/use-auth";
import {
  initiateVerificationFlow,
  getVerificationFlow,
  submitVerification,
  type VerificationFlow,
} from "@/shared/lib/kratos";

const Verification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, session, refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const flowId = searchParams.get("flow");
  const token = searchParams.get("token");

  // Initialize flow
  useEffect(() => {
    const initFlow = async () => {
      try {
        if (flowId) {
          // Get existing flow from URL
          try {
            const flow = await getVerificationFlow(flowId);
            setVerificationFlow(flow);
            
            // If token is present and flow is ready, verification is already complete
            if (token && flow.state === 'passed_challenge') {
              setIsSuccess(true);
              await refreshSession();
            }
          } catch (error) {
            // Flow expired or invalid, create new one
            const newFlow = await initiateVerificationFlow();
            setVerificationFlow(newFlow);
          }
        } else if (token) {
          // Token present but no flow ID - need to create flow with token
          // Kratos will handle token verification when we submit
          const flow = await initiateVerificationFlow();
          setVerificationFlow(flow);
        } else {
          // Create new verification flow
          const flow = await initiateVerificationFlow();
          setVerificationFlow(flow);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initialize verification flow");
        console.error("Failed to initialize verification flow:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initFlow();
  }, [flowId, token, refreshSession]);

  const handleVerifyEmail = async () => {
    if (!verificationFlow) {
      toast.error("Verification flow not initialized");
      return;
    }

    // If token is present, we're verifying from email link
    if (token) {
      setIsLoading(true);
      try {
        // Submit verification with token in query parameter
        await submitVerification(verificationFlow, undefined, token);
        setIsSuccess(true);
        toast.success("Email verified successfully!");
        await refreshSession();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to verify email");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise, request verification email
    const emailToVerify = email.trim() || session?.identity.traits.email || "";
    if (!emailToVerify) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await submitVerification(verificationFlow, emailToVerify);
      setIsEmailSent(true);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send verification email");
      
      // If flow expired, try to get new flow
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes('expired') || errorMessage.includes('flow')) {
        try {
          const newFlow = await initiateVerificationFlow();
          setVerificationFlow(newFlow);
        } catch (e) {
          console.error("Failed to refresh verification flow:", e);
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate(isAuthenticated ? "/practice" : "/auth")}
              className="w-full"
            >
              {isAuthenticated ? "Go to Practice" : "Go to Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-primary" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address. Please click the link to verify your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
            <Button
              onClick={() => {
                setIsEmailSent(false);
                setVerificationFlow(null);
                setIsInitializing(true);
                initiateVerificationFlow().then(flow => {
                  setVerificationFlow(flow);
                  setIsInitializing(false);
                });
              }}
              variant="link"
              className="w-full"
            >
              Resend Verification Email
            </Button>
          </CardContent>
        </Card>
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
          <p className="text-muted-foreground">Verify your email address</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Email Verification</CardTitle>
            <CardDescription className="text-center">
              Enter your email address to receive a verification link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyEmail();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="verification-email">Email</Label>
                <Input
                  id="verification-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  defaultValue={session?.identity.traits.email || ""}
                />
                {session?.identity.traits.email && (
                  <p className="text-sm text-muted-foreground">
                    Using email from your account: {session.identity.traits.email}
                  </p>
                )}
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
                    Send Verification Email
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
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;

