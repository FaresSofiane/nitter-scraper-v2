/**
 * Format date to a readable string (YYYY-MM-DD HH:MM:SS)
 */
export declare function formatDate(date: Date | null): string | null;
/**
 * Safely parse a date string, returning null if invalid
 */
export declare function safeParseDate(dateStr: string | undefined): Date | null;
/**
 * Format timestamp to remove duplicate month names
 */
export declare function formatTimestamp(timestamp: string): string;
/**
 * Convert relative timestamp to a proper date
 */
export declare function getDateFromTimestamp(timestamp: string, dateStr: string | undefined): Date | null;
