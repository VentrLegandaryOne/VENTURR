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
const Chatbot = lazy(() => import("./pages/Chatbot"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const PricingDashboard = lazy(() => import("./pages/PricingDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ExportReports = lazy(() => import("./pages/ExportReports"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const TeamCollaboration = lazy(() => import("./pages/TeamCollaboration"));
const NotificationCenter = lazy(() => import("./components/NotificationCenter"));
const LanguageSwitcher = lazy(() => import("./components/LanguageSwitcher"));
const ClientPortalHome = lazy(() => import("./pages/ClientPortalHome"));
const TeamCalendarGantt = lazy(() => import("./pages/TeamCalendarGantt"));
const AdvancedAnalyticsDashboard = lazy(() => import("./pages/AdvancedAnalyticsDashboard"));
const NotificationPreferences = lazy(() => import("./pages/NotificationPreferences"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));
const TeamChat = lazy(() => import("./pages/TeamChat"));
const OnboardingFlow = lazy(() => import("./pages/OnboardingFlow"));
const PerformanceMonitoring = lazy(() => import("./pages/PerformanceMonitoring"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const RealtimeDashboard = lazy(() => import("./pages/RealtimeDashboard"));
const MobileAppUI = lazy(() => import("./pages/MobileAppUI"));
const AdvancedReportingUI = lazy(() => import("./pages/AdvancedReportingUI"));
const ForecastingDashboard = lazy(() => import("./pages/ForecastingDashboard"));
const DashboardCustomization = lazy(() => import("./pages/DashboardCustomization"));
const WorkflowBuilder = lazy(() => import("./pages/WorkflowBuilder"));
const AnalyticsExportSystem = lazy(() => import("./pages/AnalyticsExportSystem"));
const PerformanceScorecard = lazy(() => import("./pages/PerformanceScorecard"));
const FeedbackSurveySystem = lazy(() => import("./pages/FeedbackSurveySystem"));
const InventoryManagement = lazy(() => import("./pages/InventoryManagement"));
const CRMSystem = lazy(() => import("./pages/CRMSystem"));
const ProjectTemplates = lazy(() => import("./pages/ProjectTemplates"));
const ExecutiveReportingDashboard = lazy(() => import("./pages/ExecutiveReportingDashboard"));
const AdvancedIntegrations = lazy(() => import("./pages/AdvancedIntegrations"));
const AIForecastingSystem = lazy(() => import("./pages/AIForecastingSystem"));
const WhiteLabelResellerPortal = lazy(() => import("./pages/WhiteLabelResellerPortal"));
const AdvancedAnalyticsEngine = lazy(() => import("./pages/AdvancedAnalyticsEngine"));
const MobileNativeAppsConfig = lazy(() => import("./pages/MobileNativeAppsConfig"));
const EnterpriseSSOSAML = lazy(() => import("./pages/EnterpriseSSOSAML"));
const AdvancedComplianceAudit = lazy(() => import("./pages/AdvancedComplianceAudit"));
const RealtimeCollaborationSuite = lazy(() => import("./pages/RealtimeCollaborationSuite"));
const AdvancedMarketplaceEcosystem = lazy(() => import("./pages/AdvancedMarketplaceEcosystem"));
const PredictiveMaintenanceIoT = lazy(() => import("./pages/PredictiveMaintenanceIoT"));
const AdvancedFinancialManagement = lazy(() => import("./pages/AdvancedFinancialManagement"));

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
      <Route path={"/pricing-dashboard"} component={PricingDashboard} />
      <Route path={"/chatbot"} component={Chatbot} />
      <Route path={"/marketplace"} component={Marketplace} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/export"} component={ExportReports} />
      <Route path={"/analytics"} component={AdvancedAnalytics} />
      <Route path={"/analytics-dashboard"} component={AdvancedAnalyticsDashboard} />
      <Route path={"/team"} component={TeamCollaboration} />
      <Route path={"/team-calendar"} component={TeamCalendarGantt} />
      <Route path={"/client-portal"} component={ClientPortalHome} />
      <Route path={"/notifications/preferences"} component={NotificationPreferences} />
      <Route path={"/search"} component={AdvancedSearch} />
      <Route path={"/chat"} component={TeamChat} />
      <Route path={"/onboarding"} component={OnboardingFlow} />
      <Route path={"/monitoring"} component={PerformanceMonitoring} />
      <Route path={"/help"} component={KnowledgeBase} />
      <Route path={"/dashboard/realtime"} component={RealtimeDashboard} />
      <Route path={"/mobile"} component={MobileAppUI} />
      <Route path={"/reports/advanced"} component={AdvancedReportingUI} />
      <Route path={"/forecasting"} component={ForecastingDashboard} />
      <Route path={"/customize-dashboard"} component={DashboardCustomization} />
      <Route path={"/workflows"} component={WorkflowBuilder} />
      <Route path={"/reports/export"} component={AnalyticsExportSystem} />
      <Route path={"/performance"} component={PerformanceScorecard} />
      <Route path={"/feedback"} component={FeedbackSurveySystem} />
      <Route path={"/inventory"} component={InventoryManagement} />
      <Route path={"/crm"} component={CRMSystem} />
      <Route path={"/templates"} component={ProjectTemplates} />
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
      <Route path={"//reporting"} component={ExecutiveReportingDashboard} />
      <Route path={"//integrations"} component={AdvancedIntegrations} />
      <Route path={"//forecasting"} component={AIForecastingSystem} />
      <Route path={"//reseller-portal"} component={WhiteLabelResellerPortal} />
      <Route path={"//analytics-engine"} component={AdvancedAnalyticsEngine} />
      <Route path={"//mobile-apps"} component={MobileNativeAppsConfig} />
      <Route path={"//enterprise-sso"} component={EnterpriseSSOSAML} />
      <Route path={"//compliance-audit"} component={AdvancedComplianceAudit} />
      <Route path={"//collaboration-suite"} component={RealtimeCollaborationSuite} />
      <Route path={"//marketplace-ecosystem"} component={AdvancedMarketplaceEcosystem} />
      <Route path={"//predictive-maintenance"} component={PredictiveMaintenanceIoT} />
      <Route path={"//financial-management"} component={AdvancedFinancialManagement} />
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
          <Suspense fallback={null}>
            <NotificationCenter />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
