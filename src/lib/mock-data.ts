/** In-memory demo dataset used when DATABASE_URL is not set. */

export type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  balance: number;
  isVerified: boolean;
  isOnline: boolean;
  responseTime: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MockGame = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  createdAt: Date;
};

export type MockCategory = {
  id: string;
  gameId: string;
  name: string;
  slug: string;
};

export type MockListing = {
  id: string;
  sellerId: string;
  gameId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  status: "ACTIVE" | "INACTIVE" | "SOLD_OUT";
  images: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type MockOrder = {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  quantity: number;
  totalPrice: number;
  status:
    | "PENDING"
    | "PAID"
    | "DELIVERED"
    | "COMPLETED"
    | "DISPUTED"
    | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
};

export type MockReview = {
  id: string;
  orderId: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type MockConversation = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MockParticipant = {
  id: string;
  conversationId: string;
  userId: string;
};

export type MockMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  read: boolean;
};

export type MockStore = {
  users: MockUser[];
  games: MockGame[];
  categories: MockCategory[];
  listings: MockListing[];
  orders: MockOrder[];
  reviews: MockReview[];
  conversations: MockConversation[];
  participants: MockParticipant[];
  messages: MockMessage[];
};

// bcrypt hash of "password123" (cost 12)
const PASSWORD_HASH =
  "$2b$12$kjx/rlnlhtkOnrNTTB0RsefuRX1ozHrNH1Cxd50n5sfXN85Fvyqi6";

const now = new Date("2026-01-15T12:00:00.000Z");

const CATEGORY_NAMES = ["Currency", "Accounts", "Items", "Skins", "Boosting"];

const GAMES_SEED = [
  {
    id: "game_wow",
    name: "World of Warcraft",
    slug: "world-of-warcraft",
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
  },
  {
    id: "game_lol",
    name: "League of Legends",
    slug: "league-of-legends",
    imageUrl:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&q=80",
  },
  {
    id: "game_cs2",
    name: "Counter-Strike 2",
    slug: "counter-strike-2",
    imageUrl:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
  },
  {
    id: "game_fortnite",
    name: "Fortnite",
    slug: "fortnite",
    imageUrl:
      "https://images.unsplash.com/photo-1560253023-3ec5d502113f?w=800&q=80",
  },
  {
    id: "game_valorant",
    name: "Valorant",
    slug: "valorant",
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
  },
  {
    id: "game_genshin",
    name: "Genshin Impact",
    slug: "genshin-impact",
    imageUrl:
      "https://images.unsplash.com/photo-1493710345322-4c8a0e5122c8?w=800&q=80",
  },
];

export function createMockStore(): MockStore {
  const users: MockUser[] = [
    {
      id: "user_buyer",
      name: "Alex Buyer",
      email: "buyer@funpall.com",
      passwordHash: PASSWORD_HASH,
      balance: 500,
      rating: 4.5,
      reviewCount: 12,
      isVerified: true,
      isOnline: true,
      responseTime: "~10 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user_seller1",
      name: "ProGamer99",
      email: "seller1@funpall.com",
      passwordHash: PASSWORD_HASH,
      balance: 1250.5,
      rating: 4.9,
      reviewCount: 847,
      isVerified: true,
      isOnline: true,
      responseTime: "~5 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user_seller2",
      name: "GoldMaster",
      email: "seller2@funpall.com",
      passwordHash: PASSWORD_HASH,
      balance: 3200,
      rating: 4.7,
      reviewCount: 523,
      isVerified: true,
      isOnline: false,
      responseTime: "~15 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GoldMaster",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user_seller3",
      name: "BoostKing",
      email: "seller3@funpall.com",
      passwordHash: PASSWORD_HASH,
      balance: 890,
      rating: 4.8,
      reviewCount: 312,
      isVerified: false,
      isOnline: true,
      responseTime: "~3 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BoostKing",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const games: MockGame[] = GAMES_SEED.map((g) => ({
    ...g,
    createdAt: now,
  }));

  const categories: MockCategory[] = games.flatMap((game) =>
    CATEGORY_NAMES.map((name) => ({
      id: `cat_${game.id}_${name.toLowerCase()}`,
      gameId: game.id,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }))
  );

  const cat = (gameId: string, slug: string) =>
    categories.find((c) => c.gameId === gameId && c.slug === slug)!.id;

  const listings: MockListing[] = [
    {
      id: "listing_wow_gold",
      sellerId: "user_seller1",
      gameId: "game_wow",
      categoryId: cat("game_wow", "currency"),
      title: "100,000 Gold — US Servers",
      description:
        "Fast delivery within 30 minutes. Safe trade method via mail or face-to-face. Available on all US realms. Contact me after purchase for delivery details.",
      price: 45.99,
      quantity: 50,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_wow_boost",
      sellerId: "user_seller3",
      gameId: "game_wow",
      categoryId: cat("game_wow", "boosting"),
      title: "Mythic+ 20 Key Boost — Selfplay",
      description:
        "Professional boosters with 3000+ IO score. Selfplay or piloted options available. Guaranteed completion within 24 hours.",
      price: 29.99,
      quantity: 20,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_lol_account",
      sellerId: "user_seller2",
      gameId: "game_lol",
      categoryId: cat("game_lol", "accounts"),
      title: "Diamond IV Account — 150+ Skins",
      description:
        "Hand-leveled account, email changeable. 150+ skins including Prestige editions. Rank: Diamond IV, 65% win rate. No bans, clean history.",
      price: 189.99,
      quantity: 1,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_lol_boost",
      sellerId: "user_seller3",
      gameId: "game_lol",
      categoryId: cat("game_lol", "boosting"),
      title: "Rank Boost Gold → Platinum",
      description:
        "Fast and safe rank boosting. VPN matching your region. Stream available on request. Average 3-5 days completion.",
      price: 49.99,
      quantity: 15,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_cs2_awp",
      sellerId: "user_seller1",
      gameId: "game_cs2",
      categoryId: cat("game_cs2", "skins"),
      title: "AWP | Dragon Lore (FT)",
      description:
        "Field-Tested AWP Dragon Lore. Float: 0.28. Tradable immediately. Steam trade only.",
      price: 2499.99,
      quantity: 1,
      status: "ACTIVE",
      images: [
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80",
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_cs2_keys",
      sellerId: "user_seller2",
      gameId: "game_cs2",
      categoryId: cat("game_cs2", "items"),
      title: "10x CS2 Case Keys",
      description:
        "10 CS2 case keys, instant delivery via Steam trade offer.",
      price: 24.99,
      quantity: 100,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_fortnite_og",
      sellerId: "user_seller2",
      gameId: "game_fortnite",
      categoryId: cat("game_fortnite", "accounts"),
      title: "OG Fortnite Account — Renegade Raider",
      description:
        "Rare OG skin account with Renegade Raider, Aerial Assault Trooper, and 200+ skins. Full access, email changeable.",
      price: 599.99,
      quantity: 1,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_valorant",
      sellerId: "user_seller1",
      gameId: "game_valorant",
      categoryId: cat("game_valorant", "accounts"),
      title: "Immortal 2 Account — All Agents",
      description:
        "Immortal 2 ranked account with all agents unlocked. Premium skins bundle included. Region: NA.",
      price: 149.99,
      quantity: 2,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_genshin_ar",
      sellerId: "user_seller3",
      gameId: "game_genshin",
      categoryId: cat("game_genshin", "accounts"),
      title: "AR 58 Account — C6 Raiden + C2 Nahida",
      description:
        "Endgame account with C6 Raiden Shogun, C2 Nahida, and 30+ 5-star characters. Adventure Rank 58, all regions unlocked.",
      price: 399.99,
      quantity: 1,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "listing_genshin_crystals",
      sellerId: "user_seller2",
      gameId: "game_genshin",
      categoryId: cat("game_genshin", "currency"),
      title: "6480 Genesis Crystals",
      description:
        "Top-up service for 6480 Genesis Crystals (8080 total with bonus). Requires UID and server info.",
      price: 79.99,
      quantity: 30,
      status: "ACTIVE",
      images: [],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const orders: MockOrder[] = [
    {
      id: "order_completed_1",
      buyerId: "user_buyer",
      sellerId: "user_seller1",
      listingId: "listing_wow_gold",
      quantity: 1,
      totalPrice: 45.99,
      status: "COMPLETED",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const reviews: MockReview[] = [
    {
      id: "review_1",
      orderId: "order_completed_1",
      authorId: "user_buyer",
      targetId: "user_seller1",
      rating: 5,
      comment:
        "Super fast delivery! Gold arrived in 15 minutes. Highly recommended seller.",
      createdAt: now,
    },
  ];

  const conversations: MockConversation[] = [
    {
      id: "conv_1",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const participants: MockParticipant[] = [
    { id: "part_1", conversationId: "conv_1", userId: "user_buyer" },
    { id: "part_2", conversationId: "conv_1", userId: "user_seller1" },
  ];

  const messages: MockMessage[] = [
    {
      id: "msg_1",
      conversationId: "conv_1",
      senderId: "user_buyer",
      content: "Hi! Is the WoW gold still available?",
      createdAt: now,
      read: true,
    },
    {
      id: "msg_2",
      conversationId: "conv_1",
      senderId: "user_seller1",
      content: "Yes! Ready to deliver within 30 minutes after payment.",
      createdAt: new Date(now.getTime() + 60_000),
      read: true,
    },
    {
      id: "msg_3",
      conversationId: "conv_1",
      senderId: "user_buyer",
      content: "Great, I'll place an order now.",
      createdAt: new Date(now.getTime() + 120_000),
      read: true,
    },
  ];

  return {
    users,
    games,
    categories,
    listings,
    orders,
    reviews,
    conversations,
    participants,
    messages,
  };
}
