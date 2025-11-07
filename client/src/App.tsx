import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";

// Lazy load all route components for optimal bundle splitting
const Home = lazy(() => import("./pages/Home"));
const Import = lazy(() => import("./pages/Import"));
const Export = lazy(() => import("./pages/Export"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewProject = lazy(() => import("./pages/NewProject"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const CalculatorEnhanced = lazy(() => import("./pages/CalculatorEnhanced"));
const CalculatorEnhancedLabor = lazy(() => import("./pages/CalculatorEnhancedLabor"));
const QuoteGenerator = lazy(() => import("./pages/QuoteGenerator"));
const SiteMeasurement = lazy(() => import("./pages/SiteMeasurement"));
const MapboxSiteMeasurement = lazy(() => import("./pages/MapboxSiteMeasurement"));
const LeafletSiteMeasurement = lazy(() => import("./pages/LeafletSiteMeasurement"));
const Profile = lazy(() => import("./pages/Profile"));
const OrganizationSettings = lazy(() => import("./pages/OrganizationSettings"));
const MaterialsLibrary = lazy(() => import("./pages/MaterialsLibrary"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Settings = lazy(() => import("./pages/Settings"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Clients = lazy(() => import("./pages/Clients"));
const AdminMonitoring = lazy(() => import("./pages/AdminMonitoring"));

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
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/clients"} component={Clients} />
      <Route path="/projects/:id/compliance" component={Compliance} />
      <Route path="/projects/:id/measure" component={LeafletSiteMeasurement} />
      <Route path="/projects/:id/measure-legacy" component={SiteMeasurement} />
      <Route path="/projects/:id/calculator" component={CalculatorEnhanced} />
      <Route path="/projects/:id/calculator-labor" component={CalculatorEnhancedLabor} />
      <Route path="/projects/:id/quote" component={QuoteGenerator} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/projects"} component={Projects} />
        <Route path={"/projects/new"} component={NewProject} />
        <Route path={"/projects/:id"} component={ProjectDetail} />

        <Route path={"//settings/profile"} component={Profile} />
        <Route path={"//settings/organization"} component={OrganizationSettings} />
        <Route path={"//materials"} component={MaterialsLibrary} />
        <Route path={"//import"} component={Import} />
      <Route path={"//export"} component={Export} />
      <Route path={"//admin/monitoring"} component={AdminMonitoring} />
      <Route path={"//404"} component={NotFound} />
        <Route component={NotFound} /> </Switch>
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
