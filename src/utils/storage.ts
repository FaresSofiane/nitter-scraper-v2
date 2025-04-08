import * as fs from 'fs';
import * as path from 'path';
import { formatDate } from './dateUtils';
import { Tweet } from '../types/Tweet';

/**
 * Save tweets to a JSON file
 */
export function saveTweets(tweets: Tweet[]): void {
    try {
        // Create output directory if it doesn't exist
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Create filename with current date
        const now = new Date();
        const timestamp = formatDate(now)?.replace(/[: ]/g, '-') || 'unknown-date';
        const filename = path.join(outputDir, `tweets-${timestamp}.json`);

        // Write tweets to file
        fs.writeFileSync(filename, JSON.stringify(tweets, null, 2));

        console.log(`Successfully saved ${tweets.length} tweets to ${filename}`);
    } catch (error) {
        console.error(`Error saving tweets: ${error}`);
    }
}