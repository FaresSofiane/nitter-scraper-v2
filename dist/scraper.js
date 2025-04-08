"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTweets = fetchTweets;
const cheerio = __importStar(require("cheerio"));
const dateUtils_1 = require("./utils/dateUtils");
// Constants
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15";
const BASE_URL = "https://nitter.net";
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds delay between requests
/**
 * Extract tweets and next cursor from HTML content
 */
/**
 * Extract tweets and next cursor from HTML content
 */
function extractTweetsFromHtml(html, username, existingTweets) {
    const $ = cheerio.load(html);
    const tweets = [];
    let nextCursor = null;

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
            const date = (0, dateUtils_1.getDateFromTimestamp)(timestamp, dateStr);

            // Récupérer l'URL de l'avatar
            const avatarElement = tweetElement.find(".avatar.round");
            let avatarUrl = null;
            if (avatarElement.length > 0) {
                const avatarSrc = avatarElement.attr("src");
                if (avatarSrc) {
                    // Construire l'URL complète
                    avatarUrl = BASE_URL + avatarSrc;
                }
            }

            // Create tweet object
            const tweet = {
                id: cleanId,
                text,
                username,
                created_at: (0, dateUtils_1.formatDate)(date),
                timestamp: date ? Math.floor(date.getTime() / 1000) : null,
                imageTweet: [],
                avatarUrl: avatarUrl
            };

            // Extract images if present
            tweetElement.find(".attachment.image").each((_, imgElement) => {
                const imgLink = $(imgElement).find("a.still-image").attr("href");
                if (imgLink) {
                    const fullImgUrl = BASE_URL + imgLink;
                    tweet.imageTweet.push(fullImgUrl);
                }
            });

            tweets.push(tweet);
            existingTweets.set(cleanId, tweet);
        }
        catch (error) {
            console.error(`Error extracting tweet: ${error}`);
        }
    });

    return { tweets, nextCursor };
}/**
 * Fetch a single page of tweets
 */
async function fetchTweetsPage(username, cursor, pageNumber) {
    let url = `${BASE_URL}/${username}/with_replies`;
    if (cursor) {
        url += `?cursor=${cursor}`;
    }
    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": USER_AGENT,
                Accept: "text/html,application/xhtml+xml,application/xml",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });
        if (response.status === 429) {
            console.log("Rate limit exceeded. Waiting 30 seconds before retrying...");
            await new Promise((resolve) => setTimeout(resolve, 30000));
            return fetchTweetsPage(username, cursor, pageNumber);
        }
        const html = await response.text();
        return { html, status: response.status };
    }
    catch (error) {
        console.error(`Error fetching tweets: ${error}`);
        return { html: "", status: 500 };
    }
}
/**
 * Fetch tweets from Nitter for a given username
 * @param username Twitter username to scrape (without @)
 * @param maxPages Maximum number of pages to fetch (default: 3)
 * @returns Promise containing an array of tweets
 */
async function fetchTweets(username, maxPages = 3) {
    let cursor = null;
    let pageNumber = 1;
    let allTweets = [];
    const existingTweets = new Map();
    while (pageNumber <= maxPages) {
        const { html, status } = await fetchTweetsPage(username, cursor, pageNumber);
        if (status !== 200 || !html) {
            console.error(`Failed to fetch page ${pageNumber}, status: ${status}`);
            break;
        }
        const { tweets, nextCursor } = extractTweetsFromHtml(html, username, existingTweets);
        allTweets = [...allTweets, ...tweets];
        if (!nextCursor) {
            break;
        }
        cursor = nextCursor;
        pageNumber++;
        if (pageNumber <= maxPages) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
    }
    return allTweets;
}
