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
