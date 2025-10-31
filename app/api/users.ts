// app/api/users.ts
import express from "express"; // Express をインポート
import type { Request, Response } from "express"; // 型のみインポート（Request / Response）
import { PrismaClient } from "@prisma/client"; // Prisma クライアントをインポート

const app = express(); // Express アプリの作成
const prisma = new PrismaClient(); // Prisma クライアントのインスタンス化
app.use(express.json()); // リクエストボディを JSON としてパースするミドルウェア

// ★ 仮認証（本来はJWTやセッションを使う）
async function getUserFromHeader(req: Request) {
  // リクエストヘッダからユーザーを取得する仮の認証関数
  const id = req.headers["x-user-id"] as string; // カスタムヘッダ x-user-id をユーザーIDとして読む
  if (!id) throw new Error("未認証ユーザー"); // ID がなければエラーを投げる（未認証）
  const user = await prisma.user.findUnique({
    // Prisma で user を検索
    where: { id }, // id を条件に
    include: { InterestTag: true }, // 関連の InterestTag も含めて取得
  });
  return user; // 見つかったユーザー（または null）を返す
}

// ✅ /api/me
app.get("/api/me", async (req: Request, res: Response) => {
  // 現在のユーザー情報を返すエンドポイント
  try {
    const user = await getUserFromHeader(req); // ヘッダからユーザーを取得
    if (!user)
      return res.status(404).json({ error: "ユーザーが見つかりません" }); // 見つからなければ404
    res.json(user); // ユーザー情報を JSON で返却
  } catch (err) {
    res.status(401).json({ error: "未認証" }); // 認証エラーなら401を返す
  }
});

// ✅ /api/users/me/interest-tag
app.put("/api/users/me/interest-tag", async (req: Request, res: Response) => {
  // ユーザーの興味タグを更新するエンドポイント
  try {
    const user = await getUserFromHeader(req); // 認証（ヘッダ）でユーザー取得
    if (!user)
      return res.status(404).json({ error: "ユーザーが見つかりません" }); // 見つからなければ404

    const { InterestTag: tags } = req.body; // ボディから InterestTag 配列を取り出す
    if (
      !Array.isArray(tags) ||
      !tags.every((t: any) => typeof t === "string")
    ) {
      // 型チェック（配列かつ文字列の配列か）
      return res.status(400).json({ error: "Invalid InterestTag" }); // 不正なら400を返す
    }

    // タグが存在しなければ作成
    await prisma.interestTag.createMany({
      // interestTag テーブルにまとめて挿入（存在するものは skip）
      data: tags.map((t) => ({ tag: t })), // 各タグ名を { tag: string } に変換
      skipDuplicates: true, // 重複（unique制約）をスキップ
    });

    const tagsToSet = tags.map((t) => ({ tag: t })); // user.update の set に渡す形式に変換（{ tag: "..." } の配列）

    const updated = await prisma.user.update({
      // ユーザーの InterestTag 関係を更新
      where: { id: user.id }, // 対象ユーザー
      data: { InterestTag: { set: tagsToSet } }, // set で関連付けを置換（既存を全て置き換える）
      include: { InterestTag: true }, // 更新後の InterestTag を含めて返す
    });

    res.json(updated); // 更新されたユーザーオブジェクトを返却
  } catch (err) {
    console.error(err); // サーバー側でエラー出力
    res.status(500).json({ error: "更新失敗" }); // 何らかのエラーなら 500 を返す
  }
});

app.listen(3001, () => console.log("API server started on port 3001")); // サーバーをポート3001で起動してログ出力

export async function getCurrentUser() {
  // クライアントサイド関数：/api/me を呼んで現在ユーザーを取得
  const res = await fetch("/api/me", {
    headers: { "x-user-id": "clx123" }, // ★仮のログインユーザーID をヘッダに付与（実運用では不可）
  });
  if (!res.ok) throw new Error("ユーザー取得失敗"); // ステータスが ok でなければ例外を投げる
  return res.json(); // JSON を返す（呼び出し側で await して使う）
}

export async function updateInterestTags({
  InterestTag,
}: {
  InterestTag: string[];
}) {
  // クライアントサイド関数：タグ更新 API を呼ぶ
  const res = await fetch("/api/users/me/interest-tag", {
    method: "PUT", // PUT メソッド
    headers: {
      "Content-Type": "application/json", // JSON ボディであることを指定
      "x-user-id": "clx123", // ★仮のログインユーザーID（実運用では認証トークン等を使用する）
    },
    body: JSON.stringify({ InterestTag }), // Body に { InterestTag: string[] } を JSON 化して送信
  });
  if (!res.ok) throw new Error("保存失敗"); // ステータスが ok でなければ例外
  return res.json(); // 更新後のユーザー情報などを返す
}
