import { useEffect, useState, useCallback, useRef } from 'react';

export interface ProctorOptions {
  enabled: boolean;
  maxStrikes: number;
  onViolation?: (eventType: string, strikes: number) => void;
  onDisqualified?: () => void;
}

export function useProctor({ enabled, maxStrikes, onViolation, onDisqualified }: ProctorOptions) {
  const [strikes, setStrikes] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [lastViolationMsg, setLastViolationMsg] = useState<string>('');
  
  const strikesRef = useRef(strikes);
  strikesRef.current = strikes;

  const triggerViolation = useCallback(
    (eventType: string, msg: string) => {
      if (!enabled || isDisqualified) return;

      const newStrikes = strikesRef.current + 1;
      setStrikes(newStrikes);
      setLastViolationMsg(msg);
      setShowWarningModal(true);

      if (onViolation) {
        onViolation(eventType, newStrikes);
      }

      if (newStrikes >= maxStrikes) {
        setIsDisqualified(true);
        if (onDisqualified) {
          onDisqualified();
        }
      }
    },
    [enabled, isDisqualified, maxStrikes, onViolation, onDisqualified]
  );

  const requestFullscreen = useCallback(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // requestFullscreen error ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled || isDisqualified) return;

    // Check Fullscreen state change
    const handleFullscreenChange = () => {
      const inFS = !!document.fullscreenElement;
      setIsFullscreen(inFS);
      if (!inFS) {
        triggerViolation('FULLSCREEN_EXIT', 'Fullscreen mode is required during proctored contests!');
      }
    };

    // Check Tab Switching (Visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('TAB_SWITCH', 'Tab switching is strictly forbidden! Warning recorded.');
      }
    };

    // Check Window Blur (Focus lost)
    const handleWindowBlur = () => {
      triggerViolation('WINDOW_BLUR', 'Browser window lost focus! Warning recorded.');
    };

    // Prevent Copy/Paste if restricted
    const handleCopyPaste = (e: ClipboardEvent) => {
      if (e.type === 'paste') {
        // e.preventDefault(); // Option to prevent paste
        setLastViolationMsg('External paste attempt detected!');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [enabled, isDisqualified, triggerViolation]);

  return {
    strikes,
    isFullscreen,
    isDisqualified,
    showWarningModal,
    lastViolationMsg,
    requestFullscreen,
    closeWarningModal: () => setShowWarningModal(false),
  };
}
