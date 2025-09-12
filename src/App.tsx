import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import FocusMode from "./pages/FocusMode";
import Planner from "./pages/Planner";
import Analytics from "./pages/Analytics";
import Leaderboards from "./pages/Leaderboards";
import Settings from "./pages/Settings";
import AdminHub from "./pages/AdminHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="focus" element={<FocusMode />} />
            <Route path="focus/:topicId" element={<FocusMode />} />
            <Route path="planner" element={<Planner />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="leaderboards" element={<Leaderboards />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={<AdminHub />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </Provider>
);

export default App;
