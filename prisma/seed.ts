import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORY_NAMES = ["Currency", "Accounts", "Items", "Skins", "Boosting"];

const GAMES = [
  {
    name: "World of Warcraft",
    slug: "world-of-warcraft",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
  },
  {
    name: "League of Legends",
    slug: "league-of-legends",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&q=80",
  },
  {
    name: "Counter-Strike 2",
    slug: "counter-strike-2",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
  },
  {
    name: "Fortnite",
    slug: "fortnite",
    imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502113f?w=800&q=80",
  },
  {
    name: "Valorant",
    slug: "valorant",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
  },
  {
    name: "Genshin Impact",
    slug: "genshin-impact",
    imageUrl: "https://images.unsplash.com/photo-1493710345322-4c8a0e5122c8?w=800&q=80",
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.game.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const buyer = await prisma.user.create({
    data: {
      name: "Alex Buyer",
      email: "buyer@funpall.com",
      passwordHash,
      balance: 500,
      rating: 4.5,
      reviewCount: 12,
      isVerified: true,
      isOnline: true,
      responseTime: "~10 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      name: "ProGamer99",
      email: "seller1@funpall.com",
      passwordHash,
      balance: 1250.5,
      rating: 4.9,
      reviewCount: 847,
      isVerified: true,
      isOnline: true,
      responseTime: "~5 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer",
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "GoldMaster",
      email: "seller2@funpall.com",
      passwordHash,
      balance: 3200,
      rating: 4.7,
      reviewCount: 523,
      isVerified: true,
      isOnline: false,
      responseTime: "~15 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GoldMaster",
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      name: "BoostKing",
      email: "seller3@funpall.com",
      passwordHash,
      balance: 890,
      rating: 4.8,
      reviewCount: 312,
      isVerified: false,
      isOnline: true,
      responseTime: "~3 min",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BoostKing",
    },
  });

  const games = [];
  for (const gameData of GAMES) {
    const game = await prisma.game.create({
      data: {
        name: gameData.name,
        slug: gameData.slug,
        imageUrl: gameData.imageUrl,
        categories: {
          create: CATEGORY_NAMES.map((name) => ({
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-"),
          })),
        },
      },
      include: { categories: true },
    });
    games.push(game);
  }

  const listingsData = [
    {
      gameSlug: "world-of-warcraft",
      categorySlug: "currency",
      sellerId: seller1.id,
      title: "100,000 Gold — US Servers",
      description:
        "Fast delivery within 30 minutes. Safe trade method via mail or face-to-face. Available on all US realms. Contact me after purchase for delivery details.",
      price: 45.99,
      quantity: 50,
    },
    {
      gameSlug: "world-of-warcraft",
      categorySlug: "boosting",
      sellerId: seller3.id,
      title: "Mythic+ 20 Key Boost — Selfplay",
      description:
        "Professional boosters with 3000+ IO score. Selfplay or piloted options available. Guaranteed completion within 24 hours.",
      price: 29.99,
      quantity: 20,
    },
    {
      gameSlug: "league-of-legends",
      categorySlug: "accounts",
      sellerId: seller2.id,
      title: "Diamond IV Account — 150+ Skins",
      description:
        "Hand-leveled account, email changeable. 150+ skins including Prestige editions. Rank: Diamond IV, 65% win rate. No bans, clean history.",
      price: 189.99,
      quantity: 1,
    },
    {
      gameSlug: "league-of-legends",
      categorySlug: "boosting",
      sellerId: seller3.id,
      title: "Rank Boost Gold → Platinum",
      description:
        "Fast and safe rank boosting. VPN matching your region. Stream available on request. Average 3-5 days completion.",
      price: 49.99,
      quantity: 15,
    },
    {
      gameSlug: "counter-strike-2",
      categorySlug: "skins",
      sellerId: seller1.id,
      title: "AWP | Dragon Lore (FT)",
      description:
        "Field-Tested AWP Dragon Lore. Float: 0.28. Tradable immediately. Steam trade only.",
      price: 2499.99,
      quantity: 1,
      images: ["https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&q=80"],
    },
    {
      gameSlug: "counter-strike-2",
      categorySlug: "items",
      sellerId: seller2.id,
      title: "10x CS2 Case Keys",
      description: "10 CS2 case keys, instant delivery via Steam trade offer.",
      price: 24.99,
      quantity: 100,
    },
    {
      gameSlug: "fortnite",
      categorySlug: "accounts",
      sellerId: seller2.id,
      title: "OG Fortnite Account — Renegade Raider",
      description:
        "Rare OG skin account with Renegade Raider, Aerial Assault Trooper, and 200+ skins. Full access, email changeable.",
      price: 599.99,
      quantity: 1,
    },
    {
      gameSlug: "valorant",
      categorySlug: "accounts",
      sellerId: seller1.id,
      title: "Immortal 2 Account — All Agents",
      description:
        "Immortal 2 ranked account with all agents unlocked. Premium skins bundle included. Region: NA.",
      price: 149.99,
      quantity: 2,
    },
    {
      gameSlug: "genshin-impact",
      categorySlug: "accounts",
      sellerId: seller3.id,
      title: "AR 58 Account — C6 Raiden + C2 Nahida",
      description:
        "Endgame account with C6 Raiden Shogun, C2 Nahida, and 30+ 5-star characters. Adventure Rank 58, all regions unlocked.",
      price: 399.99,
      quantity: 1,
    },
    {
      gameSlug: "genshin-impact",
      categorySlug: "currency",
      sellerId: seller2.id,
      title: "6480 Genesis Crystals",
      description:
        "Top-up service for 6480 Genesis Crystals (8080 total with bonus). Requires UID and server info.",
      price: 79.99,
      quantity: 30,
    },
  ];

  for (const listing of listingsData) {
    const game = games.find((g) => g.slug === listing.gameSlug)!;
    const category = game.categories.find((c) => c.slug === listing.categorySlug)!;

    await prisma.listing.create({
      data: {
        sellerId: listing.sellerId,
        gameId: game.id,
        categoryId: category.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        quantity: listing.quantity,
        images: listing.images ?? [],
        status: "ACTIVE",
      },
    });
  }

  const wowListing = await prisma.listing.findFirst({
    where: { title: { contains: "100,000 Gold" } },
  });

  const completedOrder = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      sellerId: seller1.id,
      listingId: wowListing!.id,
      quantity: 1,
      totalPrice: wowListing!.price,
      status: "COMPLETED",
    },
  });

  await prisma.review.create({
    data: {
      orderId: completedOrder.id,
      authorId: buyer.id,
      targetId: seller1.id,
      rating: 5,
      comment: "Super fast delivery! Gold arrived in 15 minutes. Highly recommended seller.",
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: buyer.id }, { userId: seller1.id }],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: buyer.id,
        content: "Hi! Is the WoW gold still available?",
      },
      {
        conversationId: conversation.id,
        senderId: seller1.id,
        content: "Yes! Ready to deliver within 30 minutes after payment.",
      },
      {
        conversationId: conversation.id,
        senderId: buyer.id,
        content: "Great, I'll place an order now.",
      },
    ],
  });

  console.log("Seed completed!");
  console.log("\nDemo accounts (password: password123):");
  console.log("  buyer@funpall.com");
  console.log("  seller1@funpall.com");
  console.log("  seller2@funpall.com");
  console.log("  seller3@funpall.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
