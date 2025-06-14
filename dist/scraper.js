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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTweets = fetchTweets;
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const dateUtils_1 = require("./utils/dateUtils");
const https_proxy_agent_1 = require("https-proxy-agent");
const BASE_URL = "https://nitter.net";
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds delay between requests
const TWITTER_URL = "https://x.com/{username}/status/{id}";
// Variables pour la gestion des proxies
let proxies = [];
/**
 * Télécharge et charge la liste des proxies depuis une URL ou utilise une liste fournie
 */
async function loadProxies(useProxies, proxyOptions) {
    if (!useProxies) {
        return;
    }
    try {
        let proxyLines = [];
        // Si une liste de proxies est fournie directement
        if (proxyOptions?.proxyList && proxyOptions.proxyList.length > 0) {
            proxyLines = proxyOptions.proxyList;
        }
        // Si une URL est fournie pour télécharger les proxies
        else if (proxyOptions?.proxyUrl) {
            try {
                // Utiliser axios pour télécharger la liste au lieu de curl
                const response = await axios_1.default.get(proxyOptions.proxyUrl, {
                    timeout: 30000,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15",
                    },
                });
                const data = response.data;
                proxyLines = data
                    .split("\n")
                    .filter((line) => line.trim() !== "");
            }
            catch (downloadError) {
                console.error(`Erreur lors du téléchargement depuis l'URL: ${downloadError}`);
                throw new Error(`Impossible de télécharger les proxies depuis l'URL fournie`);
            }
        }
        // Aucune source de proxy fournie
        else {
            throw new Error("Aucune source de proxy fournie. Veuillez fournir soit 'proxyList' soit 'proxyUrl' dans les options.");
        }
        // Parser chaque ligne au format: ip:port:username:password
        proxies = proxyLines
            .map((line) => {
            const parts = line.split(":");
            if (parts.length >= 4) {
                return {
                    host: parts[0].trim(),
                    port: parseInt(parts[1].trim(), 10),
                    username: parts[2].trim(),
                    password: parts.slice(3).join(":").trim(), // Support des mots de passe avec ':'
                };
            }
            return null;
        })
            .filter((proxy) => proxy !== null &&
            Boolean(proxy.host) &&
            !isNaN(proxy.port) &&
            Boolean(proxy.username) &&
            Boolean(proxy.password));
        if (proxies.length === 0) {
            throw new Error("Aucun proxy valide trouvé dans les données fournies");
        }
    }
    catch (error) {
        console.error(`Erreur lors du chargement des proxies: ${error}`);
        throw error;
    }
}
/**
 * Obtient un proxy aléatoire de la liste
 */
function getRandomProxy(useProxies) {
    if (!useProxies || proxies.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * proxies.length);
    return proxies[randomIndex];
}
/**
 * Retire un proxy défaillant de la liste
 */
function removeProxy(proxyToRemove) {
    proxies = proxies.filter((proxy) => !(proxy.host === proxyToRemove.host && proxy.port === proxyToRemove.port));
}
/**
 * Crée un agent proxy HTTPS pour axios avec authentification
 */
function createProxyAgent(proxy) {
    const proxyUrl = `http://${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@${proxy.host}:${proxy.port}`;
    return new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
}
/**
 * Fonction pour extraire les informations d'une carte (card)
 */
function extractCardInfo(cardElement, $) {
    const card = $(cardElement);
    // Structure à retourner
    const result = {
        type: "card",
        url: null,
        imageUrl: null,
        title: "",
        description: "",
        destination: "",
    };
    // Vérifier les deux formats possibles
    // Format 1: card-container est un lien <a>
    const cardContainer = card.find(".card-container");
    if (cardContainer.is("a")) {
        result.url = cardContainer.attr("href") || null;
    }
    // Format 2: card-content-container est un lien <a> à l'intérieur de card-container
    else {
        const contentContainer = card.find(".card-content-container");
        if (contentContainer.is("a")) {
            result.url = contentContainer.attr("href") || null;
        }
    }
    // Extraire l'URL de l'image (les deux formats peuvent avoir des images)
    // Vérifier d'abord dans .card-image
    let imgElement = card.find(".card-image img");
    if (imgElement.length === 0) {
        // Si pas trouvé, chercher dans d'autres structures comme .attachments
        imgElement = card.find(".attachments img, .gallery-video img");
    }
    if (imgElement.length > 0) {
        let imgSrc = imgElement.attr("src") || null;
        if (imgSrc) {
            // Remplacer /pic/ par https://nitter.net/pic/
            if (imgSrc.startsWith("/pic/")) {
                imgSrc = `${BASE_URL}${imgSrc}`;
            }
            else if (!imgSrc.startsWith("http")) {
                imgSrc = `${BASE_URL}${imgSrc.startsWith("/") ? imgSrc : `/${imgSrc}`}`;
            }
            result.imageUrl = imgSrc;
        }
    }
    // Extraire le titre (fonctionne pour les deux formats)
    const titleElement = card.find(".card-title");
    if (titleElement.length > 0) {
        result.title = titleElement.text().trim();
    }
    // Extraire la description (fonctionne pour les deux formats)
    const descriptionElement = card.find(".card-description");
    if (descriptionElement.length > 0) {
        result.description = descriptionElement.text().trim();
    }
    // Extraire la destination (principalement dans le format 1)
    const destinationElement = card.find(".card-destination");
    if (destinationElement.length > 0) {
        result.destination = destinationElement.text().trim();
    }
    // Compter les éléments non vides
    let nonEmptyCount = 0;
    if (result.url !== null)
        nonEmptyCount++;
    if (result.imageUrl !== null)
        nonEmptyCount++;
    if (result.title !== "")
        nonEmptyCount++;
    if (result.description !== "")
        nonEmptyCount++;
    if (result.destination !== "")
        nonEmptyCount++;
    // Ne retourner la carte que si au moins deux éléments sont remplis
    if (nonEmptyCount >= 2) {
        return result;
    }
    return null;
}
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
            // Extraire le nom complet du compte
            const fullnameElement = tweetElement.find(".fullname");
            const fullname = fullnameElement.text().trim() || username;
            // Vérifier le statut de vérification et le type
            const verifiedElement = tweetElement.find(".verified-icon");
            let isVerified = false;
            let verificationType = null;
            if (verifiedElement.length > 0) {
                isVerified = true;
                // Extraire le type de vérification des classes CSS
                const classes = verifiedElement.attr("class") || "";
                if (classes.includes("business")) {
                    verificationType = "business";
                }
                else if (classes.includes("blue")) {
                    verificationType = "blue";
                }
                else {
                    verificationType = "verified"; // Type générique si pas spécifique
                }
            }
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
            const imageTweet = [];
            tweetElement
                .find(".attachment.image a.still-image")
                .each((_, imgElement) => {
                const imgSrc = $(imgElement).attr("href");
                if (imgSrc) {
                    // Add base URL if it's a relative path
                    const fullImgSrc = imgSrc.startsWith("http")
                        ? imgSrc
                        : `${BASE_URL}${imgSrc}`;
                    imageTweet.push(fullImgSrc);
                }
            });
            // Collect video URLs from the tweet (legacy)
            const videoTweet = [];
            // Chercher les vidéos dans différentes structures possibles
            tweetElement.find("video, .gallery-video video, .attachment.video-container video").each((_, videoElement) => {
                const dataUrl = $(videoElement).attr("data-url");
                if (dataUrl) {
                    // Add base URL if it's a relative path
                    const fullVideoUrl = dataUrl.startsWith("http")
                        ? dataUrl
                        : `${BASE_URL}${dataUrl}`;
                    videoTweet.push(fullVideoUrl);
                }
            });
            // Collect detailed video information
            const videos = [];
            // Méthode 1: Chercher les balises video directement
            tweetElement.find("video").each((_, videoElement) => {
                const $video = $(videoElement);
                const posterUrl = $video.attr("poster");
                const dataUrl = $video.attr("data-url");
                const videoInfo = {
                    posterUrl: null,
                    videoUrl: null
                };
                // Process poster URL
                if (posterUrl) {
                    videoInfo.posterUrl = posterUrl.startsWith("http")
                        ? posterUrl
                        : `${BASE_URL}${posterUrl}`;
                }
                // Process video URL
                if (dataUrl) {
                    videoInfo.videoUrl = dataUrl.startsWith("http")
                        ? dataUrl
                        : `${BASE_URL}${dataUrl}`;
                }
                if (videoInfo.posterUrl || videoInfo.videoUrl) {
                    videos.push(videoInfo);
                }
            });
            // Méthode 2: Chercher les conteneurs de vidéo avec des images de prévisualisation
            tweetElement.find(".gallery-video, .video-container").each((_, containerElement) => {
                const $container = $(containerElement);
                // Chercher l'image de prévisualisation dans le conteneur
                const $img = $container.find("img");
                const posterUrl = $img.attr("src");
                // Chercher l'URL de la vidéo dans les attributs data-url
                const $videoElement = $container.find("[data-url]");
                const dataUrl = $videoElement.attr("data-url");
                if (posterUrl || dataUrl) {
                    const videoInfo = {
                        posterUrl: null,
                        videoUrl: null
                    };
                    // Process poster URL
                    if (posterUrl) {
                        videoInfo.posterUrl = posterUrl.startsWith("http")
                            ? posterUrl
                            : `${BASE_URL}${posterUrl}`;
                    }
                    // Process video URL
                    if (dataUrl) {
                        videoInfo.videoUrl = dataUrl.startsWith("http")
                            ? dataUrl
                            : `${BASE_URL}${dataUrl}`;
                    }
                    // Vérifier qu'on n'a pas déjà cette vidéo
                    const isDuplicate = videos.some(v => v.videoUrl === videoInfo.videoUrl || v.posterUrl === videoInfo.posterUrl);
                    if (!isDuplicate && (videoInfo.posterUrl || videoInfo.videoUrl)) {
                        videos.push(videoInfo);
                    }
                }
            });
            // Extract tweet statistics
            const stats = {
                comments: 0,
                retweets: 0,
                quotes: 0,
                likes: 0,
                views: 0
            };
            // Parse statistics from tweet-stats
            tweetElement.find(".tweet-stats .tweet-stat").each((_, statElement) => {
                const $stat = $(statElement);
                const iconElement = $stat.find(".icon-container span");
                const numberText = $stat.text().trim();
                // Extract number from text (remove non-numeric characters except commas)
                const numberMatch = numberText.match(/[\d,]+/);
                const number = numberMatch ? parseInt(numberMatch[0].replace(/,/g, ''), 10) : 0;
                // Determine stat type by icon class
                if (iconElement.hasClass("icon-comment")) {
                    stats.comments = number;
                }
                else if (iconElement.hasClass("icon-retweet")) {
                    stats.retweets = number;
                }
                else if (iconElement.hasClass("icon-quote")) {
                    stats.quotes = number;
                }
                else if (iconElement.hasClass("icon-heart")) {
                    stats.likes = number;
                }
                else if (iconElement.hasClass("icon-play")) {
                    stats.views = number;
                }
            });
            const cardElements = tweetElement.find(".card");
            const cards = [];
            cardElements.each((_, cardElement) => {
                const cardInfo = extractCardInfo(cardElement, $);
                if (cardInfo) {
                    cards.push(cardInfo);
                }
            });
            // Create tweet object
            tweets.push({
                id: cleanId,
                text,
                username,
                fullname,
                isVerified,
                verificationType,
                created_at: date ? date.toISOString() : "",
                timestamp: date ? date.getTime() : null,
                imageTweet,
                videoTweet,
                videos,
                stats,
                avatarUrl,
                cards,
                originalUrl: TWITTER_URL.replace("{username}", username).replace("{id}", cleanId),
            });
        }
        catch (error) {
            console.error(`Error extracting tweet: ${error}`);
        }
    });
    return { tweets, nextCursor };
}
/**
 * Fetch a single page of tweets
 */
async function fetchSinglePage(username, cursor, useProxies, seenTweets) {
    const url = cursor
        ? `${BASE_URL}/${username}?cursor=${encodeURIComponent(cursor)}`
        : `${BASE_URL}/${username}`;
    // Essayer plusieurs proxies en cas d'échec
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    let currentProxy = null;
    while (attempts < maxAttempts) {
        try {
            currentProxy = getRandomProxy(useProxies);
            // Fetch the HTML content using axios with proxy
            response = await axios_1.default.get(url, {
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "fr-FR,fr;q=0.9",
                    Priority: "u=0, i",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15",
                },
                timeout: 10000, // 10 seconds timeout
                httpsAgent: currentProxy
                    ? createProxyAgent(currentProxy)
                    : undefined,
                httpAgent: currentProxy
                    ? createProxyAgent(currentProxy)
                    : undefined,
            });
            // Succès - sortir de la boucle
            break;
        }
        catch (error) {
            attempts++;
            console.error(`Échec de la tentative ${attempts} pour ${url}: ${error}`);
            // Si on utilise un proxy et qu'il y a une erreur, on le retire de la liste
            if (currentProxy && useProxies) {
                removeProxy(currentProxy);
            }
            if (attempts >= maxAttempts) {
                throw error;
            }
            // Attendre un peu avant de réessayer avec un autre proxy
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    const html = response.data;
    const result = extractTweetsFromHtml(html, username, seenTweets);
    return {
        ...result,
        html
    };
}
/**
 * Fetch tweets for a given username
 */
async function fetchTweets(username, maxPages = 3, useProxies = false, proxyOptions, useConcurrency = false) {
    try {
        // Charger les proxies au début
        await loadProxies(useProxies, proxyOptions);
        const allTweets = [];
        const seenTweets = new Set();
        let userProfile = null;
        if (useConcurrency && maxPages > 1) {
            // Mode concurrent optimisé : récupération séquentielle rapide sans délais
            let nextCursor = null;
            let pagesProcessed = 0;
            // Récupérer les pages une par une mais sans délai entre les requêtes
            while (pagesProcessed < maxPages) {
                try {
                    const result = await fetchSinglePage(username, nextCursor, useProxies, seenTweets);
                    // Extraire le profil utilisateur depuis la première page
                    if (pagesProcessed === 0 && result.html) {
                        userProfile = extractUserProfile(result.html, username);
                    }
                    // Ajouter les tweets
                    for (const tweet of result.tweets) {
                        if (!seenTweets.has(tweet.id)) {
                            allTweets.push(tweet);
                            seenTweets.add(tweet.id);
                        }
                    }
                    nextCursor = result.nextCursor;
                    pagesProcessed++;
                    // Pas de délai en mode concurrent - on enchaîne directement
                    if (!nextCursor) {
                        break;
                    }
                }
                catch (error) {
                    console.error(`Erreur lors de la récupération de la page ${pagesProcessed + 1}:`, error);
                    break;
                }
            }
        }
        else {
            // Mode séquentiel : traitement page par page avec délais (comportement original)
            let nextCursor = null;
            let pagesProcessed = 0;
            do {
                const result = await fetchSinglePage(username, nextCursor, useProxies, seenTweets);
                // Extraire le profil utilisateur depuis la première page
                if (pagesProcessed === 0 && result.html) {
                    userProfile = extractUserProfile(result.html, username);
                }
                // Add tweets to the result and update seen tweets
                for (const tweet of result.tweets) {
                    allTweets.push(tweet);
                    seenTweets.add(tweet.id);
                }
                nextCursor = result.nextCursor;
                pagesProcessed++;
                // Add delay between requests to avoid rate limiting
                if (nextCursor && pagesProcessed < maxPages) {
                    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
                }
            } while (nextCursor && pagesProcessed < maxPages);
        }
        return {
            userProfile,
            tweets: allTweets
        };
    }
    catch (error) {
        console.error(`Error fetching tweets: ${error}`);
        return {
            userProfile: null,
            tweets: []
        };
    }
    finally {
        // Pas de nettoyage de fichier nécessaire car on utilise axios directement
    }
}
/**
 * Extract user profile information from HTML content
 */
function extractUserProfile(html, username) {
    const $ = cheerio.load(html);
    try {
        // Extraire le nom complet
        const fullnameElement = $(".profile-card .profile-card-fullname");
        const fullname = fullnameElement.text().trim() || username;
        // Extraire la description/bio
        const descriptionElement = $(".profile-card .profile-bio");
        const description = descriptionElement.text().trim() || "";
        // Vérifier le statut de vérification
        const verifiedElement = $(".profile-card .verified-icon");
        let isVerified = false;
        let verificationType = null;
        if (verifiedElement.length > 0) {
            isVerified = true;
            const classes = verifiedElement.attr("class") || "";
            if (classes.includes("business")) {
                verificationType = "business";
            }
            else if (classes.includes("blue")) {
                verificationType = "blue";
            }
            else {
                verificationType = "verified";
            }
        }
        // Extraire l'URL de l'avatar
        const avatarElement = $(".profile-card .profile-card-avatar img");
        let avatarUrl = null;
        if (avatarElement.length > 0) {
            avatarUrl = avatarElement.attr("src") || null;
            if (avatarUrl && !avatarUrl.startsWith("http")) {
                avatarUrl = `${BASE_URL}${avatarUrl}`;
            }
        }
        // Extraire l'URL de la bannière
        const bannerElement = $(".profile-banner img");
        let bannerUrl = null;
        if (bannerElement.length > 0) {
            bannerUrl = bannerElement.attr("src") || null;
            if (bannerUrl && !bannerUrl.startsWith("http")) {
                bannerUrl = `${BASE_URL}${bannerUrl}`;
            }
        }
        // Extraire les statistiques du profil
        const stats = {
            tweets: 0,
            following: 0,
            followers: 0,
            likes: 0
        };
        // Parser les statistiques depuis .profile-statlist li
        $(".profile-statlist li").each((_, statElement) => {
            const $stat = $(statElement);
            const headerText = $stat.find(".profile-stat-header").text().trim().toLowerCase();
            const numText = $stat.find(".profile-stat-num").text().trim();
            // Convertir le nombre (gérer les virgules et les formats comme "2,303,191")
            const number = parseInt(numText.replace(/,/g, ''), 10) || 0;
            if (headerText.includes("tweet")) {
                stats.tweets = number;
            }
            else if (headerText.includes("following")) {
                stats.following = number;
            }
            else if (headerText.includes("follower")) {
                stats.followers = number;
            }
            else if (headerText.includes("like")) {
                stats.likes = number;
            }
        });
        // Extraire la date d'inscription
        const joinDateElement = $(".profile-joindate");
        let joinDate = null;
        if (joinDateElement.length > 0) {
            const joinText = joinDateElement.text().trim();
            // Extraire la date du format "Joined Month Year"
            const dateMatch = joinText.match(/joined\s+(.+)/i);
            if (dateMatch) {
                joinDate = dateMatch[1].trim();
            }
        }
        // Extraire la localisation
        const locationElement = $(".profile-location");
        const location = locationElement.text().trim() || null;
        // Extraire le site web
        const websiteElement = $(".profile-website a");
        let website = null;
        if (websiteElement.length > 0) {
            website = websiteElement.attr("href") || websiteElement.text().trim() || null;
        }
        return {
            username,
            fullname,
            description,
            isVerified,
            verificationType,
            avatarUrl,
            bannerUrl,
            stats,
            joinDate,
            location,
            website
        };
    }
    catch (error) {
        console.error(`Error extracting user profile: ${error}`);
        return null;
    }
}
