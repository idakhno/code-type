import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./providers/app-providers";
import { AppRoutes } from "./routes";

export const App = (): JSX.Element => {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
};

