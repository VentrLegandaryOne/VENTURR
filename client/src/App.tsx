import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";

// MINIMAL APPLE-STYLE INTERFACE
import HomeMinimal from "./pages/HomeMinimal"; // Clean, minimal landing page
import LoginMinimal from "./pages/LoginMinimal"; // Centered login card
import DashboardMinimal from "./pages/DashboardMinimal"; // Dashboard with sidebar
import ProjectFlow from "./pages/ProjectFlow"; // Project flow with pill stepper
// Original pages kept for reference
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardEnhanced = lazy(() => import("./pages/DashboardEnhanced"));
const NewProject = lazy(() => import("./pages/NewProject"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const CalculatorEnhanced = lazy(() => import("./pages/CalculatorEnhanced"));
const QuoteGenerator = lazy(() => import("./pages/QuoteGenerator"));
const LeafletSiteMeasurement = lazy(() => import("./pages/LeafletSiteMeasurement"));
const Profile = lazy(() => import("./pages/Profile"));
const OrganizationSettings = lazy(() => import("./pages/OrganizationSettings"));
const MaterialsLibrary = lazy(() => import("./pages/MaterialsLibrary"));
const Pricing = lazy(() => import("./pages/Pricing"));
// Settings temporarily removed
const Compliance = lazy(() => import("./pages/Compliance"));
const Clients = lazy(() => import("./pages/Clients"));
const ProjectInputForm = lazy(() => import("./pages/ProjectInputForm"));
const DeliverablesDashboard = lazy(() => import("./pages/DeliverablesDashboard"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));

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
      <Route path="/login" component={LoginMinimal} />
      <Switch>
        {/* Public Routes */}
        <Route path={"/"} component={HomeMinimal} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/client-portal"} component={ClientPortal} />

        {/* Core Dashboard */}
        <Route path={"/dashboard"} component={DashboardMinimal} />

        {/* Project Management */}
        <Route path={"/projects"} component={Projects} />
        <Route path={"/projects/new"} component={NewProject} />
        <Route path={"/projects/:id"} component={ProjectFlow} />
        <Route path={"/projects/:id/detail"} component={ProjectDetail} />

        {/* Project Workflows */}
        <Route path="/projects/:id/compliance" component={Compliance} />
        <Route path="/projects/:id/measure" component={LeafletSiteMeasurement} />
        <Route path="/projects/:id/calculator" component={CalculatorEnhanced} />
        <Route path="/projects/:id/quote" component={QuoteGenerator} />

        {/* Intelligence System */}
        <Route path={"/project-input-form"} component={ProjectInputForm} />
        <Route path={"/deliverables/:id"} component={DeliverablesDashboard} />

        {/* Client Management */}
        <Route path={"/clients"} component={Clients} />

        {/* Settings temporarily disabled */}
        <Route path={"/settings/profile"} component={Profile} />
        <Route path={"/settings/organization"} component={OrganizationSettings} />

        {/* Materials Library */}
        <Route path="/materials" component={MaterialsLibrary} />

        {/* 404 */}
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

