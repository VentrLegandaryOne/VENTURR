import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { useEffect, lazy, Suspense } from "react";
import { registerServiceWorker } from "@/lib/registerSW";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { GeometricTransition } from "./components/branding/GeometricTransition";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { initGlobalErrorHandler } from "@/lib/errorLogging";

// Eager load critical pages
import VerifyPortal from "./pages/VerifyPortal";
import QuoteUpload from "./pages/QuoteUpload";
import Dashboard from "./pages/Dashboard";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HapticsSettings from "./pages/HapticsSettings";
import Settings from "./pages/Settings";

// Lazy load heavy/less-critical pages
const VerificationReport = lazy(() => import("./pages/VerificationReport"));
const QuoteComparison = lazy(() => import("./pages/QuoteComparison"));
const Processing = lazy(() => import("./pages/Processing"));
const CompareQuotes = lazy(() => import("./pages/QuoteCompare"));
const ComparisonView = lazy(() => import("./pages/ComparisonView"));
const Contractors = lazy(() => import("./pages/Contractors"));
const ContractorProfile = lazy(() => import("./pages/ContractorProfile"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AdminTemplates = lazy(() => import("./pages/AdminTemplates"));
const Templates = lazy(() => import("./pages/Templates"));
const Comparisons = lazy(() => import("./pages/Comparisons"));
const ComparisonHistory = lazy(() => import("./pages/ComparisonHistory"));
const ContractorPerformance = lazy(() => import("./pages/ContractorPerformance"));
const ComparisonResult = lazy(() => import("./pages/ComparisonResult"));
const ContractorComparison = lazy(() => import("@/pages/ContractorComparison"));
const SharedComparison = lazy(() => import("@/pages/SharedComparison"));
const SharedReport = lazy(() => import("./pages/SharedReport"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const ValidtReport = lazy(() => import("./pages/ValidtReport"));
const MarketRates = lazy(() => import("./pages/MarketRates"));
const CredentialVerification = lazy(() => import("./pages/CredentialVerification"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const ContractorRegistration = lazy(() => import("./pages/ContractorRegistration"));
const ApiDocumentation = lazy(() => import("./pages/ApiDocumentation"));
const DisputeCenter = lazy(() => import("./pages/DisputeCenter"));
const DataExport = lazy(() => import("./pages/DataExport"));
const ContractorCredentials = lazy(() => import("./pages/ContractorCredentials"));
const ReviewResponses = lazy(() => import("./pages/ReviewResponses"));
const WhiteLabelConfig = lazy(() => import("./pages/WhiteLabelConfig"));
const SLADocumentation = lazy(() => import("./pages/SLADocumentation"));
const Download = lazy(() => import("./pages/Download"));
const FreeQuoteCheck = lazy(() => import("./pages/FreeQuoteCheck"));
const UpgradeReport = lazy(() => import("./pages/UpgradeReport"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const SettingsProfile = lazy(() => import("./pages/SettingsProfile"));
const SettingsPrivacy = lazy(() => import("./pages/SettingsPrivacy"));
const AdminMetrics = lazy(() => import("./pages/AdminMetrics"));
const AdminRequestLogs = lazy(() => import("./pages/AdminRequestLogs"));
const AdminWebhooks = lazy(() => import("./pages/AdminWebhooks"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <DashboardSkeleton />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/compare"} component={CompareQuotes} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path="/contractors" component={Contractors} />
      <Route path="/history" component={ComparisonHistory} />
      <Route path={"/contractor/:id"} component={ContractorProfile} />
      <Route path={"/contractor/:id/performance"} component={ContractorPerformance} />
      <Route path="/compare-contractors" component={ContractorComparison} />
      <Route path="/shared-comparison/:token" component={SharedComparison} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/comparisons"} component={Comparisons} />
      <Route path={"/admin/templates"} component={AdminTemplates} />
      <Route path={"/verify"} component={VerifyPortal} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/quote/upload"} component={QuoteUpload} />
      <Route path={"/processing/:id"} component={Processing} />
      <Route path="/comparison/:id" component={ComparisonResult} />
      <Route path="/quote/:id" component={VerificationReport} />
      <Route path="/validt-report/:verificationId" component={ValidtReport} />
      <Route path={"/shared/:token"} component={SharedReport} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/settings/notifications"} component={NotificationSettings} />
      <Route path={"/settings/haptics"} component={HapticsSettings} />
      <Route path="/settings/profile" component={SettingsProfile} />
      <Route path="/settings/privacy" component={SettingsPrivacy} />
      <Route path="/admin/metrics" component={AdminMetrics} />
      <Route path="/admin/request-logs" component={AdminRequestLogs} />
      <Route path="/admin/webhooks" component={AdminWebhooks} />
   <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/market-rates" component={MarketRates} />
      <Route path="/credentials" component={CredentialVerification} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/contractor-registration" component={ContractorRegistration} />
      <Route path="/api-docs" component={ApiDocumentation} />
      <Route path="/disputes" component={DisputeCenter} />
      <Route path="/export" component={DataExport} />
      <Route path="/contractor-credentials" component={ContractorCredentials} />
      <Route path="/review-responses" component={ReviewResponses} />
      <Route path="/white-label" component={WhiteLabelConfig} />
      <Route path="/sla" component={SLADocumentation} />
      <Route path="/download" component={Download} />
      <Route path="/free-check" component={FreeQuoteCheck} />
      <Route path="/upgrade/:quoteId" component={UpgradeReport} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path={"/:rest*"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useKeyboardShortcuts();
  
  useEffect(() => {
    registerServiceWorker();
    initGlobalErrorHandler();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <InstallPrompt />
          <GeometricTransition>
            <Router />
          </GeometricTransition>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
