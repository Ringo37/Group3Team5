// app/models/user.ts
import { PrismaClient } from "@prisma/client"; // Prisma クライアントをインポート
const prisma = new PrismaClient(); // Prisma インスタンスを生成

export async function setInterestTags(userId: string, tags: string[]) {
  // ユーザーにタグをセットするユーティリティ関数（Prisma 経由）

  // --- 修正箇所 1: (推奨) 存在しないタグを作成する ---
  //
  // 渡された 'tags' 配列 (例: ["農業", "IT"]) が、
  // 'InterestTag' テーブルにレコードとして存在しない場合に備えて作成します。
  // 'InterestTag' モデルの 'tag' フィールドが @unique なので、
  // 'skipDuplicates: true' を指定すると、既に存在するタグの作成エラーをスキップできます。
  try {
    await prisma.interestTag.createMany({
      // 存在しないタグをまとめて作成（既存はスキップ）
      data: tags.map((tagName) => ({
        // tags を { tag: tagName } の形に変換
        tag: tagName, // 'InterestTag' モデルの 'tag' フィールドに設定
      })),
      skipDuplicates: true, // 重複があればスキップ
    });
  } catch (e) {
    // もし 'createMany' や 'skipDuplicates' がデータベースでサポートされていない場合など
    console.error("InterestTagの事前作成に失敗した可能性があります:", e); // エラーをログに出す
    // ここでエラーが発生しても、タグが既に存在すると仮定して更新処理を続行します。
    // （本番環境では、このエラーを適切にハンドリングしてください）
  }

  // --- 修正箇所 2: 'data' の内容を 'set' 操作に変更する ---

  // 'tags' (string[]型) を
  // Prismaの 'set' 操作が要求する [{ tag: string }, { tag: string }, ...] の型に変換します。
  // 'InterestTag' モデルの '@unique' なキーである 'tag' を指定しています。
  const tagsToSet = tags.map((tagName) => ({
    // set に渡す形式に変換
    tag: tagName,
  }));

  // 修正後のコード: data: { InterestTag: { set: tagsToSet } }
  await prisma.user.update({
    // ユーザーの InterestTag 関連を更新
    where: { id: userId }, // 対象ユーザーを指定
    data: {
      InterestTag: {
        // 'set' 操作は、このユーザーの既存の InterestTag 関連付けを
        // *すべて解除* し、'tagsToSet' で指定されたタグのみを
        // 新しく関連付けます。
        set: tagsToSet,
      },
    },
  });
}
