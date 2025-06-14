export interface TweetStats {
  comments: number;
  retweets: number;
  quotes: number;
  likes: number;
  views: number;
}

export interface VideoInfo {
  posterUrl: string | null; // Image de prévisualisation
  videoUrl: string | null;  // URL de la vidéo
}

// Interface pour les statistiques du profil utilisateur
export interface UserStats {
  tweets: number;      // Nombre de tweets
  following: number;   // Nombre d'abonnements
  followers: number;   // Nombre d'abonnés
  likes: number;       // Nombre de likes donnés
}

// Interface pour le profil utilisateur complet
export interface UserProfile {
  username: string;              // Nom d'utilisateur (@username)
  fullname: string;              // Nom complet affiché
  description: string;           // Bio/description du profil
  isVerified: boolean;           // Statut de vérification
  verificationType: string | null; // Type de vérification
  avatarUrl: string | null;      // URL de l'avatar
  bannerUrl: string | null;      // URL de la bannière
  stats: UserStats;              // Statistiques du profil
  joinDate: string | null;       // Date d'inscription
  location: string | null;       // Localisation
  website: string | null;        // Site web
}

// Interface pour la réponse complète de fetchTweets
export interface FetchTweetsResponse {
  userProfile: UserProfile | null;  // Informations du profil utilisateur
  tweets: Tweet[];                  // Liste des tweets
}

export interface Tweet {
  id: string;
  text: string;
  username: string;
  fullname: string; // Nom complet du compte
  isVerified: boolean; // Statut de vérification
  verificationType: string | null; // Type de vérification (business, blue, etc.)
  created_at: string;
  timestamp: number | null;
  imageTweet: string[];
  avatarUrl: string | null;
  videoTweet: string[]; // URLs des vidéos (legacy)
  videos: VideoInfo[]; // Informations détaillées des vidéos
  stats: TweetStats; // Statistiques du tweet
  originalUrl: string;
  cards: any[]; // Nouveau champ pour stocker les informations des cartes
}
