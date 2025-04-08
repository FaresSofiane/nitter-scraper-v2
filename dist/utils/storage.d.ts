import type { Tweet } from "../types/Tweet";
/**
 * Save tweets to a JSON file, deduplicating based on complete tweet object
 * @param tweets Array of tweets to save
 * @param outputFile Path to the output file
 */
export declare function saveTweets(tweets: Tweet[], outputFile?: string): void;
