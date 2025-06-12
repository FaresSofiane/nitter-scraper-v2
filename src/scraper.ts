import * as cheerio from "cheerio";
import axios from "axios";
import { getDateFromTimestamp } from "./utils/dateUtils";
import { Tweet } from "./types/Tweet";
import * as fs from "fs";
import { execSync } from "child_process";
import { HttpsProxyAgent } from "https-proxy-agent";

const BASE_URL = "https://nitter.net";
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds delay between requests
const TWITTER_URL = "https://x.com/{username}/status/{id}";

// Variables pour la gestion des proxies
let proxies: {
  host: string;
  port: number;
  username: string;
  password: string;
}[] = [];

// Interface pour les cartes de prévisualisation
export interface Card {
  type: "card";
  url: string | null;
  imageUrl: string | null;
  title: string;
  description: string;
  destination: string;
}

// Type pour définir les options de proxy
export type ProxyOptions = {
  proxyList?: string[]; // Liste de proxies au format "host:port:username:password"
  proxyUrl?: string; // URL pour télécharger la liste de proxies
};

/**
 * Télécharge et charge la liste des proxies depuis une URL ou utilise une liste fournie
 */
async function loadProxies(
  useProxies: boolean,
  proxyOptions?: ProxyOptions
): Promise<void> {
  if (!useProxies) {
    return;
  }

  try {
    let proxyLines: string[] = [];

    // Si une liste de proxies est fournie directement
    if (proxyOptions?.proxyList && proxyOptions.proxyList.length > 0) {
      proxyLines = proxyOptions.proxyList;
    }
    // Si une URL est fournie pour télécharger les proxies
    else if (proxyOptions?.proxyUrl) {
      try {
        // Utiliser axios pour télécharger la liste au lieu de curl
        const response = await axios.get(proxyOptions.proxyUrl, {
          timeout: 30000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15",
          },
        });

        const data = response.data;
        proxyLines = data
          .split("\n")
          .filter((line: string) => line.trim() !== "");
      } catch (downloadError) {
        console.error(
          `Erreur lors du téléchargement depuis l'URL: ${downloadError}`
        );
        throw new Error(
          `Impossible de télécharger les proxies depuis l'URL fournie`
        );
      }
    }
    // Aucune source de proxy fournie
    else {
      throw new Error(
        "Aucune source de proxy fournie. Veuillez fournir soit 'proxyList' soit 'proxyUrl' dans les options."
      );
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
      .filter(
        (proxy): proxy is NonNullable<typeof proxy> =>
          proxy !== null &&
          Boolean(proxy.host) &&
          !isNaN(proxy.port) &&
          Boolean(proxy.username) &&
          Boolean(proxy.password)
      );

    if (proxies.length === 0) {
      throw new Error("Aucun proxy valide trouvé dans les données fournies");
    }
  } catch (error) {
    console.error(`Erreur lors du chargement des proxies: ${error}`);
    throw error;
  }
}

/**
 * Obtient un proxy aléatoire de la liste
 */
function getRandomProxy(useProxies: boolean): {
  host: string;
  port: number;
  username: string;
  password: string;
} | null {
  if (!useProxies || proxies.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * proxies.length);
  return proxies[randomIndex];
}

/**
 * Retire un proxy défaillant de la liste
 */
function removeProxy(proxyToRemove: {
  host: string;
  port: number;
  username: string;
  password: string;
}): void {
  proxies = proxies.filter(
    (proxy) =>
      !(proxy.host === proxyToRemove.host && proxy.port === proxyToRemove.port)
  );
}

/**
 * Crée un agent proxy HTTPS pour axios avec authentification
 */
function createProxyAgent(proxy: {
  host: string;
  port: number;
  username: string;
  password: string;
}): HttpsProxyAgent<string> {
  const proxyUrl = `http://${encodeURIComponent(
    proxy.username
  )}:${encodeURIComponent(proxy.password)}@${proxy.host}:${proxy.port}`;
  return new HttpsProxyAgent(proxyUrl);
}

/**
 * Fonction pour extraire les informations d'une carte (card)
 */
function extractCardInfo(cardElement: any, $: cheerio.CheerioAPI): Card | null {
  const card = $(cardElement);

  // Structure à retourner
  const result: Card = {
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
      } else if (!imgSrc.startsWith("http")) {
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
  if (result.url !== null) nonEmptyCount++;
  if (result.imageUrl !== null) nonEmptyCount++;
  if (result.title !== "") nonEmptyCount++;
  if (result.description !== "") nonEmptyCount++;
  if (result.destination !== "") nonEmptyCount++;

  // Ne retourner la carte que si au moins deux éléments sont remplis
  if (nonEmptyCount >= 2) {
    return result;
  }

  return null;
}

/**
 * Extract tweets and next cursor from HTML content
 */
function extractTweetsFromHtml(
  html: string,
  username: string,
  existingTweets: Set<string>
): { tweets: Tweet[]; nextCursor: string | null } {
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
      let avatarUrl: string | null = null;
      if (avatarElement.length > 0) {
        avatarUrl = avatarElement.attr("src") || null;
        // Add base URL if it's a relative path
        if (avatarUrl && !avatarUrl.startsWith("http")) {
          avatarUrl = `${BASE_URL}${avatarUrl}`;
        }
      }

      // Collect image URLs from the tweet
      const imageTweet: string[] = [];
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

      // Collect video URLs from the tweet
      const videoTweet: string[] = [];
      tweetElement.find("video").each((_, videoElement) => {
        const dataUrl = $(videoElement).attr("data-url");
        if (dataUrl) {
          // Add base URL if it's a relative path
          const fullVideoUrl = dataUrl.startsWith("http")
            ? dataUrl
            : `${BASE_URL}${dataUrl}`;
          videoTweet.push(fullVideoUrl);
        }
      });

      const cardElements = tweetElement.find(".card");
      const cards: Card[] = [];
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
        created_at: date ? date.toISOString() : "",
        timestamp: date ? date.getTime() : null,
        imageTweet,
        videoTweet,
        avatarUrl,
        cards,
        originalUrl: TWITTER_URL.replace("{username}", username).replace(
          "{id}",
          cleanId
        ),
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
export async function fetchTweets(
  username: string,
  maxPages: number = 3,
  useProxies: boolean = false,
  proxyOptions?: ProxyOptions
): Promise<Tweet[]> {
  try {
    // Charger les proxies au début
    await loadProxies(useProxies, proxyOptions);

    const allTweets: Tweet[] = [];
    const seenTweets = new Set<string>();
    let nextCursor: string | null = null;
    let pagesProcessed = 0;

    do {
      // Construct URL - pas de cursor dans Nitter, il charge automatiquement plus de tweets
      const url = `${BASE_URL}/${username}`;

      // Essayer plusieurs proxies en cas d'échec
      let response: any;
      let attempts = 0;
      const maxAttempts = 3;
      let currentProxy: any = null;

      while (attempts < maxAttempts) {
        try {
          currentProxy = getRandomProxy(useProxies);

          // Fetch the HTML content using axios with proxy
          response = await axios.get(url, {
            headers: {
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "fr-FR,fr;q=0.9",
              Priority: "u=0, i",
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15",
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
        } catch (error) {
          attempts++;
          console.error(`Échec de la tentative ${attempts}: ${error}`);

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
      const { tweets, nextCursor: cursor } = extractTweetsFromHtml(
        html,
        username,
        seenTweets
      );

      // Add tweets to the result and update seen tweets
      for (const tweet of tweets) {
        allTweets.push(tweet);
        seenTweets.add(tweet.id);
      }

      nextCursor = cursor;
      pagesProcessed++;

      // Add delay between requests to avoid rate limiting
      if (nextCursor && pagesProcessed < maxPages) {
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
        );
      }
    } while (nextCursor && pagesProcessed < maxPages);

    return allTweets;
  } catch (error) {
    console.error(`Error fetching tweets: ${error}`);
    return [];
  } finally {
    // Pas de nettoyage de fichier nécessaire car on utilise axios directement
  }
}
