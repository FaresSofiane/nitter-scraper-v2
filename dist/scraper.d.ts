import type { Tweet } from "./types/Tweet";
/**
 * Fetch tweets from Nitter for a given username
 * @param username Twitter username to scrape (without @)
 * @param maxPages Maximum number of pages to fetch (default: 3)
 * @returns Promise containing an array of tweets
 */
export declare function fetchTweets(username: string, maxPages?: number): Promise<Tweet[]>;
