import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Vibrate, Smartphone, ChevronLeft, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { haptics } from "@/lib/haptics";
import { toast } from "sonner";

const HAPTICS_ENABLED_KEY = "venturr_haptics_enabled";
const HAPTICS_INTENSITY_KEY = "venturr_haptics_intensity";

export default function HapticsSettings() {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(HAPTICS_ENABLED_KEY);
    return stored === null ? true : stored === "true";
  });

  const [intensity, setIntensity] = useState(() => {
    const stored = localStorage.getItem(HAPTICS_INTENSITY_KEY);
    return stored ? parseInt(stored, 10) : 50;
  });

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    localStorage.setItem(HAPTICS_ENABLED_KEY, checked.toString());
    
    if (checked) {
      haptics.success();
      toast.success("Haptic feedback enabled");
    } else {
      toast.info("Haptic feedback disabled");
    }
  };

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    setIntensity(newIntensity);
    localStorage.setItem(HAPTICS_INTENSITY_KEY, newIntensity.toString());
  };

  const testPattern = (patternName: string, patternFn: () => void) => {
    if (!enabled) {
      toast.error("Enable haptic feedback first");
      return;
    }
    
    patternFn();
    toast.info(`Testing ${patternName} pattern`);
  };

  const isSupported = 'vibrate' in navigator;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Vibrate className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Haptic Feedback</h1>
              <p className="text-muted-foreground">Customize tactile feedback for gestures and interactions</p>
            </div>
          </div>
        </div>

        {/* Device Support Warning */}
        {!isSupported && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Device Not Supported</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your device or browser doesn't support haptic feedback. These settings will have no effect.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-6 max-w-2xl">
          {/* Main Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="haptics-toggle" className="text-base font-semibold cursor-pointer">
                      Enable Haptic Feedback
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Feel tactile responses for swipes, pull-to-refresh, and other gestures
                    </p>
                  </div>
                </div>
                <Switch
                  id="haptics-toggle"
                  checked={enabled}
                  onCheckedChange={handleToggle}
                  disabled={!isSupported}
                />
              </div>
            </Card>
          </motion.div>

          {/* Intensity Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Intensity</Label>
                    <p className="text-sm text-muted-foreground">
                      Adjust the strength of haptic feedback
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{intensity}%</span>
                </div>
                
                <Slider
                  value={[intensity]}
                  onValueChange={handleIntensityChange}
                  min={0}
                  max={100}
                  step={10}
                  disabled={!enabled || !isSupported}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtle</span>
                  <span>Strong</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Test Patterns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold">Test Patterns</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Try different haptic patterns to find your preferred feedback style
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => testPattern("Light", haptics.light)}
                    disabled={!enabled || !isSupported}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span>Light</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => testPattern("Medium", haptics.medium)}
                    disabled={!enabled || !isSupported}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    </div>
                    <span>Medium</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => testPattern("Heavy", haptics.heavy)}
                    disabled={!enabled || !isSupported}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                    </div>
                    <span>Heavy</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => testPattern("Success", haptics.success)}
                    disabled={!enabled || !isSupported}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <span>Success</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => testPattern("Warning", haptics.warning)}
                    disabled={!enabled || !isSupported}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                    <span>Warning</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => testPattern("Error", haptics.error)}
                    disabled={!enabled || !isSupported}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <AlertCircle className="w-6 h-6 text-destructive" />
                    <span>Error</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Usage Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-muted/30">
              <h3 className="font-semibold mb-3">Where Haptics Are Used</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Pull-to-refresh:</strong> Feel a tap when you pull past the threshold and when refresh completes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Swipe gestures:</strong> Get feedback at 50% swipe progress and when delete/share actions trigger</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Button taps:</strong> Subtle confirmation when pressing important action buttons</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Notifications:</strong> Distinct patterns for success, warning, and error messages</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
