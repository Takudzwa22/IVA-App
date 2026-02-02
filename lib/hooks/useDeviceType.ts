/**
 * Device Type Detection Hook
 * 
 * Dynamically detects the device type based on viewport width.
 * Updates on window resize for responsive behavior.
 */

'use client';

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Breakpoints (in pixels)
const BREAKPOINTS = {
    tablet: 768,   // >= 768px = tablet
    desktop: 1024, // >= 1024px = desktop
} as const;

/**
 * Determines device type from window width
 */
function getDeviceType(width: number): DeviceType {
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
}

/**
 * Hook to detect the current device type based on viewport width.
 * 
 * Returns:
 * - 'mobile': < 768px
 * - 'tablet': 768px - 1023px
 * - 'desktop': >= 1024px
 * 
 * The value updates dynamically when the window is resized.
 */
export function useDeviceType(): DeviceType {
    // Start with mobile for SSR safety
    const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Set initial value
        setDeviceType(getDeviceType(window.innerWidth));

        // Update on resize
        const handleResize = () => {
            setDeviceType(getDeviceType(window.innerWidth));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Return mobile during SSR to prevent hydration mismatch
    if (!mounted) return 'mobile';

    return deviceType;
}

/**
 * Hook to check if the current device is mobile
 */
export function useIsMobile(): boolean {
    return useDeviceType() === 'mobile';
}

/**
 * Hook to check if the current device is tablet or larger
 */
export function useIsTabletOrLarger(): boolean {
    const deviceType = useDeviceType();
    return deviceType === 'tablet' || deviceType === 'desktop';
}

/**
 * Hook to check if the current device is desktop
 */
export function useIsDesktop(): boolean {
    return useDeviceType() === 'desktop';
}

export default useDeviceType;
