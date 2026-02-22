import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Download as DownloadIcon,
  Apple,
  CheckCircle2,
  Shield,
  Zap,
  Bell,
  Wifi,
  ChevronRight,
  QrCode,
  Share,
  Plus,
  MoreVertical,
  Home,
  ArrowDown,
  Monitor,
  Tablet,
  Star,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

// Detect device type
function useDeviceDetection() {
  const [device, setDevice] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDevice("ios");
    } else if (/android/.test(userAgent)) {
      setDevice("android");
    } else {
      setDevice("desktop");
    }
  }, []);

  return device;
}

// Android icon component
function AndroidIcon(props: { className?: string }) {
  const { className } = props;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.4-.59-2.96-.92-4.47-.92s-3.07.33-4.47.92L5.65 5.67c-.19-.29-.54-.38-.84-.22-.3.16-.42.54-.26.85L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
    </svg>
  );
}

// Installation steps for each platform
const iosSteps = [
  { icon: Share, text: "Tap the Share button in Safari", detail: "Located at the bottom of your screen" },
  { icon: Plus, text: "Scroll down and tap 'Add to Home Screen'", detail: "You may need to scroll the menu" },
  { icon: Home, text: "Tap 'Add' to confirm", detail: "The app icon will appear on your home screen" },
];

const androidSteps = [
  { icon: MoreVertical, text: "Tap the menu icon (⋮) in Chrome", detail: "Located at the top right corner" },
  { icon: DownloadIcon, text: "Tap 'Install app' or 'Add to Home screen'", detail: "The option may vary by browser" },
  { icon: Home, text: "Tap 'Install' to confirm", detail: "The app will be added to your home screen" },
];

const desktopSteps = [
  { icon: Monitor, text: "Look for the install icon in the address bar", detail: "Usually appears on the right side" },
  { icon: DownloadIcon, text: "Click 'Install' when prompted", detail: "Or use browser menu → Install app" },
  { icon: Home, text: "The app will open in its own window", detail: "Access it from your desktop or start menu" },
];

// App features
const features = [
  { icon: Zap, title: "Lightning Fast", description: "Verify quotes in under 60 seconds" },
  { icon: Shield, title: "100% Secure", description: "Bank-level encryption for your data" },
  { icon: Bell, title: "Push Notifications", description: "Get instant alerts when quotes are ready" },
  { icon: Wifi, title: "Works Offline", description: "Access your quotes without internet" },
];

export default function Download() {
  const device = useDeviceDetection();
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Handle install button click
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Get platform-specific content
  const getPlatformContent = () => {
    switch (device) {
      case "ios":
        return { steps: iosSteps, icon: Apple, name: "iOS", color: "bg-black text-white" };
      case "android":
        return { steps: androidSteps, icon: AndroidIcon, name: "Android", color: "bg-green-600 text-white" };
      default:
        return { steps: desktopSteps, icon: Monitor, name: "Desktop", color: "bg-blue-600 text-white" };
    }
  };

  const platformContent = getPlatformContent();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 pt-20 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-0">
                <Smartphone className="w-3 h-3 mr-1" />
                Mobile App Available
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Get VENTURR VALDT
                <span className="text-primary block">On Your Device</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Install our app for instant access to quote verification, push notifications, 
                and offline support. No app store required.
              </p>

              {/* Quick Install Button (if supported) */}
              {isInstallable && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Button size="lg" onClick={handleInstall} className="gap-2">
                    <DownloadIcon className="w-5 h-5" />
                    Install Now
                  </Button>
                </motion.div>
              )}

              {/* Platform Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg">
                  <Apple className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">Available on</div>
                    <div className="text-sm font-semibold">iOS</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                  <AndroidIcon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">Available on</div>
                    <div className="text-sm font-semibold">Android</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Monitor className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">Available on</div>
                    <div className="text-sm font-semibold">Desktop</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <div className="text-2xl font-bold text-foreground">4.9</div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">User Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">98%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </motion.div>

            {/* Right: Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />
                    
                    {/* Screen Content */}
                    <div className="pt-10 px-4 h-full bg-gradient-to-b from-primary/5 to-background">
                      {/* App Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">VV</span>
                        </div>
                        <span className="font-semibold text-sm">VENTURR VALDT</span>
                      </div>

                      {/* Mini Dashboard */}
                      <div className="space-y-3">
                        <div className="bg-card rounded-xl p-3 shadow-sm">
                          <div className="text-xs text-muted-foreground mb-1">Total Savings</div>
                          <div className="text-xl font-bold text-primary">$12,450</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-card rounded-xl p-3 shadow-sm">
                            <div className="text-xs text-muted-foreground">Quotes</div>
                            <div className="text-lg font-bold">24</div>
                          </div>
                          <div className="bg-card rounded-xl p-3 shadow-sm">
                            <div className="text-xs text-muted-foreground">Score</div>
                            <div className="text-lg font-bold text-green-600">92</div>
                          </div>
                        </div>

                        {/* Quote Card Preview */}
                        <div className="bg-card rounded-xl p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <span className="text-orange-600 text-xs">🏠</span>
                            </div>
                            <div>
                              <div className="text-xs font-medium">Thomco Roofing</div>
                              <div className="text-[10px] text-muted-foreground">Roofing</div>
                            </div>
                            <Badge className="ml-auto text-[8px] bg-green-100 text-green-700">Verified</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">$8,500</span>
                            <span className="text-green-600 font-medium">Score: 87</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-4 top-20 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg"
                >
                  ✓ Verified
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -left-4 bottom-32 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg"
                >
                  🔔 Quote Ready!
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Install in 3 Easy Steps
            </h2>
            <p className="text-muted-foreground">
              {device === "ios" && "Installing on your iPhone or iPad"}
              {device === "android" && "Installing on your Android device"}
              {device === "desktop" && "Installing on your computer"}
            </p>
          </motion.div>

          {/* Platform Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant={device === "ios" && !showAllPlatforms ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllPlatforms(false)}
              className="gap-2"
            >
              <Apple className="w-4 h-4" />
              iOS
            </Button>
            <Button
              variant={device === "android" && !showAllPlatforms ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllPlatforms(false)}
              className="gap-2"
            >
              <AndroidIcon className="w-4 h-4" />
              Android
            </Button>
            <Button
              variant={device === "desktop" && !showAllPlatforms ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllPlatforms(false)}
              className="gap-2"
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </Button>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6">
            {platformContent.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-8 h-8 mx-auto mb-3 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{step.text}</h3>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Card className="inline-block p-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-white p-2 rounded-lg border">
                  {/* QR Code placeholder - in production, generate actual QR */}
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMSAyMSI+PHBhdGggZD0iTTEgMWg3djdIMXptMiAydjNoM1Yzem0xMi0yaDd2N2gtN3ptMiAydjNoM1Yzek0xIDEzaDd2N0gxem0yIDJ2M2gzdi0zem0xMC0yaDJ2MmgtMnptMCAzaDJ2MWgtMXYxaC0xdi0yem0zLTNoMXYyaC0xem0wIDNoMXYzaC0xdi0xaC0xdi0xaDJ6bS0zIDJoMXYxaC0xem0tMTAtOGgxdjFINHptMCAxaDJ2MUg0em0yLTFoMXYxSDZ6bTAgMmgxdjFINnptMSAxaDJ2MUg3em0wIDJoMXYxSDd6bTEtMWgxdjFIOHptMiAxaDJ2MWgtMnptMCAxaDJ2MWgtMnptMi0xaDF2MWgtMXptMCAyaDF2MWgtMXptLTMtNGgxdjFoLTF6bTEgMGgxdjFoLTF6bTEgMGgxdjFoLTF6bTEgMGgxdjFoLTF6bTEgMGgxdjFoLTF6bTEgMGgxdjFoLTF6bTEgMGgxdjFoLTF6Ii8+PC9zdmc+')] bg-contain" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Scan to Install</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Scan this QR code with your phone's camera to open the app and install it directly.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Install the App?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get the full VENTURR VALDT experience with these exclusive app features
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Native App Coming Soon */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-amber-100 text-amber-700 border-0">
              Coming Soon
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Native Apps in Development</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              We're building native iOS and Android apps for an even better experience. 
              Sign up to be notified when they launch on the App Store and Google Play.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Card className="p-4 flex items-center gap-3 opacity-60">
                <Apple className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Coming to</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3 opacity-60">
                <AndroidIcon className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Coming to</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
