import { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import Auth from "@/pages/Auth";
import History from "@/pages/History";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Practice from "@/pages/Practice";
import Verification from "@/pages/Verification";
import Recovery from "@/pages/Recovery";
import Settings from "@/pages/Settings";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const AppRoutes = (): ReactElement => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/recovery" element={<Recovery />} />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

