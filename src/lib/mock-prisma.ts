import {
  createMockStore,
  type MockStore,
  type MockUser,
  type MockGame,
  type MockCategory,
  type MockListing,
  type MockOrder,
  type MockReview,
  type MockConversation,
  type MockMessage,
} from "./mock-data";

type AnyRecord = Record<string, unknown>;

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function getPath(obj: AnyRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as AnyRecord)[key];
    }
    return undefined;
  }, obj);
}

function matchesWhere(record: AnyRecord, where?: AnyRecord): boolean {
  if (!where) return true;

  if (where.AND && Array.isArray(where.AND)) {
    return where.AND.every((w) => matchesWhere(record, w as AnyRecord));
  }
  if (where.OR && Array.isArray(where.OR)) {
    return where.OR.some((w) => matchesWhere(record, w as AnyRecord));
  }

  for (const [key, condition] of Object.entries(where)) {
    if (key === "AND" || key === "OR") continue;

    if (condition && typeof condition === "object" && !Array.isArray(condition)) {
      const cond = condition as AnyRecord;

      if ("some" in cond) {
        const related = record[key];
        if (!Array.isArray(related)) return false;
        if (
          !related.some((item) =>
            matchesWhere(item as AnyRecord, cond.some as AnyRecord)
          )
        ) {
          return false;
        }
        continue;
      }

      if ("not" in cond) {
        if (record[key] === cond.not) return false;
        continue;
      }

      if ("gte" in cond || "lte" in cond || "gt" in cond || "lt" in cond) {
        const value = Number(record[key]);
        if ("gte" in cond && !(value >= Number(cond.gte))) return false;
        if ("lte" in cond && !(value <= Number(cond.lte))) return false;
        if ("gt" in cond && !(value > Number(cond.gt))) return false;
        if ("lt" in cond && !(value < Number(cond.lt))) return false;
        continue;
      }

      // Nested relation filter, e.g. category: { slug }, seller: { isOnline }
      const nested = record[key];
      if (nested && typeof nested === "object") {
        if (!matchesWhere(nested as AnyRecord, cond)) return false;
        continue;
      }

      // Relation not hydrated on the record — resolve via store later in delegates
      return false;
    }

    if (record[key] !== condition) return false;
  }

  return true;
}

function sortBy(
  items: AnyRecord[],
  orderBy?: AnyRecord | AnyRecord[]
): AnyRecord[] {
  if (!orderBy) return items;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const order of orders) {
      const [[field, direction]] = Object.entries(order);
      if (direction && typeof direction === "object") {
        const [[nestedField, nestedDir]] = Object.entries(
          direction as AnyRecord
        );
        const av = getPath(a, `${field}.${nestedField}`);
        const bv = getPath(b, `${field}.${nestedField}`);
        if (av === bv) continue;
        const cmp = av! > bv! ? 1 : -1;
        return nestedDir === "desc" ? -cmp : cmp;
      }
      const av = a[field];
      const bv = b[field];
      if (av === bv) continue;
      const cmp = (av as number | string | Date) > (bv as number | string | Date) ? 1 : -1;
      return direction === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

function applyNumericUpdate(
  current: number,
  value: number | { increment?: number; decrement?: number }
): number {
  if (typeof value === "number") return value;
  if (value.increment != null) return current + value.increment;
  if (value.decrement != null) return current - value.decrement;
  return current;
}

export function createMockPrisma() {
  const globalStore = globalThis as unknown as { __mockStore?: MockStore };
  if (!globalStore.__mockStore) {
    globalStore.__mockStore = createMockStore();
  }
  const store = globalStore.__mockStore;

  const relations = {
    user: (id: string) => store.users.find((u) => u.id === id),
    game: (id: string) => store.games.find((g) => g.id === id),
    category: (id: string) => store.categories.find((c) => c.id === id),
    listing: (id: string) => store.listings.find((l) => l.id === id),
  };

  function hydrateListing(listing: MockListing) {
    return {
      ...listing,
      seller: relations.user(listing.sellerId),
      game: relations.game(listing.gameId),
      category: relations.category(listing.categoryId),
    };
  }

  function hydrateOrder(order: MockOrder) {
    const listing = relations.listing(order.listingId);
    return {
      ...order,
      listing: listing ? hydrateListing(listing) : null,
      buyer: relations.user(order.buyerId),
      seller: relations.user(order.sellerId),
    };
  }

  function hydrateReview(review: MockReview) {
    return {
      ...review,
      author: relations.user(review.authorId),
      target: relations.user(review.targetId),
    };
  }

  function hydrateConversation(conversation: MockConversation) {
    const participants = store.participants
      .filter((p) => p.conversationId === conversation.id)
      .map((p) => ({
        ...p,
        user: relations.user(p.userId),
      }));
    const messages = store.messages
      .filter((m) => m.conversationId === conversation.id)
      .map((m) => ({
        ...m,
        sender: relations.user(m.senderId),
      }));
    return { ...conversation, participants, messages };
  }

  function shape(
    record: AnyRecord,
    args?: { select?: AnyRecord; include?: AnyRecord }
  ) {
    if (!args?.select && !args?.include) return clone(record);

    if (args.select) {
      const out: AnyRecord = {};
      for (const [key, value] of Object.entries(args.select)) {
        if (value === true) {
          out[key] = clone(record[key]);
        } else if (value && typeof value === "object") {
          const nested = record[key];
          if (Array.isArray(nested)) {
            let items = nested.map((item) =>
              shape(item as AnyRecord, value as { select?: AnyRecord; include?: AnyRecord; where?: AnyRecord; orderBy?: AnyRecord; take?: number })
            );
            const nestedArgs = value as {
              where?: AnyRecord;
              orderBy?: AnyRecord;
              take?: number;
              include?: AnyRecord;
              select?: AnyRecord;
            };
            if (nestedArgs.where) {
              items = nested
                .filter((item) =>
                  matchesWhere(item as AnyRecord, nestedArgs.where)
                )
                .map((item) =>
                  shape(item as AnyRecord, {
                    select: nestedArgs.select,
                    include: nestedArgs.include,
                  })
                );
            }
            if (nestedArgs.orderBy) items = sortBy(items, nestedArgs.orderBy);
            if (nestedArgs.take != null) items = items.slice(0, nestedArgs.take);
            out[key] = items;
          } else if (nested && typeof nested === "object") {
            out[key] = shape(nested as AnyRecord, value as {
              select?: AnyRecord;
              include?: AnyRecord;
            });
          } else {
            out[key] = null;
          }
        }
      }
      return out;
    }

    const out = clone(record);
    if (args.include) {
      for (const [key, value] of Object.entries(args.include)) {
        if (!value) continue;
        const nested = record[key];
        if (key === "_count") {
          out[key] = clone(nested);
          continue;
        }
        if (value === true) {
          out[key] = clone(nested);
          continue;
        }
        const nestedArgs = value as {
          select?: AnyRecord;
          include?: AnyRecord;
          where?: AnyRecord;
          orderBy?: AnyRecord;
          take?: number;
        };
        if (Array.isArray(nested)) {
          let items = nested as AnyRecord[];
          if (nestedArgs.where) {
            items = items.filter((item) => matchesWhere(item, nestedArgs.where));
          }
          items = items.map((item) =>
            shape(item, {
              select: nestedArgs.select,
              include: nestedArgs.include,
            })
          );
          if (nestedArgs.orderBy) items = sortBy(items, nestedArgs.orderBy);
          if (nestedArgs.take != null) items = items.slice(0, nestedArgs.take);
          out[key] = items;
        } else if (nested && typeof nested === "object") {
          out[key] = shape(nested as AnyRecord, {
            select: nestedArgs.select,
            include: nestedArgs.include,
          });
        }
      }
    }
    return out;
  }

  function createDelegate<T extends { id: string }>(opts: {
    getAll: () => T[];
    hydrate: (item: T) => AnyRecord;
    createItem: (data: AnyRecord) => T;
    uniqueKeys?: (keyof T)[];
  }) {
    return {
      async findMany(args?: {
        where?: AnyRecord;
        orderBy?: AnyRecord;
        include?: AnyRecord;
        select?: AnyRecord;
      }) {
        let items = opts
          .getAll()
          .map(opts.hydrate)
          .filter((item) => matchesWhere(item, args?.where));
        items = sortBy(items, args?.orderBy);
        return items.map((item) =>
          shape(item, { include: args?.include, select: args?.select })
        );
      },
      async findUnique(args: {
        where: AnyRecord;
        include?: AnyRecord;
        select?: AnyRecord;
      }) {
        const where = args.where;
        const item = opts.getAll().find((row) => {
          if (where.id && row.id === where.id) return true;
          for (const key of opts.uniqueKeys ?? []) {
            if (where[key as string] != null && row[key] === where[key as string]) {
              return true;
            }
          }
          return false;
        });
        if (!item) return null;
        return shape(opts.hydrate(item), {
          include: args.include,
          select: args.select,
        });
      },
      async findFirst(args?: {
        where?: AnyRecord;
        include?: AnyRecord;
        select?: AnyRecord;
      }) {
        const item = opts
          .getAll()
          .map(opts.hydrate)
          .find((row) => matchesWhere(row, args?.where));
        if (!item) return null;
        return shape(item, { include: args?.include, select: args?.select });
      },
      async create(args: {
        data: AnyRecord;
        include?: AnyRecord;
        select?: AnyRecord;
      }) {
        const created = opts.createItem(args.data);
        opts.getAll().push(created);
        return shape(opts.hydrate(created), {
          include: args.include,
          select: args.select,
        });
      },
      async update(args: { where: { id: string }; data: AnyRecord }) {
        const list = opts.getAll();
        const idx = list.findIndex((row) => row.id === args.where.id);
        if (idx < 0) throw new Error("Record not found");
        const current = list[idx] as AnyRecord;
        const next = { ...current };
        for (const [key, value] of Object.entries(args.data)) {
          if (
            value &&
            typeof value === "object" &&
            ("increment" in (value as AnyRecord) ||
              "decrement" in (value as AnyRecord))
          ) {
            next[key] = applyNumericUpdate(
              Number(current[key] ?? 0),
              value as { increment?: number; decrement?: number }
            );
          } else {
            next[key] = value;
          }
        }
        if ("updatedAt" in next) next.updatedAt = new Date();
        list[idx] = next as T;
        return clone(opts.hydrate(list[idx]));
      },
    };
  }

  const user = createDelegate<MockUser>({
    getAll: () => store.users,
    hydrate: (u) => {
      const listings = store.listings
        .filter((l) => l.sellerId === u.id)
        .map(hydrateListing);
      const reviewsReceived = store.reviews
        .filter((r) => r.targetId === u.id)
        .map(hydrateReview);
      return { ...u, listings, reviewsReceived };
    },
    uniqueKeys: ["email"],
    createItem: (data) => ({
      id: id("user"),
      name: String(data.name),
      email: String(data.email),
      passwordHash: (data.passwordHash as string | null) ?? null,
      avatar: (data.avatar as string | null) ?? null,
      rating: Number(data.rating ?? 0),
      reviewCount: Number(data.reviewCount ?? 0),
      balance: Number(data.balance ?? 0),
      isVerified: Boolean(data.isVerified ?? false),
      isOnline: Boolean(data.isOnline ?? false),
      responseTime: (data.responseTime as string | null) ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  });

  const game = createDelegate<MockGame>({
    getAll: () => store.games,
    hydrate: (g) => ({
      ...g,
      categories: store.categories.filter((c) => c.gameId === g.id),
      listings: store.listings
        .filter((l) => l.gameId === g.id)
        .map(hydrateListing),
      _count: {
        listings: store.listings.filter(
          (l) => l.gameId === g.id && l.status === "ACTIVE"
        ).length,
      },
    }),
    uniqueKeys: ["slug"],
    createItem: (data) => ({
      id: id("game"),
      name: String(data.name),
      slug: String(data.slug),
      imageUrl: String(data.imageUrl),
      createdAt: new Date(),
    }),
  });

  // Override game findMany/findUnique to support _count select filter
  const gameFindMany = game.findMany;
  game.findMany = async (args) => {
    const results = await gameFindMany(args);
    // Ensure _count.listings respects where in select
    if (args?.include?._count || args?.select?._count) {
      return results.map((g) => {
        const gameId = (g as AnyRecord).id as string;
        const countSelect = ((args.include?._count as AnyRecord)?.select ??
          (args.select?._count as AnyRecord)?.select) as AnyRecord | undefined;
        const listingsWhere = (countSelect?.listings as AnyRecord | undefined)
          ?.where as AnyRecord | undefined;
        const count = store.listings.filter((l) => {
          if (l.gameId !== gameId) return false;
          if (listingsWhere?.status) return l.status === listingsWhere.status;
          return true;
        }).length;
        return { ...(g as AnyRecord), _count: { listings: count } };
      });
    }
    return results;
  };

  const listingDelegate = createDelegate<MockListing>({
    getAll: () => store.listings,
    hydrate: hydrateListing,
    createItem: (data) => ({
      id: id("listing"),
      sellerId: String(data.sellerId),
      gameId: String(data.gameId),
      categoryId: String(data.categoryId),
      title: String(data.title),
      description: String(data.description),
      price: Number(data.price),
      quantity: Number(data.quantity ?? 1),
      status: (data.status as MockListing["status"]) ?? "ACTIVE",
      images: Array.isArray(data.images) ? (data.images as string[]) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  });

  const listing = {
    ...listingDelegate,
    async findMany(args?: {
      where?: AnyRecord;
      orderBy?: AnyRecord;
      include?: AnyRecord;
      select?: AnyRecord;
    }) {
      let items: AnyRecord[] = store.listings
        .map(hydrateListing)
        .filter((item) => matchesWhere(item as AnyRecord, args?.where));
      items = sortBy(items, args?.orderBy);
      return items.map((item) =>
        shape(item, {
          include: args?.include,
          select: args?.select,
        })
      );
    },
  };

  const order = createDelegate<MockOrder>({
    getAll: () => store.orders,
    hydrate: hydrateOrder,
    createItem: (data) => ({
      id: id("order"),
      buyerId: String(data.buyerId),
      sellerId: String(data.sellerId),
      listingId: String(data.listingId),
      quantity: Number(data.quantity),
      totalPrice: Number(data.totalPrice),
      status: (data.status as MockOrder["status"]) ?? "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  });

  const review = createDelegate<MockReview>({
    getAll: () => store.reviews,
    hydrate: hydrateReview,
    uniqueKeys: ["orderId"],
    createItem: (data) => ({
      id: id("review"),
      orderId: String(data.orderId),
      authorId: String(data.authorId),
      targetId: String(data.targetId),
      rating: Number(data.rating),
      comment: String(data.comment),
      createdAt: new Date(),
    }),
  });

  const conversation = {
    async findMany(args?: {
      where?: AnyRecord;
      orderBy?: AnyRecord;
      include?: AnyRecord;
      select?: AnyRecord;
    }) {
      let items: AnyRecord[] = store.conversations
        .map(hydrateConversation)
        .filter((item) => matchesWhere(item as AnyRecord, args?.where));
      items = sortBy(items, args?.orderBy);
      return items.map((item) =>
        shape(item, {
          include: args?.include,
          select: args?.select,
        })
      );
    },
    async findUnique(args: {
      where: { id: string };
      include?: AnyRecord;
      select?: AnyRecord;
    }) {
      const item = store.conversations.find((c) => c.id === args.where.id);
      if (!item) return null;
      return shape(hydrateConversation(item), {
        include: args.include,
        select: args.select,
      });
    },
    async findFirst(args?: {
      where?: AnyRecord;
      include?: AnyRecord;
      select?: AnyRecord;
    }) {
      const item = store.conversations
        .map(hydrateConversation)
        .find((row) => matchesWhere(row as AnyRecord, args?.where));
      if (!item) return null;
      return shape(item as AnyRecord, {
        include: args?.include,
        select: args?.select,
      });
    },
    async create(args: {
      data: AnyRecord;
      include?: AnyRecord;
      select?: AnyRecord;
    }) {
      const created: MockConversation = {
        id: id("conv"),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.conversations.push(created);

      const participantsData = (
        args.data.participants as { create?: Array<{ userId: string }> }
      )?.create;
      if (participantsData) {
        for (const p of participantsData) {
          store.participants.push({
            id: id("part"),
            conversationId: created.id,
            userId: p.userId,
          });
        }
      }

      return shape(hydrateConversation(created), {
        include: args.include,
        select: args.select,
      });
    },
    async update(args: { where: { id: string }; data: AnyRecord }) {
      const idx = store.conversations.findIndex((c) => c.id === args.where.id);
      if (idx < 0) throw new Error("Conversation not found");
      store.conversations[idx] = {
        ...store.conversations[idx],
        ...args.data,
        updatedAt:
          args.data.updatedAt instanceof Date
            ? args.data.updatedAt
            : new Date(),
      } as MockConversation;
      return clone(hydrateConversation(store.conversations[idx]));
    },
  };

  const message = {
    async create(args: {
      data: AnyRecord;
      include?: AnyRecord;
      select?: AnyRecord;
    }) {
      const created: MockMessage = {
        id: id("msg"),
        conversationId: String(args.data.conversationId),
        senderId: String(args.data.senderId),
        content: String(args.data.content),
        createdAt: new Date(),
        read: Boolean(args.data.read ?? false),
      };
      store.messages.push(created);
      const hydrated = {
        ...created,
        sender: relations.user(created.senderId),
      };
      return shape(hydrated, {
        include: args.include,
        select: args.select,
      });
    },
  };

  const client: {
    user: typeof user;
    game: typeof game;
    listing: typeof listing;
    order: typeof order;
    review: typeof review;
    conversation: typeof conversation;
    message: typeof message;
    category: { findMany: () => Promise<MockCategory[]> };
    $transaction: <T>(fn: (tx: typeof client) => Promise<T>) => Promise<T>;
    $disconnect: () => Promise<void>;
  } = {
    user,
    game,
    listing,
    order,
    review,
    conversation,
    message,
    category: {
      async findMany() {
        return clone(store.categories);
      },
    },
    async $transaction<T>(fn: (tx: typeof client) => Promise<T>): Promise<T> {
      return fn(client);
    },
    async $disconnect() {
      /* no-op */
    },
  };

  return client;
}

export type MockPrismaClient = ReturnType<typeof createMockPrisma>;
