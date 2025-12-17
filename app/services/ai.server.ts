import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

import type { WorkLogsWithUserAndTags } from "~/models/workLog.server";

// 戻り値の型定義
export type KnowHowResult = {
  title: string;
  summary: string;
  content: string;
  tags: string;
};

export async function generateKnowHow(
  logs: WorkLogsWithUserAndTags[],
): Promise<KnowHowResult> {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE,
    },
  });

  // 1. 出力スキーマの定義（タイトル、サマリー、本文）
  const outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
      title: z
        .string()
        .describe(
          "技術書のタイトル（体言止め、例：『[品目名]の標準栽培手法』）",
        ),
      summary: z
        .string()
        .describe("マニュアルの要約（100〜150文字程度、常体で記述）"),
      content: z
        .string()
        .describe(
          "Markdown形式の栽培マニュアル本文（見出し#は一つ減らして##から始めること）",
        ),
      tags: z.string().describe("このノウハウのタグをカンマ区切りで記述"),
    }),
  );

  // 2. プロンプトの構築
  const prompt = PromptTemplate.fromTemplate(`
あなたは農業技術書の編集者です。
提供された【作業日誌】と【タグ】の情報を統合し、初心者でも参照できる**「標準栽培マニュアル（教科書形式）」**を作成してください。

以下のフォーマット指示に従って、JSON形式で出力してください。
{format_instructions}

【編集方針】
1. **文体**: 「です・ます」調で統一し、客観的かつ簡潔に記述する。
2. **一般化**: 具体的な日付ではなく、再現可能な指標（例: 播種後○日、積算温度○℃）を用いる。
3. **内容**: 精神論を排除し、論理的な手順と科学的根拠（Why）を記述する。

【入力データ】
タグ情報: {tags}
作業日誌:
{logs}
`);

  // 3. チェーンの作成（パーサーをパイプに接続）
  const chain = prompt.pipe(model).pipe(outputParser);

  // 4. ログデータの整形
  const formattedLogs = logs
    .map((log, i) => {
      const date = log.date.toISOString().split("T")[0];
      const temp =
        log.temperature !== null ? `${log.temperature}℃` : "記録なし";
      const weather = log.weather ?? "記録なし";

      return `
[日誌ID:${i + 1}]
日付: ${date}
気象: ${weather}, 気温:${temp}
件名: ${log.title}
詳細: ${log.workDetails}
`;
    })
    .join("\n");

  const allTags = Array.from(
    new Set(logs.flatMap((log) => log.tags.map((tag) => tag.tag))),
  );

  // 5. 実行と結果の返却（自動的にオブジェクトとしてパースされます）
  return await chain.invoke({
    logs: formattedLogs,
    tags: allTags.length > 0 ? allTags.join(", ") : "未分類",
    format_instructions: outputParser.getFormatInstructions(),
  });
}
