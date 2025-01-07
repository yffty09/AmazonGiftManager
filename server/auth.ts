import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type User } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);
const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "amazon-gift-card-manager",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get("env") === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24時間
    },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "ユーザー名が正しくありません" });
        }
        const isMatch = await crypto.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "パスワードが正しくありません" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // 新規ユーザー登録
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          ok: false,
          message: "入力が無効です: " + result.error.issues.map(i => i.message).join(", ")
        });
      }

      const { username, password } = result.data;
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({
          ok: false,
          message: "このユーザー名は既に使用されています"
        });
      }

      const hashedPassword = await crypto.hash(password);
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            message: "ログインに失敗しました"
          });
        }
        return res.json({
          ok: true,
          user: { id: newUser.id, username: newUser.username },
        });
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: "サーバーエラーが発生しました"
      });
    }
  });

  // ログイン
  app.post("/api/login", (req, res, next) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        message: "入力が無効です: " + result.error.issues.map(i => i.message).join(", ")
      });
    }

    passport.authenticate("local", (err: any, user: Express.User | false, info: IVerifyOptions) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          message: "サーバーエラーが発生しました"
        });
      }

      if (!user) {
        return res.status(400).json({
          ok: false,
          message: info.message || "ログインに失敗しました"
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            message: "ログインに失敗しました"
          });
        }

        return res.json({
          ok: true,
          user: { id: user.id, username: user.username },
        });
      });
    })(req, res, next);
  });

  // ログアウト
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          message: "ログアウトに失敗しました"
        });
      }

      res.json({
        ok: true,
        message: "ログアウトしました"
      });
    });
  });
}