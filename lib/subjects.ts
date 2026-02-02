/**
 * Subject Configuration
 * 
 * Centralized configuration for subject icons, gradients, and colors.
 * This is the single source of truth for subject styling across the app.
 */

export interface SubjectConfig {
    icon: string;
    gradient: string;
    color: string; // For solid color contexts
}

/**
 * Subject configuration mapping
 * 
 * Each subject has:
 * - icon: Material Symbols icon name
 * - gradient: Tailwind gradient classes (from-X to-Y)
 * - color: Primary solid color for the subject
 */
const SUBJECTS: Record<string, SubjectConfig> = {
    // Languages
    'English': {
        icon: 'auto_stories',
        gradient: 'from-yellow-400 to-orange-500',
        color: 'bg-yellow-500'
    },
    'Afrikaans': {
        icon: 'translate',
        gradient: 'from-red-400 to-orange-500',
        color: 'bg-red-500'
    },

    // Mathematics
    'Mathematics': {
        icon: 'calculate',
        gradient: 'from-purple-500 to-blue-500',
        color: 'bg-purple-500'
    },
    'Maths': {
        icon: 'calculate',
        gradient: 'from-purple-500 to-blue-500',
        color: 'bg-purple-500'
    },
    'Math Literacy': {
        icon: 'calculate',
        gradient: 'from-purple-400 to-indigo-500',
        color: 'bg-purple-400'
    },

    // Sciences
    'Physical Science': {
        icon: 'science',
        gradient: 'from-blue-500 to-cyan-500',
        color: 'bg-blue-500'
    },
    'Life Science': {
        icon: 'biotech',
        gradient: 'from-green-400 to-emerald-500',
        color: 'bg-green-500'
    },
    'Science': {
        icon: 'science',
        gradient: 'from-blue-400 to-emerald-500',
        color: 'bg-blue-500'
    },

    // Humanities
    'History': {
        icon: 'history_edu',
        gradient: 'from-amber-500 to-orange-600',
        color: 'bg-amber-500'
    },
    'Geography': {
        icon: 'public',
        gradient: 'from-green-400 to-teal-500',
        color: 'bg-green-500'
    },
    'Life Orientation': {
        icon: 'psychology',
        gradient: 'from-violet-400 to-purple-500',
        color: 'bg-violet-500'
    },

    // Arts
    'Art': {
        icon: 'palette',
        gradient: 'from-pink-400 to-purple-500',
        color: 'bg-pink-500'
    },
    'Visual Arts': {
        icon: 'palette',
        gradient: 'from-pink-400 to-rose-500',
        color: 'bg-pink-500'
    },
    'Music': {
        icon: 'music_note',
        gradient: 'from-indigo-400 to-purple-500',
        color: 'bg-indigo-500'
    },

    // Physical Education
    'PE': {
        icon: 'sports_soccer',
        gradient: 'from-orange-400 to-red-500',
        color: 'bg-orange-500'
    },
    'Physical Education': {
        icon: 'sports_soccer',
        gradient: 'from-orange-400 to-red-500',
        color: 'bg-orange-500'
    },

    // Technology & Business
    'ICT': {
        icon: 'computer',
        gradient: 'from-gray-600 to-gray-800',
        color: 'bg-gray-600'
    },
    'IT': {
        icon: 'computer',
        gradient: 'from-slate-600 to-slate-800',
        color: 'bg-slate-600'
    },
    'Computer': {
        icon: 'computer',
        gradient: 'from-gray-600 to-gray-800',
        color: 'bg-gray-600'
    },
    'Business': {
        icon: 'business',
        gradient: 'from-blue-600 to-indigo-600',
        color: 'bg-blue-600'
    },
    'Business Studies': {
        icon: 'business',
        gradient: 'from-blue-600 to-indigo-700',
        color: 'bg-blue-600'
    },
    'Economics': {
        icon: 'trending_up',
        gradient: 'from-emerald-500 to-teal-600',
        color: 'bg-emerald-500'
    },
    'Tourism': {
        icon: 'flight',
        gradient: 'from-sky-400 to-blue-500',
        color: 'bg-sky-500'
    },

    // Default fallback
    'default': {
        icon: 'school',
        gradient: 'from-gray-400 to-gray-600',
        color: 'bg-gray-500'
    },
};

/**
 * Find the matching subject config by fuzzy matching the subject name
 */
function findSubjectKey(subject: string): string | null {
    return Object.keys(SUBJECTS).find(k =>
        k !== 'default' && subject.toLowerCase().includes(k.toLowerCase())
    ) ?? null;
}

/**
 * Get the full config for a subject
 */
export function getSubjectConfig(subject: string | null): SubjectConfig {
    if (!subject) return SUBJECTS.default;
    const key = findSubjectKey(subject);
    return key ? SUBJECTS[key] : SUBJECTS.default;
}

/**
 * Get the icon for a subject
 */
export function getSubjectIcon(subject: string | null): string {
    return getSubjectConfig(subject).icon;
}

/**
 * Get the gradient for a subject
 */
export function getSubjectGradient(subject: string | null): string {
    return getSubjectConfig(subject).gradient;
}

/**
 * Get the solid color for a subject
 */
export function getSubjectColor(subject: string | null): string {
    return getSubjectConfig(subject).color;
}

// Export the raw config for advanced use cases
export { SUBJECTS };
