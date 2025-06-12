"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scraper_1 = require("./scraper");
const proxyTester_1 = require("./utils/proxyTester");
async function main() {
    try {
        console.log("🚀 Démarrage du scraper Nitter avec proxies\n");
        // Tester la configuration des proxies
        await (0, proxyTester_1.testProxySetup)();
        console.log("\n" + "=".repeat(50) + "\n");
        // Scraper des tweets
        const username = "elonmusk"; // Nom d'utilisateur Twitter à scraper (sans @)
        console.log(`📱 Démarrage du scraping pour @${username}`);
        const tweets = await (0, scraper_1.fetchTweets)(username, 2); // Max 2 pages
        console.log(`\n✅ Scraping terminé !`);
        console.log(`📊 ${tweets.length} tweets récupérés`);
        // Afficher quelques exemples
        if (tweets.length > 0) {
            console.log("\n📝 Exemples de tweets récupérés:");
            tweets.slice(0, 3).forEach((tweet, index) => {
                console.log(`\n${index + 1}. ID: ${tweet.id}`);
                console.log(`   Date: ${tweet.created_at}`);
                console.log(`   Texte: ${tweet.text.substring(0, 100)}${tweet.text.length > 100 ? "..." : ""}`);
                if (tweet.imageTweet.length > 0) {
                    console.log(`   Images: ${tweet.imageTweet.length}`);
                }
                if (tweet.videoTweet.length > 0) {
                    console.log(`   Vidéos: ${tweet.videoTweet.length}`);
                }
            });
        }
    }
    catch (error) {
        console.error(`❌ Erreur dans la fonction principale:`, error);
    }
}
// Exécuter seulement si ce fichier est exécuté directement
if (require.main === module) {
    main();
}
