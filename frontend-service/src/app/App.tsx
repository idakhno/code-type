import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./providers/app-providers";
import { AppRoutes } from "./routes";
import { AuthProvider } from "@/shared/hooks/use-auth";

export const App = (): JSX.Element => {
  return (
    <AppProviders>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </AppProviders>
  );
};

