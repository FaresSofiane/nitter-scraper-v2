import { fetchTweets } from "../dist/index.js";

async function main() {
  console.log("=== TEST 1: SANS RETWEETS (par défaut) ===");
  const resultWithoutRetweets = await fetchTweets("lnstantFoot", 2, false, undefined, false, false);
  
  console.log("=== PROFIL UTILISATEUR ===");
  if (resultWithoutRetweets.userProfile) {
    const profile = resultWithoutRetweets.userProfile;
    console.log(`Nom: ${profile.fullname} (@${profile.username})`);
    console.log(`Description: ${profile.description}`);
    console.log(`Vérifié: ${profile.isVerified ? `Oui (${profile.verificationType})` : 'Non'}`);
    console.log(`Avatar: ${profile.avatarUrl}`);
    console.log(`Bannière: ${profile.bannerUrl}`);
    console.log(`Date d'inscription: ${profile.joinDate}`);
    console.log(`Localisation: ${profile.location}`);
    console.log(`Site web: ${profile.website}`);
    
    console.log("\n=== STATISTIQUES DU PROFIL ===");
    console.log(`Tweets: ${profile.stats.tweets.toLocaleString()}`);
    console.log(`Abonnements: ${profile.stats.following.toLocaleString()}`);
    console.log(`Abonnés: ${profile.stats.followers.toLocaleString()}`);
    console.log(`Likes: ${profile.stats.likes.toLocaleString()}`);
  } else {
    console.log("Impossible de récupérer le profil utilisateur");
  }

  console.log(`\n=== TWEETS SANS RETWEETS (${resultWithoutRetweets.tweets.length}) ===`);
  resultWithoutRetweets.tweets.slice(0, 3).forEach((tweet, index) => {
    console.log(`\n${index + 1}. Tweet ID: ${tweet.id}`);
    console.log(`Texte: ${tweet.text.substring(0, 100)}...`);
    console.log(`Retweet: ${tweet.isRetweet ? `Oui (par ${tweet.retweetedBy})` : 'Non'}`);
    console.log(`Stats: ${tweet.stats.likes} likes, ${tweet.stats.retweets} retweets, ${tweet.stats.comments} commentaires`);
    
    if (tweet.videos.length > 0) {
      console.log(`Vidéos: ${tweet.videos.length}`);
      tweet.videos.forEach((video, videoIndex) => {
        console.log(`  Vidéo ${videoIndex + 1}: ${video.videoUrl || 'N/A'}`);
        console.log(`  Poster: ${video.posterUrl || 'N/A'}`);
      });
    }
  });

  console.log("\n\n=== TEST 2: AVEC RETWEETS ===");
  const resultWithRetweets = await fetchTweets("lnstantFoot", 2, false, undefined, false, true);
  
  console.log(`\n=== TWEETS AVEC RETWEETS (${resultWithRetweets.tweets.length}) ===`);
  resultWithRetweets.tweets.slice(0, 5).forEach((tweet, index) => {
    console.log(`\n${index + 1}. Tweet ID: ${tweet.id}`);
    console.log(`Texte: ${tweet.text.substring(0, 100)}...`);
    console.log(`Retweet: ${tweet.isRetweet ? `Oui (par ${tweet.retweetedBy})` : 'Non'}`);
    console.log(`Stats: ${tweet.stats.likes} likes, ${tweet.stats.retweets} retweets, ${tweet.stats.comments} commentaires`);
  });

  console.log(`\n=== RÉSUMÉ ===`);
  console.log(`Tweets sans retweets: ${resultWithoutRetweets.tweets.length}`);
  console.log(`Tweets avec retweets: ${resultWithRetweets.tweets.length}`);
  
  const retweetsCount = resultWithRetweets.tweets.filter(tweet => tweet.isRetweet).length;
  console.log(`Nombre de retweets détectés: ${retweetsCount}`);
}

main().catch(console.error);
