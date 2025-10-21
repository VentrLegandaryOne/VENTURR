import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Import from "./pages/Import";
import Export from "./pages/Export";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Calculator from "./pages/CalculatorEnhanced";
import QuoteGenerator from "./pages/QuoteGenerator";
import SiteMeasurement from "./pages/SiteMeasurement";
import Profile from "./pages/Profile";
import OrganizationSettings from "./pages/OrganizationSettings";
import { lazy, Suspense } from "react";

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/projects"} component={Projects} />
        <Route path={"/projects/new"} component={NewProject} />
        <Route path={"/projects/:id"} component={ProjectDetail} />
        <Route path={"/projects/:id/calculator"} component={Calculator} />
        <Route path={"/projects/:id/quote"} component={QuoteGenerator} />
        <Route path={"/projects/:id/measure"} component={SiteMeasurement} />
        <Route path={"/settings/profile"} component={Profile} />
        <Route path={"/settings/organization"} component={OrganizationSettings} />
        <Route path={"/import"} component={Import} />
      <Route path={"/export"} component={Export} />
      <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
