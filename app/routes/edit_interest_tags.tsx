// app/routes/learners/edit_interest_tags.tsx

import { Button, Input, Box, Heading, VStack } from "@chakra-ui/react"; // Chakra UI のコンポーネント群をインポート
import { useState, useEffect } from "react"; // Reactのフック useState と useEffect をインポート
import type { FormEvent } from "react"; // ✅ 型のみインポート（フォームイベントの型指定に使用）
import { useNavigate } from "react-router"; // ルーティングでページ遷移するためのフックをインポート

import { getCurrentUser, updateInterestTags } from "~/api/users"; // API 呼び出し関数をインポート

export default function EditInterestTagsPage() {
  // コンポーネントのデフォルトエクスポート（編集ページ）
  const [tags, setTags] = useState(""); // 入力されるタグ文字列（カンマ区切り）を管理する state
  const [loading, setLoading] = useState(false); // ユーザー取得中かどうかのローディング状態
  const [saving, setSaving] = useState(false); // 保存（PUT）中かどうかの状態
  const navigate = useNavigate(); // ページ遷移用の関数を取得

  useEffect(() => {
    // マウント時に一度だけ実行して現在のユーザー情報を取得する副作用
    async function fetchUser() {
      // 非同期関数を定義
      setLoading(true); // 取得開始 -> ローディングを true にセット
      const user = await getCurrentUser(); // サーバーから現在ユーザーを取得

      const tagNames =
        user?.InterestTag?.map((t: { tag: string }) => t.tag) || []; // 取得した InterestTag 配列から文字列タグだけ抜き出す（存在しない場合は空配列）
      setTags(tagNames.join(", ")); // カンマ区切りの文字列にして入力欄にセット
      setLoading(false); // 取得完了 -> ローディングを false にセット
    }
    fetchUser(); // 定義した関数を呼び出す
  }, []); // 空配列なのでマウント時に一度だけ実行

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // フォーム送信時のハンドラ（非同期）
    e.preventDefault(); // デフォルトのフォーム送信（ページリロード）を防ぐ
    setSaving(true); // 保存中フラグを true に

    const tagsArray = tags // 入力されたカンマ区切り文字列を配列に変換
      .split(",") // カンマで分割
      .map((t) => t.trim()) // 前後の空白を削除
      .filter((t) => t.length > 0); // 空文字は除外

    await updateInterestTags({ InterestTag: tagsArray }); // API に PUT リクエストでタグ配列を送信して更新
    setSaving(false); // 保存処理完了 -> saving を false に
    navigate("/mypage"); // 保存後にマイページへ遷移
  };

  return (
    <Box
      maxW="400px"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      boxShadow="lg"
    >
      {" "}
      {/* 中央寄せのカードボックス */}
      <Heading size="md" mb={4}>
        興味のあるタグを登録・編集
      </Heading>{" "}
      {/* 見出し */}
      <form onSubmit={handleSubmit}>
        {" "}
        {/* フォームの submit を handleSubmit に接続 */}
        <VStack gap={4}>
          {" "}
          {/* 縦に並べるレイアウト（間隔4）,spacing -> gap（CSSのgap） */}
          <Input
            placeholder="例: スマート農業,AI,初心者,センサー" // プレースホルダの例
            value={tags} // Input の値を state と連動
            onChange={(e) => setTags(e.target.value)} // 入力変更時に state を更新
            disabled={loading || saving} // 読み込み中または保存中は入力を無効化,  isDisabled -> disabled（HTML属性）
          />
          <Button
            type="submit" // submit ボタン
            colorScheme="teal" // カラースキーム
            disabled={saving} // saving が true のときボタンに表示, isLoading を避ける代わりに disabled を使う
            loadingText="保存中" // ローディング時のテキスト
          >
            保存する
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
