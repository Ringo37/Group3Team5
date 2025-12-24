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
  schedule: {
    phase: string;
    timing: string;
    action: string;
    note?: string;
  }[];
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

  const outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
      title: z
        .string()
        .describe("技術書のタイトル（体言止め、例：『トマトの標準栽培手法』）"),

      summary: z
        .string()
        .describe("マニュアルの要約（100〜150文字程度、常体）"),

      content: z
        .string()
        .describe("Markdown形式の栽培マニュアル本文（見出しは##から開始）"),

      tags: z
        .string()
        .describe("このノウハウの農業に関連するタグをカンマ区切りで記述"),

      schedule: z
        .array(
          z.object({
            phase: z
              .string()
              .describe("栽培工程名（例：播種、育苗、定植、追肥、収穫）"),

            timing: z
              .string()
              .describe("工程の実施時期（例：播種後20〜25日、積算温度500℃）"),

            action: z.string().describe("その工程で行う具体的な作業内容"),

            note: z
              .string()
              .optional()
              .describe("注意点・失敗しやすいポイント・補足情報"),
          }),
        )
        .describe("標準的な栽培スケジュール（時系列順）"),
    }),
  );

  // プロンプト

  const prompt = PromptTemplate.fromTemplate(`
あなたは農業技術書の編集者です。
提供された【作業日誌】と【タグ】の情報を統合し、
初心者でも再現できる**標準栽培マニュアル（教科書形式）**を作成してください。

以下のフォーマット指示に従い、**JSON形式のみ**で出力してください。
{format_instructions}

【編集方針】
1. 文体は「です・ます」調で統一する
2. 日付ではなく再現可能な指標（播種後○日、積算温度○℃）を使用する
3. 精神論を排除し、作業手順と科学的理由（Why）を明確に記述する

【スケジュール作成ルール】
- 栽培工程を時系列順に整理する
- 各工程に「工程名・時期・作業内容・注意点」を含める
- 特定の圃場条件に依存しない一般化された内容にする

【入力データ】
タグ情報:
{tags}

作業日誌:
{logs}
`);

  const chain = prompt.pipe(model).pipe(outputParser);

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

  return await chain.invoke({
    logs: formattedLogs,
    tags: allTags.length > 0 ? allTags.join(", ") : "未分類",
    format_instructions: outputParser.getFormatInstructions(),
  });
}
