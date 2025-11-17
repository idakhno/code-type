import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Code2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ThemeToggle } from "@/features/theme-toggle";
import { toast } from "sonner";
import { useAuth } from "@/shared/hooks/use-auth";
import { 
  initiateLoginFlow, 
  initiateRegistrationFlow, 
  submitLogin, 
  submitRegistration,
  getLoginFlow,
  getRegistrationFlow,
  type LoginFlow,
  type RegistrationFlow,
} from "@/shared/lib/kratos";

type LocationState = {
  from?: Location;
  via?: string;
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, refreshSession } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginFlow, setLoginFlow] = useState<LoginFlow | null>(null);
  const [registrationFlow, setRegistrationFlow] = useState<RegistrationFlow | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const locationState = location.state as LocationState | null;
  const getReturnPath = () => {
    if (locationState?.via === "logout") {
      return "/practice";
    }
    return locationState?.from?.pathname || "/practice";
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getReturnPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, locationState]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsInitializing(false);
      return;
    }

    let isActive = true;
    const initFlows = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const flowId = urlParams.get('flow');

        if (flowId) {
          try {
            const flow = await getLoginFlow(flowId);
            if (!isActive) return;
            setLoginFlow(flow);
            const regFlow = await initiateRegistrationFlow();
            if (!isActive) return;
            setRegistrationFlow(regFlow);
          } catch (error) {
            try {
              const flow = await getRegistrationFlow(flowId);
              if (!isActive) return;
              setRegistrationFlow(flow);
              const loginFlow = await initiateLoginFlow();
              if (!isActive) return;
              setLoginFlow(loginFlow);
            } catch (error2) {
              const [loginFlowData, regFlowData] = await Promise.all([
                initiateLoginFlow(),
                initiateRegistrationFlow(),
              ]);
              if (!isActive) return;
              setLoginFlow(loginFlowData);
              setRegistrationFlow(regFlowData);
            }
          }
        } else {
          const [loginFlowData, regFlowData] = await Promise.all([
            initiateLoginFlow(),
            initiateRegistrationFlow(),
          ]);
          if (!isActive) return;
          setLoginFlow(loginFlowData);
          setRegistrationFlow(regFlowData);
        }
      } catch (error) {
        if (!isActive) return;
        toast.error(error instanceof Error ? error.message : "Failed to initialize flows");
        console.error("Failed to initialize flows:", error);
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    };

    initFlows();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    let currentFlow = loginFlow;
    if (!currentFlow) {
      setIsLoading(true);
      try {
        currentFlow = await initiateLoginFlow();
        setLoginFlow(currentFlow);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initiate login flow");
        setIsLoading(false);
        return;
      }
    }

    if (new Date(currentFlow.expires_at) < new Date()) {
      setIsLoading(true);
      try {
        currentFlow = await initiateLoginFlow();
        setLoginFlow(currentFlow);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initiate login flow");
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      await submitLogin(currentFlow, trimmedEmail, loginPassword);
      await refreshSession();
      setLoginPassword("");
      toast.success("Logged in successfully!");
      navigate(getReturnPath(), { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      
      if (errorMessage.includes('expired') || errorMessage.includes('flow')) {
        try {
          const newFlow = await initiateLoginFlow();
          setLoginFlow(newFlow);
        } catch (e) {
          console.error("Failed to refresh login flow:", e);
        }
      }
      
      setLoginPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = signupEmail.trim();
    
    if (!trimmedEmail || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    let currentFlow = registrationFlow;
    if (!currentFlow) {
      setIsLoading(true);
      try {
        currentFlow = await initiateRegistrationFlow();
        setRegistrationFlow(currentFlow);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initiate registration flow");
        setIsLoading(false);
        return;
      }
    }

    if (new Date(currentFlow.expires_at) < new Date()) {
      setIsLoading(true);
      try {
        currentFlow = await initiateRegistrationFlow();
        setRegistrationFlow(currentFlow);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initiate registration flow");
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await submitRegistration(currentFlow, trimmedEmail, signupPassword);
      await refreshSession();
      setSignupPassword("");
      setSignupEmail("");
      
      if (response.continue_with && response.continue_with.length > 0) {
        const verificationFlow = response.continue_with.find(cw => cw.action === 'show_verification_ui');
        if (verificationFlow?.flow) {
          toast.success("Account created! Please verify your email.");
          navigate(`/verification?flow=${verificationFlow.flow.id}`, { replace: true });
          return;
        }
      }
      
      toast.success("Account created successfully!");
      navigate("/practice", { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
      
      if (errorMessage.includes('expired') || errorMessage.includes('flow')) {
        try {
          const newFlow = await initiateRegistrationFlow();
          setRegistrationFlow(newFlow);
        } catch (e) {
          console.error("Failed to refresh registration flow:", e);
        }
      }
      
      setSignupPassword("");
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
          <p className="text-muted-foreground">Master programming through typing</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="********"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pr-10"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  <div className="mt-4 text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => navigate("/recovery")}
                      className="text-sm"
                    >
                      Forgot password?
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Create account</CardTitle>
                <CardDescription>Get started with CodeType today</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="********"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pr-10"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                        disabled={isLoading}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
