#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scraper_1 = require("./scraper");
const storage_1 = require("./utils/storage");
async function main() {
    try {
        const username = "wslyvh"; // Twitter username to scrape (without @)
        console.log(`Starting Twitter scraper for @${username}`);
        // Fetch tweets
        const tweets = await (0, scraper_1.fetchTweets)(username, 5);
        // Save tweets to file
        (0, storage_1.saveTweets)(tweets);
    }
    catch (error) {
        console.error(`Error in main function: ${error}`);
    }
}
// Run the main function
main().catch(console.error);
