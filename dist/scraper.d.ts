import { Tweet } from "./types/Tweet";
export interface Card {
    type: "card";
    url: string | null;
    imageUrl: string | null;
    title: string;
    description: string;
    destination: string;
}
export type ProxyOptions = {
    proxyList?: string[];
    proxyUrl?: string;
};
/**
 * Fetch tweets for a given username
 */
export declare function fetchTweets(username: string, maxPages?: number, useProxies?: boolean, proxyOptions?: ProxyOptions): Promise<Tweet[]>;
