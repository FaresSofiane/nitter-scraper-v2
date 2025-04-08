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
exports.saveTweets = saveTweets;
const fs = __importStar(require("fs"));
/**
 * Save tweets to a JSON file, deduplicating based on complete tweet object
 * @param tweets Array of tweets to save
 * @param outputFile Path to the output file
 */
function saveTweets(tweets, outputFile = "tweets.json") {
    // Load existing tweets if file exists
    let existingTweets = [];
    if (fs.existsSync(outputFile)) {
        try {
            const data = fs.readFileSync(outputFile, "utf-8");
            existingTweets = JSON.parse(data);
            console.log(`Loaded ${existingTweets.length} existing tweets from ${outputFile}`);
        }
        catch (error) {
            console.error(`Error loading existing tweets: ${error}`);
        }
    }
    // Combine tweets and deduplicate using Set
    const uniqueTweets = Array.from(new Set([...existingTweets, ...tweets].map((tweet) => JSON.stringify(tweet)))).map((str) => JSON.parse(str));
    // Sort by timestamp (newest first)
    uniqueTweets.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
        }
        return b.id.localeCompare(a.id);
    });
    // Save to file
    fs.writeFileSync(outputFile, JSON.stringify(uniqueTweets, null, 2));
    console.log(`Saved ${uniqueTweets.length} tweets to ${outputFile} (${uniqueTweets.length - existingTweets.length} new)`);
}
