// lib/components/TourOverlay.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface TourOverlayProps {
  targetSelector: string;
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

function getTooltipPosition(rect: TargetRect, viewportHeight: number) {
  const spaceBelow = viewportHeight - (rect.top + rect.height + PADDING);
  const spaceAbove = rect.top - PADDING;
  if (spaceBelow > 180) return 'below' as const;
  if (spaceAbove > 180) return 'above' as const;
  return 'below' as const;
}

const TourOverlay: React.FC<TourOverlayProps> = ({
  targetSelector,
  title,
  description,
  stepNumber,
  totalSteps,
  onNext,
  onSkip,
  isLastStep,
}) => {
  const [rect, setRect] = useState<TargetRect | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [targetSelector]);

  useEffect(() => {
    const timer = setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  if (!rect) return null;

  const position = getTooltipPosition(rect, window.innerHeight);
  const spotlightStyle = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  const tooltipTop =
    position === 'below'
      ? rect.top + rect.height + PADDING + 12
      : rect.top - PADDING - 12;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onSkip}>
      {/* Dark overlay with cutout */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" />

      {/* Spotlight cutout */}
      <div
        className="absolute rounded-2xl ring-4 ring-white/30 z-[101]"
        style={{
          ...spotlightStyle,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          background: 'transparent',
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute z-[102] w-[min(320px,calc(100vw-32px))] animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{
          top: position === 'below' ? tooltipTop : undefined,
          bottom: position === 'above' ? window.innerHeight - tooltipTop : undefined,
          left: Math.max(16, Math.min(rect.left, window.innerWidth - 336)),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepNumber
                    ? 'w-6 bg-indigo-500'
                    : i < stepNumber
                    ? 'w-1.5 bg-indigo-300'
                    : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">{description}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={onNext}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              {isLastStep ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;
