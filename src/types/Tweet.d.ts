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
  videoTweet: string[]; // Nouveau champ pour stocker les URLs des vidéos
  originalUrl: string;
  cards: any[]; // Nouveau champ pour stocker les informations des cartes
}
