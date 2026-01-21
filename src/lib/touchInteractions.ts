/**
 * Touch interaction utilities for better mobile experience
 */

export interface TouchInteractionOptions {
  longPressDelay?: number;
  doubleTapDelay?: number;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  enableSwipe?: boolean;
  enableLongPress?: boolean;
  enableDoubleTap?: boolean;
}

export interface TouchGesture {
  type: 'tap' | 'doubleTap' | 'longPress' | 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown';
  timestamp: number;
  target: HTMLElement;
}

export class TouchInteractionManager {
  private options: Required<TouchInteractionOptions>;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private lastTapTime: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private isLongPressTriggered: boolean = false;

  constructor(options: TouchInteractionOptions = {}) {
    this.options = {
      longPressDelay: 500,
      doubleTapDelay: 300,
      swipeThreshold: 50,
      swipeVelocityThreshold: 0.3,
      enableSwipe: true,
      enableLongPress: true,
      enableDoubleTap: true,
      ...options,
    };
  }

  /**
   * Handle touch start event
   */
  public handleTouchStart = (e: React.TouchEvent, element: HTMLElement) => {
    const touch = e.touches[0];
    if (!touch) return;

    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    this.isLongPressTriggered = false;

    // Start long press timer
    if (this.options.enableLongPress) {
      this.longPressTimer = setTimeout(() => {
        this.isLongPressTriggered = true;
        this.triggerGesture('longPress', element);
      }, this.options.longPressDelay);
    }
  };

  /**
   * Handle touch end event
   */
  public handleTouchEnd = (e: React.TouchEvent, element: HTMLElement) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.touchStartTime;

    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // If long press was triggered, don't process other gestures
    if (this.isLongPressTriggered) {
      this.isLongPressTriggered = false;
      return;
    }

    // Calculate swipe
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check for swipe first (horizontal takes precedence)
    if (this.options.enableSwipe && (absDeltaX > this.options.swipeThreshold || absDeltaY > this.options.swipeThreshold)) {
      const velocity = absDeltaX / touchDuration;
      
      if (velocity > this.options.swipeVelocityThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            this.triggerGesture('swipeRight', element);
          } else {
            this.triggerGesture('swipeLeft', element);
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            this.triggerGesture('swipeDown', element);
          } else {
            this.triggerGesture('swipeUp', element);
          }
        }
        return;
      }
    }

    // Check for tap/double tap
    if (absDeltaX < 10 && absDeltaY < 10 && touchDuration < 200) {
      const timeSinceLastTap = touchEndTime - this.lastTapTime;
      
      if (this.options.enableDoubleTap && timeSinceLastTap < this.options.doubleTapDelay) {
        this.triggerGesture('doubleTap', element);
        this.lastTapTime = 0; // Reset to prevent triple-tap
      } else {
        this.triggerGesture('tap', element);
        this.lastTapTime = touchEndTime;
      }
    }
  };

  /**
   * Handle touch move event
   */
  public handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if user moves finger
    if (this.longPressTimer && !this.isLongPressTriggered) {
      const touch = e.touches[0];
      if (touch) {
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        
        // Cancel long press if moved more than 10px
        if (deltaX > 10 || deltaY > 10) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      }
    }
  };

  private triggerGesture(type: TouchGesture['type'], element: HTMLElement) {
    const gesture: TouchGesture = {
      type,
      timestamp: Date.now(),
      target: element,
    };

    // Dispatch custom event
    const event = new CustomEvent('touchgesture', {
      detail: gesture,
      bubbles: true,
    });
    element.dispatchEvent(event);
  }
}

import React, { useMemo, useEffect, useRef } from 'react';

/**
 * Hook for touch interactions
 */
export function useTouchInteraction(
  elementRef: React.RefObject<HTMLElement>,
  options: TouchInteractionOptions = {},
  onGesture?: (gesture: TouchGesture) => void
) {
  const touchManager = useMemo(() => new TouchInteractionManager(options), [options]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => touchManager.handleTouchStart(e as any, element);
    const handleTouchEnd = (e: TouchEvent) => touchManager.handleTouchEnd(e as any, element);
    const handleTouchMove = (e: TouchEvent) => touchManager.handleTouchMove(e as any);

    const handleGesture = (e: CustomEvent) => {
      onGesture?.(e.detail);
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchgesture', handleGesture as EventListener);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchgesture', handleGesture as EventListener);
    };
  }, [elementRef, touchManager, onGesture]);
}

/**
 * Utility to detect if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Utility to add touch-friendly hover states
 */
export function addTouchFriendlyHover(element: HTMLElement) {
  if (isTouchDevice()) {
    // For touch devices, add active states instead of hover
    element.addEventListener('touchstart', () => {
      element.classList.add('touch-active');
    });
    
    element.addEventListener('touchend', () => {
      // Remove active state after a short delay to show the feedback
      setTimeout(() => {
        element.classList.remove('touch-active');
      }, 150);
    });

    element.addEventListener('touchcancel', () => {
      element.classList.remove('touch-active');
    });
  }
}

/**
 * CSS class names for touch interactions
 */
export const TOUCH_CLASSES = {
  active: 'touch-active',
  hover: 'hover:scale-105',
  tap: 'tap-scale',
  longPress: 'long-pulse',
} as const;
