import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Code2, User, KeyRound, Mail, Save, Eye, EyeOff, Globe, Calendar, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ThemeToggle } from "@/features/theme-toggle";
import { toast } from "sonner";
import { useAuth } from "@/shared/hooks/use-auth";
import {
  initiateSettingsFlow,
  getSettingsFlow,
  updateProfile,
  changePassword,
  type SettingsFlow,
} from "@/shared/lib/kratos";

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, refreshSession } = useAuth();
  const [settingsFlow, setSettingsFlow] = useState<SettingsFlow | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Profile fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  
  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const flowId = searchParams.get("flow");

  // Initialize flow
  useEffect(() => {
    const initFlow = async () => {
      try {
        if (flowId) {
          // Get existing flow from URL
          try {
            const flow = await getSettingsFlow(flowId);
            setSettingsFlow(flow);
            // Pre-fill form with current identity data
            if (flow.identity) {
              const traits = flow.identity.traits;
              setEmail(traits.email || "");
              setFirstName(traits.name?.first || "");
              setLastName(traits.name?.last || "");
              setBirthdate(traits.birthdate || "");
              setBio(traits.bio || "");
              setWebsite(traits.website || "");
            }
          } catch (error) {
            // Flow expired or invalid, create new one
            const newFlow = await initiateSettingsFlow();
            setSettingsFlow(newFlow);
            if (newFlow.identity) {
              const traits = newFlow.identity.traits;
              setEmail(traits.email || "");
              setFirstName(traits.name?.first || "");
              setLastName(traits.name?.last || "");
              setBirthdate(traits.birthdate || "");
              setBio(traits.bio || "");
              setWebsite(traits.website || "");
            }
          }
        } else {
          // Create new settings flow
          const flow = await initiateSettingsFlow();
          setSettingsFlow(flow);
          if (flow.identity) {
            const traits = flow.identity.traits;
            setEmail(traits.email || "");
            setFirstName(traits.name?.first || "");
            setLastName(traits.name?.last || "");
            setBirthdate(traits.birthdate || "");
            setBio(traits.bio || "");
            setWebsite(traits.website || "");
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initialize settings flow");
        console.error("Failed to initialize settings flow:", error);
        navigate("/auth");
      } finally {
        setIsInitializing(false);
      }
    };
    initFlow();
  }, [flowId, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settingsFlow) {
      toast.error("Settings flow not initialized");
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedBirthdate = birthdate.trim();
    const trimmedBio = bio.trim();
    const trimmedWebsite = website.trim();

    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      const traits: any = {
        email: trimmedEmail,
      };

      // Add name if at least first name is provided
      if (trimmedFirstName || trimmedLastName) {
        traits.name = {};
        if (trimmedFirstName) {
          traits.name.first = trimmedFirstName;
        }
        if (trimmedLastName) {
          traits.name.last = trimmedLastName;
        }
      }

      // Add optional fields
      if (trimmedBirthdate) {
        traits.birthdate = trimmedBirthdate;
      }
      if (trimmedBio) {
        traits.bio = trimmedBio;
      }
      if (trimmedWebsite) {
        traits.website = trimmedWebsite;
      }

      const updatedFlow = await updateProfile(settingsFlow, traits);
      setSettingsFlow(updatedFlow);
      
      // Update local state with returned identity
      if (updatedFlow.identity) {
        const updatedTraits = updatedFlow.identity.traits;
        setEmail(updatedTraits.email || "");
        setFirstName(updatedTraits.name?.first || "");
        setLastName(updatedTraits.name?.last || "");
        setBirthdate(updatedTraits.birthdate || "");
        setBio(updatedTraits.bio || "");
        setWebsite(updatedTraits.website || "");
      }
      
      await refreshSession();
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
      
      // If flow expired, try to get new flow
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes('expired') || errorMessage.includes('flow')) {
        try {
          const newFlow = await initiateSettingsFlow();
          setSettingsFlow(newFlow);
          if (newFlow.identity) {
            const traits = newFlow.identity.traits;
            setEmail(traits.email || "");
            setFirstName(traits.name?.first || "");
            setLastName(traits.name?.last || "");
            setBirthdate(traits.birthdate || "");
            setBio(traits.bio || "");
            setWebsite(traits.website || "");
          }
        } catch (e) {
          console.error("Failed to refresh settings flow:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settingsFlow) {
      toast.error("Settings flow not initialized");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    setIsLoading(true);
    try {
      const updatedFlow = await changePassword(settingsFlow, newPassword);
      setSettingsFlow(updatedFlow);
      setNewPassword("");
      toast.success("Password changed successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
      
      // If flow expired, try to get new flow
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes('expired') || errorMessage.includes('flow')) {
        try {
          const newFlow = await initiateSettingsFlow();
          setSettingsFlow(newFlow);
        } catch (e) {
          console.error("Failed to refresh settings flow:", e);
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/practice")}>
              Back to Practice
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="settings-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="settings-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          autoComplete="email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settings-birthdate" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date of Birth
                        </Label>
                        <Input
                          id="settings-birthdate"
                          type="date"
                          value={birthdate}
                          onChange={(e) => setBirthdate(e.target.value)}
                          disabled={isLoading}
                          autoComplete="bday"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="settings-first-name">First Name</Label>
                        <Input
                          id="settings-first-name"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={isLoading}
                          autoComplete="given-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settings-last-name">Last Name</Label>
                        <Input
                          id="settings-last-name"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={isLoading}
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="settings-website" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      <Input
                        id="settings-website"
                        type="url"
                        placeholder="https://example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        disabled={isLoading}
                        autoComplete="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="settings-bio" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Biography
                      </Label>
                      <Textarea
                        id="settings-bio"
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={isLoading}
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        {bio.length}/500 characters
                      </p>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                      {isLoading ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="settings-new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="settings-new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isLoading}
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;

