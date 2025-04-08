import { Tweet } from './types/Tweet';
/**
 * Fetch tweets for a given username
 */
export declare function fetchTweets(username: string, maxPages?: number): Promise<Tweet[]>;
