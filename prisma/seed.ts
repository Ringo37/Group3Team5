import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { knowhowData } from "./dummyData";

const prisma = new PrismaClient();

const email = "test@example.com";
const password = "Passw0rd!";
const hashedPassword = await bcrypt.hash(password, 10);

// ==========================================
// 文章生成用の素材データ
// ==========================================

// 天気やコンディション（全期間共通）
const conditions = [
  "朝から日差しが強く、作業をしていると汗ばむ陽気だった。",
  "昨晩からの雨で田んぼの水位が少し高くなっている。",
  "風が強く、作業をするには少し厳しいコンディションだった。",
  "湿度が高く、蒸し暑い一日となった。",
  "早朝は霧が出ていたが、昼前には快晴となった。",
  "雲行きが怪しく、いつ雨が降ってもおかしくない天気だった。",
  "非常に過ごしやすい気温で、作業が捗った。",
];

// 1. 田植え・初期育成期（1日目〜30日目）
const phase1Activities = [
  "今日は田植え機を使って苗の植え付けを集中的に行った。",
  "補植作業を行い、機械で植えきれなかった部分を手作業で植えた。",
  "苗箱の洗浄と片付けを行い、来年の準備も並行して進めた。",
  "初期除草剤の散布を行い、雑草の発生を抑制する処置をした。",
  "水管理を徹底し、苗が活着するよう深水管理を維持した。",
];
const phase1Details = [
  "特に田んぼの四隅は機械が入りにくいため、丁寧に手植えをした。",
  "苗の状態は非常に良く、根の張りもしっかりしているようだ。",
  "少し風が強かったため、苗が倒れないか心配だが様子を見たい。",
  "隣の田んぼの方と情報交換をし、今年作付け品種について話した。",
  "機械の調子が少し悪く、途中でメンテナンスを挟みながらの作業となった。",
];

// 2. 育成・管理期（31日目〜80日目）
const phase2Activities = [
  "中干しのため、田んぼの水を落として溝切りを行った。",
  "畦畔（けいはん）の草刈りを行い、カメムシなどの害虫の発生を防いだ。",
  "追肥（穂肥）を行い、稲の成長に合わせて栄養を補給した。",
  "水門の見回りを行い、適切な水位が保たれているか確認した。",
  "ヒエやオモダカなどの雑草が目立ってきたため、除草作業を行った。",
  "病害虫の発生状況を確認するため、葉の色や虫食いを細かくチェックした。",
];
const phase2Details = [
  "土が乾いてヒビが入るまでしっかりと干すことで、根を強く張らせたい。",
  "暑い中の草刈り作業は体力を消耗するが、綺麗になった畦道を見ると達成感がある。",
  "イモチ病の兆候は見られず、今のところ順調に生育している。",
  "一部で葉色が薄い箇所があったため、重点的に肥料を撒いておいた。",
  "ジャンボタニシの被害が少し見られたため、捕獲と対策を行った。",
  "溝切りの際、泥に足を取られて作業に時間がかかってしまった。",
];

// 3. 成熟・収穫準備期（81日目〜100日目）
const phase3Activities = [
  "稲穂が垂れ始め、黄金色に色づいてきた。",
  "収穫に向けて落水を行い、田んぼの土を固める準備に入った。",
  "コンバインの点検整備を行い、収穫シーズン本番に備えた。",
  "スズメなどの鳥害対策として、防鳥ネットや爆音機の設置状況を確認した。",
  "試し刈りを行い、米の水分量を確認した。",
];
const phase3Details = [
  "今年は天候に恵まれたおかげで、粒の張りも良く豊作が期待できそうだ。",
  "まだ少し水分量が高いため、本格的な稲刈りは数日待つことにした。",
  "台風が接近しているとの予報があり、倒伏しないか非常に心配だ。",
  "機械のオイル交換と刃の研磨を行い、万全の状態で挑めるようにした。",
  "近隣の農家とも収穫スケジュールの調整を行い、乾燥機の空き状況を確認した。",
];

// 締めくくり・感想（全期間共通）
const closings = [
  "明日は天気が崩れる予報なので、早朝から作業を開始したい。",
  "体力的にはきつかったが、予定していた作業はすべて完了できた。",
  "この調子で順調に育ってくれることを願う。",
  "作業後に飲んだ水が非常に美味しく感じた。",
  "明日は別の圃場の様子も見に行こうと思う。",
  "トラブルもなく無事に1日を終えることができてホッとしている。",
  "少し疲れが溜まっているので、今夜は早めに休みたい。",
];

// ランダム選択ヘルパー
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 長文生成ロジック
function generateWorkLog(dayIndex: number) {
  let activity = "";
  let detail = "";

  // 時期によって内容を変える
  if (dayIndex < 30) {
    // 田植え期
    activity = pick(phase1Activities);
    detail = pick(phase1Details);
  } else if (dayIndex < 80) {
    // 育成期
    activity = pick(phase2Activities);
    detail = pick(phase2Details);
  } else {
    // 収穫期
    activity = pick(phase3Activities);
    detail = pick(phase3Details);
  }

  const condition = pick(conditions);
  const closing = pick(closings);

  // 文章を結合（句読点や接続詞で自然に繋ぐのは難しいので、文の羅列構成にする）
  const fullText = `${condition}\n\n${activity} ${detail}\n\n${closing}`;

  // タイトルは「作業内容」の一部を使用
  const title = activity.split("。")[0].substring(0, 20) + "...";

  return { title, detail: fullText };
}

const weatherOptions = ["SUNNY", "CLOUDY", "RAINY", "SNOWY"];

async function seed() {
  console.log("Cleaning up database... 🧹");

  await prisma.accessLog.deleteMany();
  await prisma.workLog.deleteMany();
  await prisma.knowhow.deleteMany();
  await prisma.file.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  console.log("Database cleaned.");

  // --- ユーザー作成 ---
  const user = await prisma.user.create({
    data: {
      id: "test",
      name: "Test",
      email: email,
      password: { create: { hash: hashedPassword } },
      role: Role.ADMIN,
    },
  });

  // --- 作物作成 ---
  await prisma.crop.create({
    data: { name: "米", id: 1 },
  });
  await prisma.crop.createMany({
    data: [
      // --- 穀物類 ---
      { id: 2, name: "小麦" },
      { id: 3, name: "大麦" },
      { id: 4, name: "大豆" },
      { id: 5, name: "そば" },
      { id: 6, name: "トウモロコシ" },

      // --- 果菜類（実を食べる野菜） ---
      { id: 7, name: "トマト" },
      { id: 8, name: "ナス" },
      { id: 9, name: "キュウリ" },
      { id: 10, name: "ピーマン" },
      { id: 11, name: "カボチャ" },
      { id: 12, name: "オクラ" },
      { id: 13, name: "枝豆" },
      { id: 14, name: "ゴーヤ" },

      // --- 根菜類（根を食べる野菜） ---
      { id: 15, name: "大根" },
      { id: 16, name: "人参" },
      { id: 17, name: "ジャガイモ" },
      { id: 18, name: "サツマイモ" },
      { id: 19, name: "玉ねぎ" },
      { id: 20, name: "ごぼう" },
      { id: 21, name: "レンコン" },
      { id: 22, name: "里芋" },
      { id: 23, name: "カブ" },

      // --- 葉茎菜類（葉や茎を食べる野菜） ---
      { id: 24, name: "キャベツ" },
      { id: 25, name: "レタス" },
      { id: 26, name: "白菜" },
      { id: 27, name: "ほうれん草" },
      { id: 28, name: "小松菜" },
      { id: 29, name: "ネギ" },
      { id: 30, name: "ブロッコリー" },
      { id: 31, name: "アスパラガス" },
      { id: 32, name: "ニラ" },
      { id: 33, name: "セロリ" },

      // --- 果物類 ---
      { id: 34, name: "イチゴ" },
      { id: 35, name: "スイカ" },
      { id: 36, name: "メロン" },
      { id: 37, name: "ミカン" },
      { id: 38, name: "リンゴ" },
      { id: 39, name: "ブドウ" },
      { id: 40, name: "梨" },
      { id: 41, name: "桃" },
      { id: 42, name: "柿" },
      { id: 43, name: "レモン" },

      // --- その他 ---
      { id: 44, name: "キノコ" },
      { id: 45, name: "茶" },
    ],
    skipDuplicates: true,
  });

  // --- 組織作成 ---
  const org1 = await prisma.organization.create({
    data: {
      name: "テスト組織",
      detail: "テスト組織の詳細",
      owners: { connect: { id: user.id } },
    },
  });

  // --- 農場作成 ---
  const farm = await prisma.farm.create({
    data: {
      id: 1,
      name: "INIAD田んぼ",
      areaHa: 10,
      region: "Tokyo",
      seasonalCalendar: "4~10月",
      cropId: 1, // 米
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 2,
      name: "赤羽農場",
      areaHa: 10,
      region: "Tokyo",
      seasonalCalendar: "4~10月",
      cropId: 7, // トマト
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 3,
      name: "多摩川ファーム",
      areaHa: 5,
      region: "Tokyo",
      seasonalCalendar: "3~9月",
      cropId: 25, // レタス
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 4,
      name: "湘南グリーン農園",
      areaHa: 8,
      region: "Kanagawa",
      seasonalCalendar: "3~11月",
      cropId: 24, // キャベツ
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 5,
      name: "信州高原ファーム",
      areaHa: 12,
      region: "Nagano",
      seasonalCalendar: "5~10月",
      cropId: 38, // リンゴ
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 6,
      name: "越後ライスフィールド",
      areaHa: 20,
      region: "Niigata",
      seasonalCalendar: "5~9月",
      cropId: 1, // 米
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 7,
      name: "近江水田センター",
      areaHa: 15,
      region: "Shiga",
      seasonalCalendar: "4~10月",
      cropId: 4, // 大豆
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 8,
      name: "庄内アグリパーク",
      areaHa: 18,
      region: "Yamagata",
      seasonalCalendar: "5~9月",
      cropId: 40, // 梨
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  await prisma.farm.create({
    data: {
      id: 9,
      name: "筑後平野ファーム",
      areaHa: 22,
      region: "Fukuoka",
      seasonalCalendar: "4~10月",
      cropId: 45, // 茶
      users: { connect: { id: user.id } },
      organizationId: org1.id,
    },
  });

  // --- WorkLog（作業日誌）100件生成 ---
  const workLogsData = [];

  // 過去100日分のデータを生成
  // シミュレーションとして「今日」を10月1日と仮定し、そこから遡ると自然な米作りシーズンになりますが、
  // ここでは単純に今日から100日前として生成します。
  for (let i = 0; i < 100; i++) {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - (100 - i)); // 100日前から今日に向かって進む

    // 日数インデックス(0~99)に基づいて内容を生成
    const content = generateWorkLog(i);
    const randomWeather =
      weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

    workLogsData.push({
      farmId: farm.id,
      userId: user.id,
      date: logDate,
      title: content.title,
      workDetails: content.detail, // 長文の詳細
      temperature: Math.floor(Math.random() * 15) + 15,
      humidity: Math.floor(Math.random() * 50) + 30,
      weather: randomWeather as any,
    });
  }

  await prisma.workLog.createMany({
    data: workLogsData,
  });

  await prisma.file.createMany({
    data: [
      {
        id: "1",
        url: "https://www.kagome.co.jp/seisen/tomato/about/img/sp/nature_img.jpg",
        fileName: "",
      },
      {
        id: "2",
        url: "https://ymmfarm.com/wp-content/uploads/2024/01/cucumber-harvest.jpg",
        fileName: "",
      },
      {
        id: "3",
        url: "https://www.kubota.co.jp/kubotatanbo/role/img/2-1-1_mechanism_kv.jpg",
        fileName: "",
      },
      {
        id: "4",
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcdORvvHk7dx6ROip48r1BQ2YyInK4Ld1-kQ&s",
        fileName: "",
      },
      {
        id: "5",
        url: "https://wakasa-takahama.jp/wp-content/uploads/2020/02/umibeno-ichigobatake_01.jpg",
        fileName: "",
      },
    ],
  });

  for (const knowhow of knowhowData) {
    await prisma.knowhow.create({
      data: {
        title: knowhow.title,
        summary: knowhow.summary,
        fullText: knowhow.fullText,
        visibility: knowhow.visibility,
        farmId: knowhow.farmId,
        userId: knowhow.userId,

        tags: {
          connectOrCreate: knowhow.tags.map((tag) => ({
            where: { tag },
            create: { tag },
          })),
        },
        fileId: knowhow.fileId,
      },
    });
  }
  console.log("Long & unique work logs created successfully! 🌾");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
