import { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { giftCards, users } from "@db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { generateGiftCard } from "./amazon-api";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // ユーザー情報取得
  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "認証が必要です"
      });
    }
    res.json({
      ok: true,
      user: req.user
    });
  });

  // ギフトカード作成
  app.post("/api/giftcards", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "認証が必要です"
      });
    }

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: "有効な金額を指定してください"
      });
    }

    try {
      const code = await generateGiftCard(amount);
      const [giftCard] = await db
        .insert(giftCards)
        .values({
          userId: req.user.id,
          code,
          amount,
          isUsed: false,
        })
        .returning();

      res.json({
        ok: true,
        giftCard
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: error.message
      });
    }
  });

  // ギフトカード一覧取得
  app.get("/api/giftcards", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "認証が必要です" });
    }

    try {
      const { isUsed, minAmount, maxAmount } = req.query;
      const conditions = [eq(giftCards.userId, req.user.id)];

      if (isUsed !== undefined) {
        conditions.push(eq(giftCards.isUsed, isUsed === "true"));
      }
      if (minAmount) {
        conditions.push(gte(giftCards.amount, parseInt(minAmount as string)));
      }
      if (maxAmount) {
        conditions.push(lte(giftCards.amount, parseInt(maxAmount as string)));
      }

      const cards = await db
        .select()
        .from(giftCards)
        .where(and(...conditions))
        .orderBy(giftCards.createdAt);

      res.json({ ok: true, cards });
    } catch (error: any) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // ギフトカードステータス更新
  app.patch("/api/giftcards/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "認証が必要です" });
    }

    const { id } = req.params;
    const { isUsed } = req.body;

    try {
      const [card] = await db
        .select()
        .from(giftCards)
        .where(
          and(
            eq(giftCards.id, parseInt(id)),
            eq(giftCards.userId, req.user.id)
          )
        )
        .limit(1);

      if (!card) {
        return res.status(404).json({ ok: false, message: "ギフトカードが見つかりません" });
      }

      const [updated] = await db
        .update(giftCards)
        .set({ isUsed })
        .where(eq(giftCards.id, card.id))
        .returning();

      res.json({ ok: true, updated });
    } catch (error: any) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}