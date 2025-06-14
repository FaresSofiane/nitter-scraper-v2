# 🐦 Nitter Scraper V2

<div align="center">

**Advanced Twitter/X scraping solution** powered by Nitter with comprehensive proxy support and user profile extraction.

_Enhanced fork of the original [nitter-scraper](https://www.npmjs.com/package/nitter-scraper) package with extended features and enterprise-grade capabilities._

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)

**[GitHub Repository](https://github.com/FaresSofiane/nitter-scraper-v2)** • **[Author: Fares Sofiane](https://github.com/FaresSofiane)**

---

### 🌐 Language / Langue

[![English](https://img.shields.io/badge/🇺🇸-English-blue)](#english) [![Français](https://img.shields.io/badge/🇫🇷-Français-red)](#français)

</div>

---

# English

<details open>
<summary><b>📖 Click to expand English documentation</b></summary>

A comprehensive TypeScript package for extracting tweets and user profiles from Nitter without requiring authentication. This enhanced fork of the original [nitter-scraper](https://www.npmjs.com/package/nitter-scraper) provides advanced proxy management, complete media extraction, user profile statistics, and high-performance concurrent processing.

## ✨ Key Features

- 🚀 **Authentication-free scraping** - No Twitter API keys required
- 👤 **Complete user profiles** - Extract user information, statistics, and banner images
- 🔄 **Intelligent pagination** - Automatic multi-page processing with cursor management
- 🛡️ **Advanced proxy support** - Multiple proxy modes with automatic failover
- 📷 **Comprehensive media extraction** - Images, videos, and preview cards
- 📊 **Detailed statistics** - Tweet engagement metrics and user profile stats
- ⚡ **High-performance modes** - Concurrent processing for faster data collection
- 🔧 **Full TypeScript support** - Complete type definitions and IntelliSense
- 🛠️ **Enterprise-ready** - Error handling, retry logic, and production stability

## 📦 Installation

```bash
# Install as a library
npm install nitter-scraper-v2

# Or install globally for CLI usage
npm install -g nitter-scraper-v2
```

## 🚀 Quick Start

### Basic Usage with User Profile

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function main() {
  // Fetch tweets and user profile information
  const result = await fetchTweets("elonmusk", 3);

  // Display user profile information
  if (result.userProfile) {
    const profile = result.userProfile;
    console.log(`=== USER PROFILE ===`);
    console.log(`Name: ${profile.fullname} (@${profile.username})`);
    console.log(`Description: ${profile.description}`);
    console.log(
      `Verified: ${
        profile.isVerified ? `Yes (${profile.verificationType})` : "No"
      }`
    );
    console.log(`Avatar: ${profile.avatarUrl}`);
    console.log(`Banner: ${profile.bannerUrl}`);
    console.log(`Joined: ${profile.joinDate}`);
    console.log(`Location: ${profile.location}`);
    console.log(`Website: ${profile.website}`);

    console.log(`\n=== PROFILE STATISTICS ===`);
    console.log(`Tweets: ${profile.stats.tweets.toLocaleString()}`);
    console.log(`Following: ${profile.stats.following.toLocaleString()}`);
    console.log(`Followers: ${profile.stats.followers.toLocaleString()}`);
    console.log(`Likes: ${profile.stats.likes.toLocaleString()}`);
  }

  // Display tweets
  console.log(`\n=== TWEETS (${result.tweets.length}) ===`);
  result.tweets.forEach((tweet) => {
    console.log(`${tweet.fullname} (@${tweet.username}): ${tweet.text}`);
    console.log(
      `📊 ${tweet.stats.likes} likes, ${tweet.stats.retweets} retweets`
    );

    if (tweet.videos.length > 0) {
      console.log(`🎥 Videos: ${tweet.videos.length}`);
    }
  });
}

main().catch(console.error);
```

### High-Performance Concurrent Mode

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function fastScraping() {
  // Enable concurrent mode for faster processing
  const result = await fetchTweets(
    "username",
    5, // maxPages
    false, // useProxies
    undefined, // proxyOptions
    true // useConcurrency
  );

  console.log(`Processed ${result.tweets.length} tweets efficiently`);
  console.log(
    `User: ${result.userProfile?.fullname} with ${result.userProfile?.stats.followers} followers`
  );
}
```

## 📚 Complete API Reference

### fetchTweets Function

```typescript
function fetchTweets(
  username: string,
  maxPages?: number,
  useProxies?: boolean,
  proxyOptions?: ProxyOptions,
  useConcurrency?: boolean
): Promise<FetchTweetsResponse>;
```

#### Parameters

| Parameter        | Type           | Default      | Description                             |
| ---------------- | -------------- | ------------ | --------------------------------------- |
| `username`       | `string`       | **required** | Twitter username (without @)            |
| `maxPages`       | `number`       | `3`          | Maximum number of pages to fetch        |
| `useProxies`     | `boolean`      | `false`      | Enable proxy usage                      |
| `proxyOptions`   | `ProxyOptions` | `undefined`  | Proxy configuration options             |
| `useConcurrency` | `boolean`      | `false`      | Enable high-performance sequential mode |

## 🌐 Proxy Management

### 1. Direct Operation (Default)

```typescript
const result = await fetchTweets("username", 3, false);
```

### 2. Custom Proxy List

```typescript
import { fetchTweets, ProxyOptions } from "nitter-scraper-v2";

const proxyOptions: ProxyOptions = {
  proxyList: [
    "proxy1.example.com:8080:user1:pass1",
    "proxy2.example.com:8080:user2:pass2",
    "proxy3.example.com:8080:user3:pass3",
  ],
};

const result = await fetchTweets("username", 3, true, proxyOptions);
```

### 3. Remote Proxy Configuration

```typescript
const proxyOptions: ProxyOptions = {
  proxyUrl: "https://your-server.com/proxies.txt",
};

const result = await fetchTweets("username", 3, true, proxyOptions);
```

## 📝 TypeScript Definitions

### FetchTweetsResponse

```typescript
interface FetchTweetsResponse {
  userProfile: UserProfile | null; // Complete user profile information
  tweets: Tweet[]; // Array of extracted tweets
}
```

### UserProfile

```typescript
interface UserProfile {
  username: string; // Username (@username)
  fullname: string; // Full display name
  description: string; // Profile bio/description
  isVerified: boolean; // Verification status
  verificationType: string | null; // Verification type: "business", "blue", "verified"
  avatarUrl: string | null; // Profile avatar URL
  bannerUrl: string | null; // Profile banner URL
  stats: UserStats; // Profile statistics
  joinDate: string | null; // Account creation date
  location: string | null; // User location
  website: string | null; // Website URL
}
```

### UserStats

```typescript
interface UserStats {
  tweets: number; // Total number of tweets
  following: number; // Number of accounts following
  followers: number; // Number of followers
  likes: number; // Total likes given
}
```

### Tweet

```typescript
interface Tweet {
  id: string; // Unique tweet identifier
  text: string; // Tweet content
  username: string; // Author username
  fullname: string; // Author display name
  isVerified: boolean; // Author verification status
  verificationType: string | null; // Verification type
  created_at: string; // Creation timestamp (ISO)
  timestamp: number | null; // Unix timestamp (milliseconds)
  imageTweet: string[]; // Attached image URLs
  videoTweet: string[]; // Attached video URLs (legacy)
  videos: VideoInfo[]; // Detailed video information
  stats: TweetStats; // Engagement statistics
  avatarUrl: string | null; // Author avatar URL
  cards: Card[]; // Preview cards
  originalUrl: string; // Original Twitter/X URL
}
```

### TweetStats

```typescript
interface TweetStats {
  comments: number; // Number of comments
  retweets: number; // Number of retweets
  quotes: number; // Number of quote tweets
  likes: number; // Number of likes
  views: number; // Number of views
}
```

### VideoInfo

```typescript
interface VideoInfo {
  posterUrl: string | null; // Video thumbnail URL
  videoUrl: string | null; // Video file URL
}
```

## 💡 Advanced Usage Examples

### Complete Account Analysis

```typescript
async function analyzeAccount(username: string) {
  const result = await fetchTweets(username, 5, false, undefined, true);

  if (result.tweets.length === 0) {
    console.log("No tweets found");
    return;
  }

  // Profile analysis
  if (result.userProfile) {
    const profile = result.userProfile;
    console.log(`=== PROFILE ANALYSIS ===`);
    console.log(`Account: ${profile.fullname} (@${profile.username})`);
    console.log(`Description: ${profile.description}`);
    console.log(
      `Verified: ${
        profile.isVerified ? `Yes (${profile.verificationType})` : "No"
      }`
    );
    console.log(`Joined: ${profile.joinDate}`);
    console.log(`Location: ${profile.location}`);
    console.log(`Website: ${profile.website}`);

    console.log(`\n=== PROFILE STATISTICS ===`);
    console.log(`Total tweets: ${profile.stats.tweets.toLocaleString()}`);
    console.log(`Following: ${profile.stats.following.toLocaleString()}`);
    console.log(`Followers: ${profile.stats.followers.toLocaleString()}`);
    console.log(`Likes given: ${profile.stats.likes.toLocaleString()}`);

    // Calculate influence metrics
    const ratio = profile.stats.followers / profile.stats.following;
    console.log(`Influence ratio: ${ratio.toFixed(2)}:1`);
  }

  // Tweet analysis
  const tweets = result.tweets;
  console.log(`\n=== TWEET ANALYSIS (${tweets.length} recent tweets) ===`);

  // Calculate engagement statistics
  const totalLikes = tweets.reduce((sum, tweet) => sum + tweet.stats.likes, 0);
  const totalRetweets = tweets.reduce(
    (sum, tweet) => sum + tweet.stats.retweets,
    0
  );
  const totalComments = tweets.reduce(
    (sum, tweet) => sum + tweet.stats.comments,
    0
  );
  const avgLikes = Math.round(totalLikes / tweets.length);
  const avgRetweets = Math.round(totalRetweets / tweets.length);
  const avgComments = Math.round(totalComments / tweets.length);

  console.log(`Average engagement per tweet:`);
  console.log(`  - Likes: ${avgLikes}`);
  console.log(`  - Retweets: ${avgRetweets}`);
  console.log(`  - Comments: ${avgComments}`);

  // Media usage analysis
  const tweetsWithImages = tweets.filter((t) => t.imageTweet.length > 0).length;
  const tweetsWithVideos = tweets.filter((t) => t.videos.length > 0).length;
  const tweetsWithCards = tweets.filter((t) => t.cards.length > 0).length;

  console.log(`\nMedia usage:`);
  console.log(
    `  - Images: ${tweetsWithImages}/${tweets.length} tweets (${Math.round(
      (tweetsWithImages / tweets.length) * 100
    )}%)`
  );
  console.log(
    `  - Videos: ${tweetsWithVideos}/${tweets.length} tweets (${Math.round(
      (tweetsWithVideos / tweets.length) * 100
    )}%)`
  );
  console.log(
    `  - Cards: ${tweetsWithCards}/${tweets.length} tweets (${Math.round(
      (tweetsWithCards / tweets.length) * 100
    )}%)`
  );
}
```

### Performance Comparison

```typescript
async function comparePerformance(username: string) {
  console.log("Testing sequential mode...");
  const startSequential = Date.now();
  const resultSequential = await fetchTweets(
    username,
    3,
    false,
    undefined,
    false
  );
  const timeSequential = Date.now() - startSequential;

  console.log("Testing concurrent mode...");
  const startConcurrent = Date.now();
  const resultConcurrent = await fetchTweets(
    username,
    3,
    false,
    undefined,
    true
  );
  const timeConcurrent = Date.now() - startConcurrent;

  console.log(
    `Sequential: ${resultSequential.tweets.length} tweets in ${timeSequential}ms`
  );
  console.log(
    `Concurrent: ${resultConcurrent.tweets.length} tweets in ${timeConcurrent}ms`
  );
  console.log(
    `Performance improvement: ${Math.round(
      (timeSequential / timeConcurrent) * 100
    )}%`
  );
}
```

### Data Export

```typescript
import * as fs from "fs";

async function exportCompleteAnalysis(username: string, filename: string) {
  const result = await fetchTweets(username, 10, false, undefined, true);

  const exportData = {
    metadata: {
      username,
      exportedAt: new Date().toISOString(),
      version: "nitter-scraper-v2",
      repository: "https://github.com/FaresSofiane/nitter-scraper-v2",
    },
    userProfile: result.userProfile,
    statistics: {
      totalTweets: result.tweets.length,
      totalLikes: result.tweets.reduce((sum, t) => sum + t.stats.likes, 0),
      totalRetweets: result.tweets.reduce(
        (sum, t) => sum + t.stats.retweets,
        0
      ),
      averageEngagement:
        result.tweets.reduce(
          (sum, t) => sum + t.stats.likes + t.stats.retweets,
          0
        ) / result.tweets.length,
    },
    tweets: result.tweets,
  };

  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  console.log(`Analysis exported to ${filename}`);
}
```

## ⚡ Performance & Optimization

### Performance Modes

| Mode       | Use Case             | Speed  | Risk Level |
| ---------- | -------------------- | ------ | ---------- |
| Sequential | Production stable    | Normal | Low        |
| Concurrent | Fast data collection | High   | Medium     |

### Best Practices

- **Concurrent mode**: Use for rapid data collection (1-10 pages)
- **Proxy rotation**: Essential for large-scale operations
- **Rate limiting**: Respect Nitter instance limitations
- **Error handling**: Implement retry logic for production use

## 🛡️ Security & Compliance

### Proxy Security

```typescript
// ✅ Recommended: Authenticated proxies
const secureProxyOptions: ProxyOptions = {
  proxyList: ["premium-proxy.com:8080:username:password"],
};

// ❌ Avoid: Public proxies without authentication
const unsecureProxyOptions: ProxyOptions = {
  proxyList: ["free-proxy.com:8080::"],
};
```

### Responsible Usage

```typescript
// ✅ Good: Reasonable limits
const result = await fetchTweets("username", 5);

// ❌ Avoid: Excessive requests
const result = await fetchTweets("username", 100);
```

## 🔄 Migration Guide

### From Original nitter-scraper

This package is a feature-rich fork of the original [nitter-scraper](https://www.npmjs.com/package/nitter-scraper) by [@wslyvh](https://github.com/wslyvh). While maintaining backward compatibility, it adds significant enhancements:

```typescript
// Original nitter-scraper API
import { fetchTweets } from "nitter-scraper";
const tweets = await fetchTweets("username", 3);

// nitter-scraper-v2 API (backward compatible)
import { fetchTweets } from "nitter-scraper-v2";
const result = await fetchTweets("username", 3);
const tweets = result.tweets; // Access tweets (same structure)
const profile = result.userProfile; // NEW: Access user profile
```

### Enhanced Features vs Original

| Feature                 | Original | nitter-scraper-v2 |
| ----------------------- | -------- | ----------------- |
| Basic tweet extraction  | ✅       | ✅                |
| User profile extraction | ❌       | ✅                |
| Profile statistics      | ❌       | ✅                |
| Banner images           | ❌       | ✅                |
| Tweet statistics        | ❌       | ✅                |
| Video information       | ❌       | ✅                |
| Verification details    | ❌       | ✅                |
| Proxy support           | ❌       | ✅                |
| Concurrent mode         | ❌       | ✅                |

### New Features Available

- `result.userProfile` - Complete user profile with statistics and banner
- `tweet.stats` - Detailed engagement metrics (likes, retweets, comments, views)
- `tweet.videos` - Enhanced video information with thumbnails
- `tweet.verificationType` - Detailed verification status ("business", "blue", "verified")
- Advanced proxy management with automatic failover
- High-performance concurrent processing mode

</details>

---

# Français

<details>
<summary><b>📖 Cliquez pour développer la documentation française</b></summary>

Un package TypeScript complet pour extraire les tweets et profils utilisateur depuis Nitter sans authentification. Ce fork amélioré du package original [nitter-scraper](https://www.npmjs.com/package/nitter-scraper) offre une gestion sophistiquée des proxies, une extraction complète des médias, des statistiques de profil utilisateur, et un traitement concurrent haute performance.

## ✨ Fonctionnalités principales

- 🚀 **Scraping sans authentification** - Aucune clé API Twitter requise
- 👤 **Profils utilisateur complets** - Extraction des informations, statistiques et bannières
- 🔄 **Pagination intelligente** - Traitement automatique multi-pages avec gestion des curseurs
- 🛡️ **Support proxy avancé** - Modes multiples avec basculement automatique
- 📷 **Extraction média complète** - Images, vidéos et cartes de prévisualisation
- 📊 **Statistiques détaillées** - Métriques d'engagement et statistiques de profil
- ⚡ **Modes haute performance** - Traitement concurrent pour collecte rapide
- 🔧 **Support TypeScript complet** - Définitions de types et IntelliSense
- 🛠️ **Prêt pour l'entreprise** - Gestion d'erreurs, logique de retry et stabilité

## 📦 Installation

```bash
# Installation comme librairie
npm install nitter-scraper-v2

# Ou installation globale pour usage CLI
npm install -g nitter-scraper-v2
```

## 🚀 Utilisation rapide

### Utilisation basique avec profil utilisateur

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function main() {
  // Récupération des tweets et informations de profil
  const result = await fetchTweets("elonmusk", 3);

  // Affichage des informations du profil utilisateur
  if (result.userProfile) {
    const profile = result.userProfile;
    console.log(`=== PROFIL UTILISATEUR ===`);
    console.log(`Nom: ${profile.fullname} (@${profile.username})`);
    console.log(`Description: ${profile.description}`);
    console.log(
      `Vérifié: ${
        profile.isVerified ? `Oui (${profile.verificationType})` : "Non"
      }`
    );
    console.log(`Avatar: ${profile.avatarUrl}`);
    console.log(`Bannière: ${profile.bannerUrl}`);
    console.log(`Inscription: ${profile.joinDate}`);
    console.log(`Localisation: ${profile.location}`);
    console.log(`Site web: ${profile.website}`);

    console.log(`\n=== STATISTIQUES DU PROFIL ===`);
    console.log(`Tweets: ${profile.stats.tweets.toLocaleString()}`);
    console.log(`Abonnements: ${profile.stats.following.toLocaleString()}`);
    console.log(`Abonnés: ${profile.stats.followers.toLocaleString()}`);
    console.log(`Likes: ${profile.stats.likes.toLocaleString()}`);
  }

  // Affichage des tweets
  console.log(`\n=== TWEETS (${result.tweets.length}) ===`);
  result.tweets.forEach((tweet) => {
    console.log(`${tweet.fullname} (@${tweet.username}): ${tweet.text}`);
    console.log(
      `📊 ${tweet.stats.likes} likes, ${tweet.stats.retweets} retweets`
    );

    if (tweet.videos.length > 0) {
      console.log(`🎥 Vidéos: ${tweet.videos.length}`);
    }
  });
}

main().catch(console.error);
```

### Mode concurrent haute performance

```typescript
import { fetchTweets } from "nitter-scraper-v2";

async function scrapingRapide() {
  // Activation du mode concurrent pour un traitement plus rapide
  const result = await fetchTweets(
    "username",
    5, // maxPages
    false, // useProxies
    undefined, // proxyOptions
    true // useConcurrency
  );

  console.log(`Traité ${result.tweets.length} tweets efficacement`);
  console.log(
    `Utilisateur: ${result.userProfile?.fullname} avec ${result.userProfile?.stats.followers} abonnés`
  );
}
```

## 📚 Référence API complète

### Fonction fetchTweets

```typescript
function fetchTweets(
  username: string,
  maxPages?: number,
  useProxies?: boolean,
  proxyOptions?: ProxyOptions,
  useConcurrency?: boolean
): Promise<FetchTweetsResponse>;
```

#### Paramètres

| Paramètre        | Type           | Défaut      | Description                                  |
| ---------------- | -------------- | ----------- | -------------------------------------------- |
| `username`       | `string`       | **requis**  | Nom d'utilisateur Twitter (sans @)           |
| `maxPages`       | `number`       | `3`         | Nombre maximum de pages à récupérer          |
| `useProxies`     | `boolean`      | `false`     | Activer l'utilisation des proxies            |
| `proxyOptions`   | `ProxyOptions` | `undefined` | Options de configuration des proxies         |
| `useConcurrency` | `boolean`      | `false`     | Activer le mode séquentiel haute performance |

## 🌐 Gestion des proxies

### 1. Fonctionnement direct (par défaut)

```typescript
const result = await fetchTweets("username", 3, false);
```

### 2. Liste de proxies personnalisée

```typescript
import { fetchTweets, ProxyOptions } from "nitter-scraper-v2";

const proxyOptions: ProxyOptions = {
  proxyList: [
    "proxy1.example.com:8080:user1:pass1",
    "proxy2.example.com:8080:user2:pass2",
    "proxy3.example.com:8080:user3:pass3",
  ],
};

const result = await fetchTweets("username", 3, true, proxyOptions);
```

### 3. Configuration proxy distante

```typescript
const proxyOptions: ProxyOptions = {
  proxyUrl: "https://votre-serveur.com/proxies.txt",
};

const result = await fetchTweets("username", 3, true, proxyOptions);
```

## 📝 Définitions TypeScript

### FetchTweetsResponse

```typescript
interface FetchTweetsResponse {
  userProfile: UserProfile | null; // Informations complètes du profil utilisateur
  tweets: Tweet[]; // Tableau des tweets extraits
}
```

### UserProfile

```typescript
interface UserProfile {
  username: string; // Nom d'utilisateur (@username)
  fullname: string; // Nom complet affiché
  description: string; // Bio/description du profil
  isVerified: boolean; // Statut de vérification
  verificationType: string | null; // Type de vérification: "business", "blue", "verified"
  avatarUrl: string | null; // URL de l'avatar du profil
  bannerUrl: string | null; // URL de la bannière du profil
  stats: UserStats; // Statistiques du profil
  joinDate: string | null; // Date de création du compte
  location: string | null; // Localisation de l'utilisateur
  website: string | null; // URL du site web
}
```

### UserStats

```typescript
interface UserStats {
  tweets: number; // Nombre total de tweets
  following: number; // Number of accounts following
  followers: number; // Nombre d'abonnés
  likes: number; // Total likes given
}
```

## 💡 Exemples d'utilisation avancés

### Analyse complète de compte

```typescript
async function analyserCompte(username: string) {
  const result = await fetchTweets(username, 5, false, undefined, true);

  if (result.tweets.length === 0) {
    console.log("Aucun tweet trouvé");
    return;
  }

  // Analyse du profil
  if (result.userProfile) {
    const profile = result.userProfile;
    console.log(`=== ANALYSE DU PROFIL ===`);
    console.log(`Compte: ${profile.fullname} (@${profile.username})`);
    console.log(`Description: ${profile.description}`);
    console.log(
      `Vérifié: ${
        profile.isVerified ? `Oui (${profile.verificationType})` : "Non"
      }`
    );
    console.log(`Inscription: ${profile.joinDate}`);
    console.log(`Localisation: ${profile.location}`);
    console.log(`Site web: ${profile.website}`);

    console.log(`\n=== STATISTIQUES DU PROFIL ===`);
    console.log(`Total tweets: ${profile.stats.tweets.toLocaleString()}`);
    console.log(`Abonnements: ${profile.stats.following.toLocaleString()}`);
    console.log(`Abonnés: ${profile.stats.followers.toLocaleString()}`);
    console.log(`Likes donnés: ${profile.stats.likes.toLocaleString()}`);

    // Calcul des métriques d'influence
    const ratio = profile.stats.followers / profile.stats.following;
    console.log(`Ratio d'influence: ${ratio.toFixed(2)}:1`);
  }

  // Analyse des tweets
  const tweets = result.tweets;
  console.log(`\n=== ANALYSE DES TWEETS (${tweets.length} tweets récents) ===`);

  // Calcul des statistiques d'engagement
  const totalLikes = tweets.reduce((sum, tweet) => sum + tweet.stats.likes, 0);
  const totalRetweets = tweets.reduce(
    (sum, tweet) => sum + tweet.stats.retweets,
    0
  );
  const totalComments = tweets.reduce(
    (sum, tweet) => sum + tweet.stats.comments,
    0
  );
  const avgLikes = Math.round(totalLikes / tweets.length);
  const avgRetweets = Math.round(totalRetweets / tweets.length);
  const avgComments = Math.round(totalComments / tweets.length);

  console.log(`Engagement moyen par tweet:`);
  console.log(`  - Likes: ${avgLikes}`);
  console.log(`  - Retweets: ${avgRetweets}`);
  console.log(`  - Commentaires: ${avgComments}`);

  // Analyse de l'utilisation des médias
  const tweetsWithImages = tweets.filter((t) => t.imageTweet.length > 0).length;
  const tweetsWithVideos = tweets.filter((t) => t.videos.length > 0).length;
  const tweetsWithCards = tweets.filter((t) => t.cards.length > 0).length;

  console.log(`\nUtilisation des médias:`);
  console.log(
    `  - Images: ${tweetsWithImages}/${tweets.length} tweets (${Math.round(
      (tweetsWithImages / tweets.length) * 100
    )}%)`
  );
  console.log(
    `  - Vidéos: ${tweetsWithVideos}/${tweets.length} tweets (${Math.round(
      (tweetsWithVideos / tweets.length) * 100
    )}%)`
  );
  console.log(
    `  - Cartes: ${tweetsWithCards}/${tweets.length} tweets (${Math.round(
      (tweetsWithCards / tweets.length) * 100
    )}%)`
  );
}
```

## ⚡ Performance et optimisation

### Modes de performance

| Mode       | Cas d'usage       | Vitesse | Niveau de risque |
| ---------- | ----------------- | ------- | ---------------- |
| Séquentiel | Production stable | Normal  | Faible           |
| Concurrent | Collecte rapide   | Élevée  | Moyen            |

### Bonnes pratiques

- **Mode concurrent**: Utiliser pour la collecte rapide (1-10 pages)
- **Rotation de proxies**: Essentiel pour les opérations à grande échelle
- **Limitation de débit**: Respecter les limites des instances Nitter
- **Gestion d'erreurs**: Implémenter une logique de retry pour la production

</details>

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Support

For bugs and feature requests, please open an issue on [GitHub](https://github.com/FaresSofiane/nitter-scraper-v2/issues).

## 👨‍💻 Author

**Fares Sofiane**

- GitHub: [@FaresSofiane](https://github.com/FaresSofiane)
- Repository: [nitter-scraper-v2](https://github.com/FaresSofiane/nitter-scraper-v2)

---

<div align="center">

**Built with ❤️ by [Fares Sofiane](https://github.com/FaresSofiane)**

[⭐ Star this repository](https://github.com/FaresSofiane/nitter-scraper-v2) if you find it useful!

</div>
