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

A powerful TypeScript package for scraping tweets from Nitter without authentication. This enhanced version adds proxy support, media extraction (images/videos), preview cards and much more!

## ✨ Features

- 🚀 **Authentication-free scraping** - No Twitter API keys needed
- 🔄 **Automatic pagination handling** - Fetches multiple pages automatically
- 🛡️ **Rate limiting protection** - Smart delays between requests
- 🌐 **Advanced proxy support** - Three modes: no proxy, custom list, or download URL
- 📷 **Media extraction** - Images, videos and preview cards
- 👤 **User information** - Avatar and metadata
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
  const tweets = await fetchTweets("elonmusk", 3);
  console.log(`Found ${tweets.length} tweets`);

  tweets.forEach((tweet) => {
    console.log(`${tweet.username}: ${tweet.text}`);
    if (tweet.imageTweet.length > 0) {
      console.log(`📷 Images: ${tweet.imageTweet.length}`);
    }
    if (tweet.videoTweet.length > 0) {
      console.log(`🎥 Videos: ${tweet.videoTweet.length}`);
    }
  });
}

main().catch(console.error);
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
  proxyOptions?: ProxyOptions
): Promise<Tweet[]>;
```

#### Parameters

| Parameter      | Type           | Default      | Description                      |
| -------------- | -------------- | ------------ | -------------------------------- |
| `username`     | `string`       | **required** | Twitter username (without @)     |
| `maxPages`     | `number`       | `3`          | Maximum number of pages to fetch |
| `useProxies`   | `boolean`      | `false`      | Enable proxy usage               |
| `proxyOptions` | `ProxyOptions` | `undefined`  | Proxy configuration options      |

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

### Tweet

```typescript
interface Tweet {
  id: string; // Unique tweet ID
  text: string; // Tweet text content
  username: string; // Author username
  created_at: string; // Creation date (ISO string)
  timestamp: number | null; // Unix timestamp (milliseconds)
  imageTweet: string[]; // Attached image URLs
  videoTweet: string[]; // Attached video URLs
  avatarUrl: string | null; // User avatar URL
  cards: Card[]; // Preview cards
  originalUrl: string; // Original tweet URL on Twitter/X
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
  const tweets = await fetchTweets("username", 5, true, proxyOptions);

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

// Filter tweets with images
const tweetsWithImages = tweets.filter((tweet) => tweet.imageTweet.length > 0);

// Filter tweets with videos
const tweetsWithVideos = tweets.filter((tweet) => tweet.videoTweet.length > 0);

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

### Scraping with automatic retry

```typescript
async function scrapeWithRetry(username: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tweets = await fetchTweets(username, 3, true);
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
  const tweets = await fetchTweets(username, 5);

  const stats = {
    total: tweets.length,
    withImages: tweets.filter((t) => t.imageTweet.length > 0).length,
    withVideos: tweets.filter((t) => t.videoTweet.length > 0).length,
    withCards: tweets.filter((t) => t.cards.length > 0).length,
    avgLength:
      tweets.reduce((sum, t) => sum + t.text.length, 0) / tweets.length,
  };

  console.log("Tweet statistics:", stats);
  return stats;
}
```

### Export to JSON

```typescript
import * as fs from "fs";

async function exportTweets(username: string, filename: string) {
  const tweets = await fetchTweets(username, 10, true);

  const exportData = {
    username,
    scrapedAt: new Date().toISOString(),
    totalTweets: tweets.length,
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

- **Multiple pages**: Limit the number of pages to avoid timeouts
- **Proxies**: Use quality proxies to avoid blocking
- **Delays**: Default delay between requests is 2 seconds
- **Retry**: System automatically retries up to 3 times per request

### Limitations

- **Rate limiting**: Nitter may limit too frequent requests
- **Availability**: Nitter instances may be temporarily unavailable
- **Proxies**: Failed proxies are automatically removed from the list

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
const tweets = await fetchTweets("username", 3, true, {
  proxyList: ["proxy:port:user:pass"],
});
```

### New Available Properties

- `tweet.imageTweet[]` - Image URLs
- `tweet.videoTweet[]` - Video URLs
- `tweet.avatarUrl` - User avatar
- `tweet.cards[]` - Preview cards
- `tweet.originalUrl` - Original tweet URL

</details>

---

# Français

<details>
<summary><b>📖 Cliquez pour développer la documentation française</b></summary>

Un package TypeScript puissant pour scraper les tweets depuis Nitter sans authentification. Cette version améliorée ajoute le support des proxies, l'extraction de médias (images/vidéos), les cartes de prévisualisation et bien plus encore !

## ✨ Fonctionnalités

- 🚀 **Scraping sans authentification** - Pas besoin de clés API Twitter
- 🔄 **Gestion automatique de la pagination** - Récupère plusieurs pages automatiquement
- 🛡️ **Protection contre le rate limiting** - Délais intelligents entre les requêtes
- 🌐 **Support proxy avancé** - Trois modes : sans proxy, liste personnalisée, ou URL de téléchargement
- 📷 **Extraction de médias** - Images, vidéos et cartes de prévisualisation
- 👤 **Informations utilisateur** - Avatar et métadonnées
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
  const tweets = await fetchTweets("elonmusk", 3);
  console.log(`Trouvé ${tweets.length} tweets`);

  tweets.forEach((tweet) => {
    console.log(`${tweet.username}: ${tweet.text}`);
    if (tweet.imageTweet.length > 0) {
      console.log(`📷 Images: ${tweet.imageTweet.length}`);
    }
    if (tweet.videoTweet.length > 0) {
      console.log(`🎥 Vidéos: ${tweet.videoTweet.length}`);
    }
  });
}

main().catch(console.error);
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
  proxyOptions?: ProxyOptions
): Promise<Tweet[]>;
```

#### Paramètres

| Paramètre      | Type           | Défaut      | Description                          |
| -------------- | -------------- | ----------- | ------------------------------------ |
| `username`     | `string`       | **requis**  | Nom d'utilisateur Twitter (sans @)   |
| `maxPages`     | `number`       | `3`         | Nombre maximum de pages à récupérer  |
| `useProxies`   | `boolean`      | `false`     | Activer l'utilisation des proxies    |
| `proxyOptions` | `ProxyOptions` | `undefined` | Options de configuration des proxies |

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

### 4. URL Webshare.io par défaut

```typescript
// Utilise l'URL Webshare.io configurée par défaut
const tweets = await fetchTweets("username", 3, true);
```

## 📝 Types TypeScript

### Tweet

```typescript
interface Tweet {
  id: string; // ID unique du tweet
  text: string; // Contenu textuel du tweet
  username: string; // Nom d'utilisateur de l'auteur
  created_at: string; // Date de création (chaîne ISO)
  timestamp: number | null; // Timestamp Unix (millisecondes)
  imageTweet: string[]; // URLs des images attachées
  videoTweet: string[]; // URLs des vidéos attachées
  avatarUrl: string | null; // URL de l'avatar de l'utilisateur
  cards: Card[]; // Cartes de prévisualisation
  originalUrl: string; // URL originale du tweet sur Twitter/X
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

### Format des proxies

Les proxies doivent être au format : `host:port:username:password`

Exemple :

```
proxy1.example.com:8080:myuser:mypass
192.168.1.100:3128:admin:secret123
proxy-server.net:1080:client:password
```

### Gestion des erreurs

```typescript
try {
  const tweets = await fetchTweets("username", 5, true, proxyOptions);

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

// Filtrer les tweets avec des images
const tweetsWithImages = tweets.filter((tweet) => tweet.imageTweet.length > 0);

// Filtrer les tweets avec des vidéos
const tweetsWithVideos = tweets.filter((tweet) => tweet.videoTweet.length > 0);

// Filtrer les tweets récents (dernières 24h)
const recentTweets = tweets.filter((tweet) => {
  if (!tweet.timestamp) return false;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return tweet.timestamp > oneDayAgo;
});

// Extraire tous les médias
const allImages = tweets.flatMap((tweet) => tweet.imageTweet);
const allVideos = tweets.flatMap((tweet) => tweet.videoTweet);
```

## 💡 Exemples d'utilisation

### Scraping avec retry automatique

```typescript
async function scrapeWithRetry(username: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const tweets = await fetchTweets(username, 3, true);
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
async function analyzeTweets(username: string) {
  const tweets = await fetchTweets(username, 5);

  const stats = {
    total: tweets.length,
    withImages: tweets.filter((t) => t.imageTweet.length > 0).length,
    withVideos: tweets.filter((t) => t.videoTweet.length > 0).length,
    withCards: tweets.filter((t) => t.cards.length > 0).length,
    avgLength:
      tweets.reduce((sum, t) => sum + t.text.length, 0) / tweets.length,
  };

  console.log("Statistiques des tweets:", stats);
  return stats;
}
```

### Export en JSON

```typescript
import * as fs from "fs";

async function exportTweets(username: string, filename: string) {
  const tweets = await fetchTweets(username, 10, true);

  const exportData = {
    username,
    scrapedAt: new Date().toISOString(),
    totalTweets: tweets.length,
    tweets,
  };

  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  console.log(`${tweets.length} tweets exportés vers ${filename}`);
}

// Utilisation
exportTweets("elonmusk", "elonmusk_tweets.json");
```

## ⚡ Performance et optimisation

### Recommandations

- **Pages multiples** : Limitez le nombre de pages pour éviter les timeouts
- **Proxies** : Utilisez des proxies de qualité pour éviter les blocages
- **Délais** : Le délai par défaut entre les requêtes est de 2 secondes
- **Retry** : Le système retry automatiquement jusqu'à 3 fois par requête

### Limites

- **Rate limiting** : Nitter peut limiter les requêtes trop fréquentes
- **Disponibilité** : Les instances Nitter peuvent être temporairement indisponibles
- **Proxies** : Les proxies défaillants sont automatiquement retirés de la liste

## 🛡️ Sécurité et bonnes pratiques

### Gestion des proxies

```typescript
// ✅ Bon : Proxies avec authentification
const secureProxyOptions: ProxyOptions = {
  proxyList: ["premium-proxy.com:8080:myuser:strongpassword"],
};

// ❌ Éviter : Proxies publics sans authentification
const unsecureProxyOptions: ProxyOptions = {
  proxyList: [
    "free-proxy.com:8080::", // Pas d'authentification
  ],
};
```

### Respect des limites

```typescript
// ✅ Bon : Limitation raisonnable
const tweets = await fetchTweets("username", 3); // Max 3 pages

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
const tweets = await fetchTweets("username", 3, true, {
  proxyList: ["proxy:port:user:pass"],
});
```

### Nouvelles propriétés disponibles

- `tweet.imageTweet[]` - URLs des images
- `tweet.videoTweet[]` - URLs des vidéos
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
