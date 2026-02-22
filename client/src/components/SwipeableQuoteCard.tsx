import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Share2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SwipeableQuoteCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * SwipeableQuoteCard - Quote card with swipe gestures
 * 
 * Features:
 * - Left swipe to delete (shows red background with trash icon)
 * - Right swipe to share (shows blue background with share icon)
 * - Visual feedback during swipe
 * - Confirmation dialog for delete
 * - Haptic feedback
 */
export function SwipeableQuoteCard({
  children,
  onDelete,
  onShare,
  className = "",
}: SwipeableQuoteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const swipeState = useSwipeGesture(cardRef, {
    onSwipeLeft: onDelete ? () => setShowDeleteDialog(true) : undefined,
    onSwipeRight: onShare,
    threshold: 100,
    velocityThreshold: 0.3,
  });

  const { isSwiping, direction, progress } = swipeState;

  // Calculate transform based on swipe progress
  const translateX = isSwiping
    ? direction === 'left'
      ? -progress * 100
      : progress * 100
    : 0;

  // Background color based on swipe direction
  const backgroundColor =
    direction === 'left'
      ? `rgba(239, 68, 68, ${progress * 0.2})` // Red for delete
      : direction === 'right'
      ? `rgba(59, 130, 246, ${progress * 0.2})` // Blue for share
      : 'transparent';

  return (
    <>
      <div className="relative overflow-hidden rounded-lg">
        {/* Background actions */}
        <AnimatePresence>
          {isSwiping && direction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-between px-6"
              style={{ backgroundColor }}
            >
              {direction === 'right' && onShare && (
                <div className="flex items-center gap-2 text-primary">
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share</span>
                </div>
              )}
              
              <div className="flex-1" />
              
              {direction === 'left' && onDelete && (
                <div className="flex items-center gap-2 text-destructive">
                  <span className="font-medium">Delete</span>
                  <Trash2 className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card content */}
        <motion.div
          ref={cardRef}
          animate={{
            x: translateX,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className={`relative ${className}`}
        >
          {children}
        </motion.div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Quote
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
