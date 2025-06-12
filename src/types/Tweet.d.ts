export interface Tweet {
  id: string;
  text: string;
  username: string;
  created_at: string;
  timestamp: number | null;
  imageTweet: string[];
  avatarUrl: string | null;
  videoTweet: string[]; // Nouveau champ pour stocker les URLs des vidéos
  originalUrl: string;
  cards: any[]; // Nouveau champ pour stocker les informations des cartes
}
