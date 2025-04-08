export interface Tweet {
    id: string;
    text: string;
    username: string;
    created_at: string;
    timestamp: number | null;
    imageTweet: string[];
    avatarUrl: string | null;
}