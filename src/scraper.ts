import * as cheerio from 'cheerio';
import { getDateFromTimestamp } from './utils/dateUtils';
import { Tweet } from './types/Tweet';

// Constants
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15";
const BASE_URL = "https://nitter.net";
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds delay between requests

/**
 * Extract tweets and next cursor from HTML content
 */
function extractTweetsFromHtml(html: string, username: string, existingTweets: Set<string>): { tweets: Tweet[], nextCursor: string | null } {
    const $ = cheerio.load(html);
    const tweets: Tweet[] = [];
    let nextCursor: string | null = null;

    // Find the "Load more" link to get the next cursor
    $("a").each((_, element) => {
        const href = $(element).attr("href");
        const text = $(element).text().trim();
        if (href && href.includes("cursor=") && text.includes("Load more")) {
            const cursorMatch = href.match(/cursor=([^&]+)/);
            if (cursorMatch && cursorMatch[1]) {
                nextCursor = cursorMatch[1];
            }
        }
    });

    // Extract tweets
    $(".timeline-item").each((_, element) => {
        try {
            const tweetElement = $(element);
            // Skip pinned tweets
            if (tweetElement.find(".pinned").length > 0) {
                return;
            }
            // Extract tweet ID from the permalink
            const permalink = tweetElement.find(".tweet-link").attr("href");
            const id = permalink ? permalink.split("/").pop() || "" : "";
            // Clean the ID by removing the "#m" suffix if present
            const cleanId = id.replace(/#m$/, "");
            if (!cleanId) {
                return; // Skip if no ID
            }
            // Skip if we already have this tweet
            if (existingTweets.has(cleanId)) {
                return;
            }
            const text = tweetElement.find(".tweet-content").text().trim();
            // Get timestamp and full date from title attribute
            const timestampElement = tweetElement.find(".tweet-date a");
            const timestamp = timestampElement.text().trim();
            const dateStr = timestampElement.attr("title");
            // Parse the date from the timestamp
            const date = getDateFromTimestamp(timestamp, dateStr);

            // Récupérer l'URL de l'avatar
            const avatarElement = tweetElement.find(".avatar.round");
            let avatarUrl = null;
            if (avatarElement.length > 0) {
                avatarUrl = avatarElement.attr("src") || null;
                // Add base URL if it's a relative path
                if (avatarUrl && !avatarUrl.startsWith("http")) {
                    avatarUrl = `${BASE_URL}${avatarUrl}`;
                }
            }

            // Collect image URLs from the tweet
            const imageTweet: string[] = [];
            tweetElement.find(".attachment-image").each((_, imgElement) => {
                const imgSrc = $(imgElement).attr("href");
                if (imgSrc) {
                    // Add base URL if it's a relative path
                    const fullImgSrc = imgSrc.startsWith("http") ? imgSrc : `${BASE_URL}${imgSrc}`;
                    imageTweet.push(fullImgSrc);
                }
            });

            // Create tweet object
            tweets.push({
                id: cleanId,
                text,
                username,
                created_at: date ? date.toISOString() : "",
                timestamp: date ? date.getTime() : null,
                imageTweet,
                avatarUrl
            });
        } catch (error) {
            console.error(`Error extracting tweet: ${error}`);
        }
    });

    return { tweets, nextCursor };
}

/**
 * Fetch tweets for a given username
 */
export async function fetchTweets(username: string, maxPages: number = 3): Promise<Tweet[]> {
    try {
        const allTweets: Tweet[] = [];
        const seenTweets = new Set<string>();
        let nextCursor: string | null = null;
        let pagesProcessed = 0;

        do {
            // Construct URL with cursor if available
            const url = nextCursor
                ? `${BASE_URL}/${username}/search?cursor=${nextCursor}`
                : `${BASE_URL}/${username}`;

            console.log(`Fetching tweets from: ${url}`);

            // Fetch the HTML content
            const response = await fetch(url, {
                headers: {
                    "User-Agent": USER_AGENT
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch tweets: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            const { tweets, nextCursor: cursor } = extractTweetsFromHtml(html, username, seenTweets);

            // Add tweets to the result and update seen tweets
            for (const tweet of tweets) {
                allTweets.push(tweet);
                seenTweets.add(tweet.id);
            }

            nextCursor = cursor;
            pagesProcessed++;

            // Add delay between requests to avoid rate limiting
            if (nextCursor && pagesProcessed < maxPages) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }

        } while (nextCursor && pagesProcessed < maxPages);

        console.log(`Fetched ${allTweets.length} tweets for @${username}`);
        return allTweets;
    } catch (error) {
        console.error(`Error fetching tweets: ${error}`);
        return [];
    }
}