# 🐦 Nitter Scraper V2

<div align="center">

**Enhanced fork** of the original [nitter-scraper](https://www.npmjs.com/package/nitter-scraper) package with advanced features and complete proxy support.

**Fork amélioré** du package original [nitter-scraper](https://www.npmjs.com/package/nitter-scraper) avec des fonctionnalités avancées et un support proxy complet.

---

### 🌐 Language / Langue

[![English](https://img.shields.io/badge/🇺🇸-English-blue)](#english) [![Français](https://img.shields.io/badge/🇫🇷-Français-red)](#français)

</div>

---

# English

<details open>
<summary><b>📖 Click to expand English documentation</b></summary>

A powerful TypeScript package for scraping tweets from Nitter without authentication. This enhanced version adds proxy support, media extraction (images/videos), preview cards, account verification info, tweet statistics, concurrent mode and much more!

## ✨ Features

- 🚀 **Authentication-free scraping** - No Twitter API keys needed
- 🔄 **Automatic pagination handling** - Fetches multiple pages automatically
- 🛡️ **Rate limiting protection** - Smart delays between requests
- 🌐 **Advanced proxy support** - Three modes: no proxy, custom list, or download URL
- 📷 **Media extraction** - Images, videos with detailed info and preview cards
- 👤 **User information** - Avatar, full name, verification status and type
- 📊 **Tweet statistics** - Comments, retweets, quotes, likes, views
- ⚡ **Concurrent mode** - Fast sequential fetching without delays
- 🔧 **Native TypeScript** - Complete typings and intellisense
- ⚡ **Optimized performance** - Error handling and automatic retry

## 📦 Installation

```bash
# Install as a library
npm install nitter-scraper-v2

# Or install globally to use as CLI
npm install -g nitter-scraper-v2
```

## 🚀 Quick Start

### As a Library

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function main() {
  // Basic usage
  const tweets = await fetchTweets("elonmusk", 3);
  console.log(`Found ${tweets.length} tweets`);

  tweets.forEach((tweet) => {
    console.log(`${tweet.fullname} (@${tweet.username}): ${tweet.text}`);

    // Verification info
    if (tweet.isVerified) {
      console.log(`✅ Verified (${tweet.verificationType})`);
    }

    // Statistics
    console.log(
      `📊 ${tweet.stats.likes} likes, ${tweet.stats.retweets} retweets`
    );

    // Media
    if (tweet.imageTweet.length > 0) {
      console.log(`📷 Images: ${tweet.imageTweet.length}`);
    }
    if (tweet.videos.length > 0) {
      console.log(`🎥 Videos: ${tweet.videos.length}`);
      tweet.videos.forEach((video) => {
        console.log(`  - Video: ${video.videoUrl}`);
        console.log(`  - Poster: ${video.posterUrl}`);
      });
    }
  });
}

main().catch(console.error);
```

### Concurrent Mode for Faster Scraping

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function fastScraping() {
  // Enable concurrent mode for faster fetching (no delays between requests)
  const tweets = await fetchTweets(
    "username",
    5, // maxPages
    false, // useProxies
    undefined, // proxyOptions
    true // useConcurrency - NEW!
  );

  console.log(`Fetched ${tweets.length} tweets quickly!`);
}
```

### As a CLI Tool

```bash
# Run the scraper using Bun
bun run cli

# Or if installed globally
nitter-scraper-v2
```

## 📚 Complete API

### fetchTweets

```typescript
function fetchTweets(
  username: string,
  maxPages?: number,
  useProxies?: boolean,
  proxyOptions?: ProxyOptions,
  useConcurrency?: boolean // NEW!
): Promise<Tweet[]>;
```

#### Parameters

| Parameter        | Type           | Default      | Description                                      |
| ---------------- | -------------- | ------------ | ------------------------------------------------ |
| `username`       | `string`       | **required** | Twitter username (without @)                     |
| `maxPages`       | `number`       | `3`          | Maximum number of pages to fetch                 |
| `useProxies`     | `boolean`      | `false`      | Enable proxy usage                               |
| `proxyOptions`   | `ProxyOptions` | `undefined`  | Proxy configuration options                      |
| `useConcurrency` | `boolean`      | `false`      | **NEW!** Enable fast sequential mode (no delays) |

## 🌐 Proxy Management

This version offers three proxy management modes:

### 1. No proxy (default)

```typescript
const tweets = await fetchTweets("username", 3, false);
```

### 2. Custom proxy list

```typescript
import { fetchTweets, ProxyOptions } from "nitter-scraper-v2";

const proxyOptions: ProxyOptions = {
  proxyList: [
    "192.168.1.1:8080:user1:pass1",
    "192.168.1.2:8080:user2:pass2",
    "192.168.1.3:8080:user3:pass3",
  ],
};

const tweets = await fetchTweets("username", 3, true, proxyOptions);
```

### 3. Proxy download URL

```typescript
const proxyOptions: ProxyOptions = {
  proxyUrl: "https://your-server.com/proxies.txt",
};

const tweets = await fetchTweets("username", 3, true, proxyOptions);
```

## 📝 TypeScript Types

### Tweet (Updated)

```typescript
interface Tweet {
  id: string; // Unique tweet ID
  text: string; // Tweet text content
  username: string; // Author username
  fullname: string; // NEW! Author full name
  isVerified: boolean; // NEW! Verification status
  verificationType: string | null; // NEW! Verification type: "business", "blue", "verified"
  created_at: string; // Creation date (ISO string)
  timestamp: number | null; // Unix timestamp (milliseconds)
  imageTweet: string[]; // Attached image URLs
  videoTweet: string[]; // Attached video URLs (legacy)
  videos: VideoInfo[]; // NEW! Detailed video information
  stats: TweetStats; // NEW! Tweet statistics
  avatarUrl: string | null; // User avatar URL
  cards: Card[]; // Preview cards
  originalUrl: string; // Original tweet URL on Twitter/X
}
```

### TweetStats (NEW!)

```typescript
interface TweetStats {
  comments: number; // Number of comments
  retweets: number; // Number of retweets
  quotes: number; // Number of quote tweets
  likes: number; // Number of likes
  views: number; // Number of views
}
```

### VideoInfo (NEW!)

```typescript
interface VideoInfo {
  posterUrl: string | null; // Video thumbnail/poster image URL
  videoUrl: string | null; // Video file URL
}
```

### ProxyOptions

```typescript
export type ProxyOptions = {
  proxyList?: string[]; // Proxy list in "host:port:username:password" format
  proxyUrl?: string; // URL to download proxy list
};
```

### Card

```typescript
interface Card {
  type: "card"; // Card type
  url: string | null; // Destination URL
  imageUrl: string | null; // Preview image URL
  title: string; // Card title
  description: string; // Card description
  destination: string; // Destination domain
}
```

## 🔧 Advanced Configuration

### Concurrent Mode vs Sequential Mode

```typescript
// Sequential mode (default) - 2 second delays between requests
const tweetsSequential = await fetchTweets(
  "username",
  5,
  false,
  undefined,
  false
);

// Concurrent mode - no delays, faster fetching
const tweetsConcurrent = await fetchTweets(
  "username",
  5,
  false,
  undefined,
  true
);
```

**Note**: Concurrent mode doesn't fetch pages in parallel (due to cursor-based pagination), but removes delays between sequential requests for faster overall performance.

### Proxy Format

Proxies must be in the format: `host:port:username:password`

Example:

```
proxy1.example.com:8080:myuser:mypass
192.168.1.100:3128:admin:secret123
proxy-server.net:1080:client:password
```

### Error Handling

```typescript
try {
  const tweets = await fetchTweets("username", 5, true, proxyOptions, true);

  if (tweets.length === 0) {
    console.log("No tweets found");
  } else {
    console.log(`${tweets.length} tweets retrieved successfully`);
  }
} catch (error) {
  console.error("Scraping error:", error);
}
```

### Filtering and Processing

```typescript
const tweets = await fetchTweets("username", 3);

// Filter verified accounts
const verifiedTweets = tweets.filter((tweet) => tweet.isVerified);

// Filter by verification type
const businessAccounts = tweets.filter(
  (tweet) => tweet.verificationType === "business"
);
const blueAccounts = tweets.filter(
  (tweet) => tweet.verificationType === "blue"
);

// Filter tweets with high engagement
const popularTweets = tweets.filter((tweet) => tweet.stats.likes > 100);

// Filter tweets with videos
const tweetsWithVideos = tweets.filter((tweet) => tweet.videos.length > 0);

// Extract all video information
const allVideos = tweets.flatMap((tweet) => tweet.videos);
console.log(`Found ${allVideos.length} videos total`);

// Filter recent tweets (last 24h)
const recentTweets = tweets.filter((tweet) => {
  if (!tweet.timestamp) return false;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return tweet.timestamp > oneDayAgo;
});

// Extract all media
const allImages = tweets.flatMap((tweet) => tweet.imageTweet);
const allVideos = tweets.flatMap((tweet) => tweet.videoTweet);
```

## 💡 Usage Examples

### Account Analysis

```typescript
async function analyzeAccount(username: string) {
  const tweets = await fetchTweets(username, 5, false, undefined, true);

  if (tweets.length === 0) {
    console.log("No tweets found");
    return;
  }

  const firstTweet = tweets[0];
  console.log(`Account: ${firstTweet.fullname} (@${firstTweet.username})`);
  console.log(
    `Verified: ${
      firstTweet.isVerified ? `Yes (${firstTweet.verificationType})` : "No"
    }`
  );

  // Calculate engagement statistics
  const totalLikes = tweets.reduce((sum, tweet) => sum + tweet.stats.likes, 0);
  const totalRetweets = tweets.reduce(
    (sum, tweet) => sum + tweet.stats.retweets,
    0
  );
  const avgLikes = Math.round(totalLikes / tweets.length);
  const avgRetweets = Math.round(totalRetweets / tweets.length);

  console.log(`Average engagement: ${avgLikes} likes, ${avgRetweets} retweets`);

  // Media statistics
  const tweetsWithImages = tweets.filter((t) => t.imageTweet.length > 0).length;
  const tweetsWithVideos = tweets.filter((t) => t.videos.length > 0).length;

  console.log(
    `Media usage: ${tweetsWithImages} tweets with images, ${tweetsWithVideos} with videos`
  );
}
```

### Performance Comparison

```typescript
async function comparePerformance(username: string) {
  console.log("Testing sequential mode...");
  const startSequential = Date.now();
  const tweetsSequential = await fetchTweets(
    username,
    3,
    false,
    undefined,
    false
  );
  const timeSequential = Date.now() - startSequential;

  console.log("Testing concurrent mode...");
  const startConcurrent = Date.now();
  const tweetsConcurrent = await fetchTweets(
    username,
    3,
    false,
    undefined,
    true
  );
  const timeConcurrent = Date.now() - startConcurrent;

  console.log(
    `Sequential: ${tweetsSequential.length} tweets in ${timeSequential}ms`
  );
  console.log(
    `Concurrent: ${tweetsConcurrent.length} tweets in ${timeConcurrent}ms`
  );
  console.log(
    `Speed improvement: ${Math.round((timeSequential / timeConcurrent) * 100)}%`
  );
}
```

### Video Extraction

```typescript
async function extractVideos(username: string) {
  const tweets = await fetchTweets(username, 5, false, undefined, true);

  const videosFound = tweets.filter((tweet) => tweet.videos.length > 0);

  console.log(`Found ${videosFound.length} tweets with videos`);

  videosFound.forEach((tweet, index) => {
    console.log(`\nTweet ${index + 1}: ${tweet.text.substring(0, 50)}...`);
    tweet.videos.forEach((video, videoIndex) => {
      console.log(`  Video ${videoIndex + 1}:`);
      console.log(`    - Video URL: ${video.videoUrl}`);
      console.log(`    - Poster URL: ${video.posterUrl}`);
    });
  });
}
```

### Scraping with automatic retry

```typescript
async function scrapeWithRetry(username: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tweets = await fetchTweets(username, 3, true, undefined, true);
      return tweets;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
```

### Content Analysis

```typescript
async function analyzeTweets(username: string) {
  const tweets = await fetchTweets(username, 5, false, undefined, true);

  const stats = {
    total: tweets.length,
    verified: tweets[0]?.isVerified || false,
    verificationType: tweets[0]?.verificationType || null,
    withImages: tweets.filter((t) => t.imageTweet.length > 0).length,
    withVideos: tweets.filter((t) => t.videos.length > 0).length,
    withCards: tweets.filter((t) => t.cards.length > 0).length,
    avgLength:
      tweets.reduce((sum, t) => sum + t.text.length, 0) / tweets.length,
    totalLikes: tweets.reduce((sum, t) => sum + t.stats.likes, 0),
    totalRetweets: tweets.reduce((sum, t) => sum + t.stats.retweets, 0),
    avgEngagement:
      tweets.reduce((sum, t) => sum + t.stats.likes + t.stats.retweets, 0) /
      tweets.length,
  };

  console.log("Tweet statistics:", stats);
  return stats;
}
```

### Export to JSON

```typescript
import * as fs from "fs";

async function exportTweets(username: string, filename: string) {
  const tweets = await fetchTweets(username, 10, true, undefined, true);

  const exportData = {
    username,
    scrapedAt: new Date().toISOString(),
    totalTweets: tweets.length,
    accountInfo:
      tweets.length > 0
        ? {
            fullname: tweets[0].fullname,
            isVerified: tweets[0].isVerified,
            verificationType: tweets[0].verificationType,
            avatarUrl: tweets[0].avatarUrl,
          }
        : null,
    tweets,
  };

  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  console.log(`${tweets.length} tweets exported to ${filename}`);
}

// Usage
exportTweets("elonmusk", "elonmusk_tweets.json");
```

## ⚡ Performance and Optimization

### Recommendations

- **Concurrent mode**: Use `useConcurrency: true` for faster scraping when you need multiple pages
- **Multiple pages**: Limit the number of pages to avoid timeouts
- **Proxies**: Use quality proxies to avoid blocking
- **Delays**: Default delay between requests is 2 seconds (removed in concurrent mode)
- **Retry**: System automatically retries up to 3 times per request

### Performance Comparison

| Mode       | 3 Pages | 5 Pages | 10 Pages |
| ---------- | ------- | ------- | -------- |
| Sequential | ~8s     | ~12s    | ~22s     |
| Concurrent | ~3s     | ~5s     | ~8s      |

### Limitations

- **Rate limiting**: Nitter may limit too frequent requests
- **Availability**: Nitter instances may be temporarily unavailable
- **Proxies**: Failed proxies are automatically removed from the list
- **Pagination**: True concurrency isn't possible due to cursor-based pagination

## 🛡️ Security and Best Practices

### Proxy Management

```typescript
// ✅ Good: Proxies with authentication
const secureProxyOptions: ProxyOptions = {
  proxyList: ["premium-proxy.com:8080:myuser:strongpassword"],
};

// ❌ Avoid: Public proxies without authentication
const unsecureProxyOptions: ProxyOptions = {
  proxyList: [
    "free-proxy.com:8080::", // No authentication
  ],
};
```

### Respecting Limits

```typescript
// ✅ Good: Reasonable limitation
const tweets = await fetchTweets("username", 3); // Max 3 pages

// ✅ Good: Fast scraping with concurrent mode
const tweets = await fetchTweets("username", 5, false, undefined, true);

// ❌ Avoid: Too many pages at once
const tweets = await fetchTweets("username", 50); // Risk of blocking
```

## 🔄 Migration from Original Version

If you're migrating from the original `nitter-scraper` package:

```typescript
// Old code
import { fetchTweets } from "nitter-scraper";
const tweets = await fetchTweets("username", 3);

// New code (compatible)
import { fetchTweets } from "nitter-scraper-v2";
const tweets = await fetchTweets("username", 3);

// New features
const tweets = await fetchTweets(
  "username",
  3,
  true,
  {
    proxyList: ["proxy:port:user:pass"],
  },
  true
); // Enable concurrent mode
```

### New Available Properties

- `tweet.fullname` - **NEW!** User's full display name
- `tweet.isVerified` - **NEW!** Verification status (boolean)
- `tweet.verificationType` - **NEW!** Type of verification ("business", "blue", "verified")
- `tweet.stats` - **NEW!** Tweet statistics (likes, retweets, comments, quotes, views)
- `tweet.videos` - **NEW!** Detailed video information with poster and video URLs
- `tweet.imageTweet[]` - Image URLs
- `tweet.videoTweet[]` - Video URLs (legacy)
- `tweet.avatarUrl` - User avatar
- `tweet.cards[]` - Preview cards
- `tweet.originalUrl` - Original tweet URL

</details>

---

# Français

<details>
<summary><b>📖 Cliquez pour développer la documentation française</b></summary>

Un package TypeScript puissant pour scraper les tweets depuis Nitter sans authentification. Cette version améliorée ajoute le support des proxies, l'extraction de médias (images/vidéos), les cartes de prévisualisation, les informations de vérification des comptes, les statistiques des tweets, le mode concurrent et bien plus encore !

## ✨ Fonctionnalités

- 🚀 **Scraping sans authentification** - Pas besoin de clés API Twitter
- 🔄 **Gestion automatique de la pagination** - Récupère plusieurs pages automatiquement
- 🛡️ **Protection contre le rate limiting** - Délais intelligents entre les requêtes
- 🌐 **Support proxy avancé** - Trois modes : sans proxy, liste personnalisée, ou URL de téléchargement
- 📷 **Extraction de médias** - Images, vidéos avec infos détaillées et cartes de prévisualisation
- 👤 **Informations utilisateur** - Avatar, nom complet, statut et type de vérification
- 📊 **Statistiques des tweets** - Commentaires, retweets, citations, likes, vues
- ⚡ **Mode concurrent** - Récupération séquentielle rapide sans délais
- 🔧 **TypeScript natif** - Typages complets et intellisense
- ⚡ **Performance optimisée** - Gestion d'erreurs et retry automatique

## 📦 Installation

```bash
# Installation comme librairie
npm install nitter-scraper-v2

# Ou installation globale pour utiliser en CLI
npm install -g nitter-scraper-v2
```

## 🚀 Utilisation rapide

### En tant que librairie

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function main() {
  // Utilisation basique
  const tweets = await fetchTweets("elonmusk", 3);
  console.log(`Trouvé ${tweets.length} tweets`);

  tweets.forEach((tweet) => {
    console.log(`${tweet.fullname} (@${tweet.username}): ${tweet.text}`);

    // Informations de vérification
    if (tweet.isVerified) {
      console.log(`✅ Vérifié (${tweet.verificationType})`);
    }

    // Statistiques
    console.log(
      `📊 ${tweet.stats.likes} likes, ${tweet.stats.retweets} retweets`
    );

    // Médias
    if (tweet.imageTweet.length > 0) {
      console.log(`📷 Images: ${tweet.imageTweet.length}`);
    }
    if (tweet.videos.length > 0) {
      console.log(`🎥 Vidéos: ${tweet.videos.length}`);
      tweet.videos.forEach((video) => {
        console.log(`  - Vidéo: ${video.videoUrl}`);
        console.log(`  - Miniature: ${video.posterUrl}`);
      });
    }
  });
}

main().catch(console.error);
```

### Mode concurrent pour un scraping plus rapide

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function scrapingRapide() {
  // Activer le mode concurrent pour une récupération plus rapide (pas de délais entre les requêtes)
  const tweets = await fetchTweets(
    "username",
    5, // maxPages
    false, // useProxies
    undefined, // proxyOptions
    true // useConcurrency - NOUVEAU !
  );

  console.log(`Récupéré ${tweets.length} tweets rapidement !`);
}
```

### En tant qu'outil CLI

```bash
# Lancer le scraper avec Bun
bun run cli

# Ou si installé globalement
nitter-scraper-v2
```

## 📚 API Complète

### fetchTweets

```typescript
function fetchTweets(
  username: string,
  maxPages?: number,
  useProxies?: boolean,
  proxyOptions?: ProxyOptions,
  useConcurrency?: boolean // NOUVEAU !
): Promise<Tweet[]>;
```

#### Paramètres

| Paramètre        | Type           | Défaut      | Description                                                   |
| ---------------- | -------------- | ----------- | ------------------------------------------------------------- |
| `username`       | `string`       | **requis**  | Nom d'utilisateur Twitter (sans @)                            |
| `maxPages`       | `number`       | `3`         | Nombre maximum de pages à récupérer                           |
| `useProxies`     | `boolean`      | `false`     | Activer l'utilisation des proxies                             |
| `proxyOptions`   | `ProxyOptions` | `undefined` | Options de configuration des proxies                          |
| `useConcurrency` | `boolean`      | `false`     | Activer le mode séquentiel rapide (sans délais) |

## 🌐 Gestion des Proxies

Cette version offre trois modes de gestion des proxies :

### 1. Sans proxy (par défaut)

```typescript
const tweets = await fetchTweets("username", 3, false);
```

### 2. Liste de proxies personnalisée

```typescript
import { fetchTweets, ProxyOptions } from "nitter-scraper-v2";

const proxyOptions: ProxyOptions = {
  proxyList: [
    "192.168.1.1:8080:user1:pass1",
    "192.168.1.2:8080:user2:pass2",
    "192.168.1.3:8080:user3:pass3",
  ],
};

const tweets = await fetchTweets("username", 3, true, proxyOptions);
```

### 3. URL de téléchargement des proxies

```typescript
const proxyOptions: ProxyOptions = {
  proxyUrl: "https://votre-serveur.com/proxies.txt",
};

const tweets = await fetchTweets("username", 3, true, proxyOptions);
```

## 📝 Types TypeScript

### Tweet (Mis à jour)

```typescript
interface Tweet {
  id: string; // ID unique du tweet
  text: string; // Contenu textuel du tweet
  username: string; // Nom d'utilisateur de l'auteur
  fullname: string; // NOUVEAU ! Nom complet de l'auteur
  isVerified: boolean; // NOUVEAU ! Statut de vérification
  verificationType: string | null; // NOUVEAU ! Type de vérification : "business", "blue", "verified"
  created_at: string; // Date de création (chaîne ISO)
  timestamp: number | null; // Timestamp Unix (millisecondes)
  imageTweet: string[]; // URLs des images attachées
  videoTweet: string[]; // URLs des vidéos attachées (legacy)
  videos: VideoInfo[]; // NOUVEAU ! Informations détaillées des vidéos
  stats: TweetStats; // NOUVEAU ! Statistiques du tweet
  avatarUrl: string | null; // URL de l'avatar de l'utilisateur
  cards: Card[]; // Cartes de prévisualisation
  originalUrl: string; // URL originale du tweet sur Twitter/X
}
```

### TweetStats (NOUVEAU !)

```typescript
interface TweetStats {
  comments: number; // Nombre de commentaires
  retweets: number; // Nombre de retweets
  quotes: number; // Nombre de citations
  likes: number; // Nombre de likes
  views: number; // Nombre de vues
}
```

### VideoInfo (NOUVEAU !)

```typescript
interface VideoInfo {
  posterUrl: string | null; // URL de la miniature/poster de la vidéo
  videoUrl: string | null; // URL du fichier vidéo
}
```

### ProxyOptions

```typescript
export type ProxyOptions = {
  proxyList?: string[]; // Liste de proxies au format "host:port:username:password"
  proxyUrl?: string; // URL pour télécharger la liste de proxies
};
```

### Card

```typescript
interface Card {
  type: "card"; // Type de la carte
  url: string | null; // URL de destination
  imageUrl: string | null; // URL de l'image de prévisualisation
  title: string; // Titre de la carte
  description: string; // Description de la carte
  destination: string; // Domaine de destination
}
```

## 🔧 Configuration avancée

### Mode concurrent vs Mode séquentiel

```typescript
// Mode séquentiel (par défaut) - délais de 2 secondes entre les requêtes
const tweetsSequentiel = await fetchTweets(
  "username",
  5,
  false,
  undefined,
  false
);

// Mode concurrent - pas de délais, récupération plus rapide
const tweetsConcurrent = await fetchTweets(
  "username",
  5,
  false,
  undefined,
  true
);
```

**Note** : Le mode concurrent ne récupère pas les pages en parallèle (à cause de la pagination basée sur les curseurs), mais supprime les délais entre les requêtes séquentielles pour une performance globale plus rapide.

### Format des proxies

Les proxies doivent être au format : `host:port:username:password`

Exemple :

```
proxy1.example.com:8080:monuser:monpass
192.168.1.100:3128:admin:secret123
proxy-server.net:1080:client:password
```

### Gestion des erreurs

```typescript
try {
  const tweets = await fetchTweets("username", 5, true, proxyOptions, true);

  if (tweets.length === 0) {
    console.log("Aucun tweet trouvé");
  } else {
    console.log(`${tweets.length} tweets récupérés avec succès`);
  }
} catch (error) {
  console.error("Erreur lors du scraping:", error);
}
```

### Filtrage et traitement

```typescript
const tweets = await fetchTweets("username", 3);

// Filtrer les comptes vérifiés
const tweetsVerifies = tweets.filter((tweet) => tweet.isVerified);

// Filtrer par type de vérification
const comptesBusiness = tweets.filter(
  (tweet) => tweet.verificationType === "business"
);
const comptesBlue = tweets.filter((tweet) => tweet.verificationType === "blue");

// Filtrer les tweets avec un fort engagement
const tweetsPopulaires = tweets.filter((tweet) => tweet.stats.likes > 100);

// Filtrer les tweets avec des vidéos
const tweetsAvecVideos = tweets.filter((tweet) => tweet.videos.length > 0);

// Extraire toutes les informations vidéo
const toutesLesVideos = tweets.flatMap((tweet) => tweet.videos);
console.log(`Trouvé ${toutesLesVideos.length} vidéos au total`);

// Filtrer les tweets récents (dernières 24h)
const tweetsRecents = tweets.filter((tweet) => {
  if (!tweet.timestamp) return false;
  const unJourAuparavant = Date.now() - 24 * 60 * 60 * 1000;
  return tweet.timestamp > unJourAuparavant;
});

// Extraire tous les médias
const toutesLesImages = tweets.flatMap((tweet) => tweet.imageTweet);
const toutesLesVideos = tweets.flatMap((tweet) => tweet.videoTweet);
```

## 💡 Exemples d'utilisation

### Analyse de compte

```typescript
async function analyserCompte(username: string) {
  const tweets = await fetchTweets(username, 5, false, undefined, true);

  if (tweets.length === 0) {
    console.log("Aucun tweet trouvé");
    return;
  }

  const premierTweet = tweets[0];
  console.log(`Compte: ${premierTweet.fullname} (@${premierTweet.username})`);
  console.log(
    `Vérifié: ${
      premierTweet.isVerified ? `Oui (${premierTweet.verificationType})` : "Non"
    }`
  );

  // Calculer les statistiques d'engagement
  const totalLikes = tweets.reduce((sum, tweet) => sum + tweet.stats.likes, 0);
  const totalRetweets = tweets.reduce(
    (sum, tweet) => sum + tweet.stats.retweets,
    0
  );
  const moyenneLikes = Math.round(totalLikes / tweets.length);
  const moyenneRetweets = Math.round(totalRetweets / tweets.length);

  console.log(
    `Engagement moyen: ${moyenneLikes} likes, ${moyenneRetweets} retweets`
  );

  // Statistiques des médias
  const tweetsAvecImages = tweets.filter((t) => t.imageTweet.length > 0).length;
  const tweetsAvecVideos = tweets.filter((t) => t.videos.length > 0).length;

  console.log(
    `Usage des médias: ${tweetsAvecImages} tweets avec images, ${tweetsAvecVideos} avec vidéos`
  );
}
```

### Comparaison de performance

```typescript
async function comparerPerformance(username: string) {
  console.log("Test du mode séquentiel...");
  const debutSequentiel = Date.now();
  const tweetsSequentiel = await fetchTweets(
    username,
    3,
    false,
    undefined,
    false
  );
  const tempsSequentiel = Date.now() - debutSequentiel;

  console.log("Test du mode concurrent...");
  const debutConcurrent = Date.now();
  const tweetsConcurrent = await fetchTweets(
    username,
    3,
    false,
    undefined,
    true
  );
  const tempsConcurrent = Date.now() - debutConcurrent;

  console.log(
    `Séquentiel: ${tweetsSequentiel.length} tweets en ${tempsSequentiel}ms`
  );
  console.log(
    `Concurrent: ${tweetsConcurrent.length} tweets en ${tempsConcurrent}ms`
  );
  console.log(
    `Amélioration de vitesse: ${Math.round(
      (tempsSequentiel / tempsConcurrent) * 100
    )}%`
  );
}
```

### Extraction de vidéos

```typescript
async function extraireVideos(username: string) {
  const tweets = await fetchTweets(username, 5, false, undefined, true);

  const videosTrouvees = tweets.filter((tweet) => tweet.videos.length > 0);

  console.log(`Trouvé ${videosTrouvees.length} tweets avec des vidéos`);

  videosTrouvees.forEach((tweet, index) => {
    console.log(`\nTweet ${index + 1}: ${tweet.text.substring(0, 50)}...`);
    tweet.videos.forEach((video, videoIndex) => {
      console.log(`  Vidéo ${videoIndex + 1}:`);
      console.log(`    - URL vidéo: ${video.videoUrl}`);
      console.log(`    - URL miniature: ${video.posterUrl}`);
    });
  });
}
```

### Scraping avec retry automatique

```typescript
async function scrapeWithRetry(username: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tweets = await fetchTweets(username, 3, true, undefined, true);
      return tweets;
    } catch (error) {
      console.log(`Tentative ${i + 1} échouée:`, error);
      if (i === maxRetries - 1) throw error;

      // Attendre avant de réessayer
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
```

### Analyse de contenu

```typescript
async function analyserTweets(username: string) {
  const tweets = await fetchTweets(username, 5, false, undefined, true);

  const stats = {
    total: tweets.length,
    verifie: tweets[0]?.isVerified || false,
    typeVerification: tweets[0]?.verificationType || null,
    avecImages: tweets.filter((t) => t.imageTweet.length > 0).length,
    avecVideos: tweets.filter((t) => t.videos.length > 0).length,
    avecCartes: tweets.filter((t) => t.cards.length > 0).length,
    longueurMoyenne:
      tweets.reduce((sum, t) => sum + t.text.length, 0) / tweets.length,
    totalLikes: tweets.reduce((sum, t) => sum + t.stats.likes, 0),
    totalRetweets: tweets.reduce((sum, t) => sum + t.stats.retweets, 0),
    engagementMoyen:
      tweets.reduce((sum, t) => sum + t.stats.likes + t.stats.retweets, 0) /
      tweets.length,
  };

  console.log("Statistiques des tweets:", stats);
  return stats;
}
```

### Export en JSON

```typescript
import * as fs from "fs";

async function exporterTweets(username: string, filename: string) {
  const tweets = await fetchTweets(username, 10, true, undefined, true);

  const donneesExport = {
    username,
    scrapeA: new Date().toISOString(),
    totalTweets: tweets.length,
    accountInfo:
      tweets.length > 0
        ? {
            nomComplet: tweets[0].fullname,
            estVerifie: tweets[0].isVerified,
            typeVerification: tweets[0].verificationType,
            urlAvatar: tweets[0].avatarUrl,
          }
        : null,
    tweets,
  };

  fs.writeFileSync(filename, JSON.stringify(donneesExport, null, 2));
  console.log(`${tweets.length} tweets exportés vers ${filename}`);
}

// Utilisation
exporterTweets("elonmusk", "elonmusk_tweets.json");
```

## ⚡ Performance et optimisation

### Recommandations

- **Mode concurrent** : Utilisez `useConcurrency: true` pour un scraping plus rapide quand vous avez besoin de plusieurs pages
- **Pages multiples** : Limitez le nombre de pages pour éviter les timeouts
- **Proxies** : Utilisez des proxies de qualité pour éviter les blocages
- **Délais** : Le délai par défaut entre les requêtes est de 2 secondes (supprimé en mode concurrent)
- **Retry** : Le système retry automatiquement jusqu'à 3 fois par requête

### Comparaison de performance

| Mode       | 3 Pages | 5 Pages | 10 Pages |
| ---------- | ------- | ------- | -------- |
| Séquentiel | ~8s     | ~12s    | ~22s     |
| Concurrent | ~3s     | ~5s     | ~8s      |

### Limites

- **Rate limiting** : Nitter peut limiter les requêtes trop fréquentes
- **Disponibilité** : Les instances Nitter peuvent être temporairement indisponibles
- **Proxies** : Les proxies défaillants sont automatiquement retirés de la liste
- **Pagination** : La vraie concurrence n'est pas possible à cause de la pagination basée sur les curseurs

## 🛡️ Sécurité et bonnes pratiques

### Gestion des proxies

```typescript
// ✅ Bon : Proxies avec authentification
const proxyOptionsSecurisees: ProxyOptions = {
  proxyList: ["premium-proxy.com:8080:monuser:motdepassefort"],
};

// ❌ Éviter : Proxies publics sans authentification
const proxyOptionsNonSecurisees: ProxyOptions = {
  proxyList: [
    "free-proxy.com:8080::", // Pas d'authentification
  ],
};
```

### Respect des limites

```typescript
// ✅ Bon : Limitation raisonnable
const tweets = await fetchTweets("username", 3); // Max 3 pages

// ✅ Bon : Scraping rapide avec le mode concurrent
const tweets = await fetchTweets("username", 5, false, undefined, true);

// ❌ Éviter : Trop de pages d'un coup
const tweets = await fetchTweets("username", 50); // Risque de blocage
```

## 🔄 Migration depuis la version originale

Si vous migrez depuis le package `nitter-scraper` original :

```typescript
// Ancien code
import { fetchTweets } from "nitter-scraper";
const tweets = await fetchTweets("username", 3);

// Nouveau code (compatible)
import { fetchTweets } from "nitter-scraper-v2";
const tweets = await fetchTweets("username", 3);

// Nouvelles fonctionnalités
const tweets = await fetchTweets(
  "username",
  3,
  true,
  {
    proxyList: ["proxy:port:user:pass"],
  },
  true
); // Activer le mode concurrent
```

### Nouvelles propriétés disponibles

- `tweet.fullname` - **NOUVEAU !** Nom complet d'affichage de l'utilisateur
- `tweet.isVerified` - **NOUVEAU !** Statut de vérification (booléen)
- `tweet.verificationType` - **NOUVEAU !** Type de vérification ("business", "blue", "verified")
- `tweet.stats` - **NOUVEAU !** Statistiques du tweet (likes, retweets, commentaires, citations, vues)
- `tweet.videos` - **NOUVEAU !** Informations détaillées des vidéos avec URLs de miniature et vidéo
- `tweet.imageTweet[]` - URLs des images
- `tweet.videoTweet[]` - URLs des vidéos (legacy)
- `tweet.avatarUrl` - Avatar de l'utilisateur
- `tweet.cards[]` - Cartes de prévisualisation
- `tweet.originalUrl` - URL originale du tweet

</details>

---

## 📄 License / Licence

MIT

## 🤝 Contributing / Contribution

Contributions are welcome! Feel free to:
Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork the project / Fork le projet
2. Create a branch for your feature / Créer une branche pour votre fonctionnalité
3. Commit your changes / Commit vos changements
4. Push to the branch / Push vers la branche
5. Open a Pull Request / Ouvrir une Pull Request

## 🐛 Support

For bugs and feature requests, please open an issue on GitHub.
Pour les bugs et demandes de fonctionnalités, veuillez ouvrir une issue sur GitHub.

---

**Note**: This package is an enhanced fork of the original `nitter-scraper` project. All new features have been developed while maintaining compatibility with the original API.

**Note**: Ce package est un fork amélioré du projet original `nitter-scraper`. Toutes les nouvelles fonctionnalités ont été développées en gardant la compatibilité avec l'API originale.
