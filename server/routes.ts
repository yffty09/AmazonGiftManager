import { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { giftCards, users, type User } from "@db/schema";
import { and, eq, gte, lte, ilike } from "drizzle-orm";
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

    const { amount, recipientName, recipientEmail } = req.body;
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
          userId: (req.user as User).id,
          code,
          amount,
          recipientName: recipientName || null,
          recipientEmail: recipientEmail || null,
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

  // ギフトカード一覧取得（検索機能強化）
  app.get("/api/giftcards", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "認証が必要です" });
    }

    try {
      const {
        code,
        isUsed,
        minAmount,
        maxAmount,
        recipientName,
        recipientEmail
      } = req.query;

      const conditions = [eq(giftCards.userId, (req.user as User).id)];

      // コード検索
      if (code) {
        conditions.push(ilike(giftCards.code, `%${code}%`));
      }

      // 使用状態での検索
      if (isUsed !== undefined) {
        conditions.push(eq(giftCards.isUsed, isUsed === "true"));
      }

      // 金額範囲での検索
      if (minAmount) {
        conditions.push(gte(giftCards.amount, parseInt(minAmount as string)));
      }
      if (maxAmount) {
        conditions.push(lte(giftCards.amount, parseInt(maxAmount as string)));
      }

      // 受取人名での検索
      if (recipientName) {
        conditions.push(ilike(giftCards.recipientName, `%${recipientName}%`));
      }

      // メールアドレスでの検索
      if (recipientEmail) {
        conditions.push(ilike(giftCards.recipientEmail, `%${recipientEmail}%`));
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
            eq(giftCards.userId, (req.user as User).id)
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