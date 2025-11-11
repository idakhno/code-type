import { Route, Routes } from "react-router-dom";
import Auth from "@/pages/Auth";
import History from "@/pages/History";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Practice from "@/pages/Practice";

export const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/history" element={<History />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

