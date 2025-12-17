import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

export async function generateKnowHow(
  logs: string[],
  tags: string[],
): Promise<string> {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE,
    },
  });

  const prompt = PromptTemplate.fromTemplate(`
あなたは熟練の農業指導員です。
以下に示す**複数の作業日誌**と**タグ情報**を横断的に分析し、
再現性のある「栽培ノウハウ」を抽出してください。

【作業日誌一覧】
{logs}

【タグ】
{tags}

【分析手順】
1. 各日誌の「作業」「条件」「結果」の因果関係を読み取る
2. タグ（天候・作業内容・生育段階など）との相関を分析する
3. 複数日誌に共通する成功パターン・失敗パターンを抽出する
4. 条件付きでのみ成立する知見は必ず明記する

【出力形式】
Markdown形式で出力してください。

# 栽培ノウハウまとめ

`);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  // 配列 → 人間が読みやすい形式に変換
  const formattedLogs = logs
    .map((log, i) => `### 日誌${i + 1}\n${log}`)
    .join("\n\n");

  return await chain.invoke({
    logs: formattedLogs,
    tags: tags.join(", "),
  });
}
