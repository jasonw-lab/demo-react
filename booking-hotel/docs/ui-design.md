# ホテル予約デモ UI/UXデザイン提案書

## 1. デザインコンセプト

### "Effortless Luxury" (手軽な贅沢)

ユーザーがサイトを訪れた瞬間から、「特別な体験」が始まることを予感させるデザイン。
複雑な操作を極限まで排除し、視覚的な美しさと使いやすさを両立させる。

#### キーワード
*   **Immersive (没入感)**: 高品質な画像を大胆に使用し、旅への想像を掻き立てる。
*   **Clarity (明快さ)**: 情報の優先順位を明確にし、迷わせない。
*   **Trust (信頼感)**: 洗練されたタイポグラフィと整ったレイアウトでプロフェッショナルな印象を与える。

---

## 2. カラーパレット

shadcn/ui のニュートラル（`zinc`）を基調としつつ、アクセントカラーでブランド個性を表現する。

### デザイントークン（実装指針）

色指定は hex 直書きではなく、shadcn/ui の CSS 変数（`--background` など）と Tailwind のユーティリティ（`bg-background` など）を基本とする。

*   **基本**: `bg-background text-foreground`
*   **枠線**: `border-border`
*   **カード**: `bg-card text-card-foreground`
*   **主要アクション**: `bg-primary text-primary-foreground`
*   **補助面**: `bg-muted text-muted-foreground`
*   **フォーカスリング**: `ring-ring`

> 例: `Button` は `variant="default"`（= primary）を主要導線に統一し、ページ内の「検索」など最重要 CTA を primary に寄せる。
>
> 推奨: `--primary` をニュートラル（黒寄り）に置き、`--ring` は Brand Accent（sky）にして「高級感」と「操作性」を両立させる。

### Primary Colors
*   **Neutral Base (zinc)**: `zinc-50/100/200/700/900` 相当 - 背景・枠線・本文・見出しの基調
    *   *清潔感、信頼感、UIの読みやすさ*
*   **Primary**: `--primary` / `--primary-foreground` - 主要ボタン、選択状態、重要な強調
*   **Background / Surface**: `--background`, `--card`, `--muted` - ベース背景、カード、セクションの面分け

### Accent Colors
*   **Brand Accent**: `sky-500` 相当 - フォーカスリング、リンク、アクセント要素に使用（多用せず“効かせる”）
    *   *爽やかさ、旅の始まり*
*   **Highlight**: `amber-400` 相当 - 評価スター、おすすめバッジ
    *   *温かみ、ポジティブな印象*
*   **Destructive**: `--destructive` / `--destructive-foreground` - キャンセル、危険操作、エラー
    *   *明確な警告*

### Text Colors
*   **Heading**: `text-foreground`（フォントウェイトで差をつける）
*   **Body**: `text-foreground`
*   **Muted**: `text-muted-foreground`

### ダークモード

デモでも「見た目の完成度」が上がるため、初期から `dark` テーマを前提にする。

*   **方針**: shadcn/ui の `globals.css` で light/dark のトークンを定義し、コンポーネントはトークン参照のみで組む。
*   **注意**: 画像上の文字はオーバーレイ（暗幕）や text-shadow でコントラストを担保する。

---

## 3. タイポグラフィ

可読性と美しさを重視したフォント選定。

### Font Family
*   **English**: `Inter` (Google Fonts)
    *   *モダン、ニュートラル、可読性が高い*
*   **Japanese**: `Noto Sans JP` (Google Fonts)
    *   *ウェイトのバリエーションが豊富、Interとの相性が良い*

### Type Scale
*   **Display**: `text-4xl` to `text-6xl`, `font-bold` - ヒーローエリアのキャッチコピー
*   **H1**: `text-3xl`, `font-bold` - ページタイトル
*   **H2**: `text-2xl`, `font-semibold` - セクション見出し
*   **H3**: `text-xl`, `font-semibold` - カードタイトル
*   **Body**: `text-base`, `font-normal` - 一般的なテキスト
*   **Small**: `text-sm`, `font-medium` - メタデータ、補足

---

## 4. コンポーネントスタイリング (shadcn/ui + Custom)

shadcn/ui のデフォルトを活かしつつ、"Luxury"感を出すための調整。

### Card (ホテルカード等)
*   **Border**: `border-border`（極細）またはボーダーレス（面で分ける）
*   **Shadow**: `shadow-sm` → Hover時に `shadow-lg` へのスムーズなトランジション（`transition-shadow`）
*   **Radius**: `rounded-xl` (少し大きめの角丸で親しみやすさとモダンさを演出)
*   **Interaction**: 画像部分のズームイン効果（`hover:scale-[1.03]` 程度、`motion-reduce:transform-none`）

### Button
*   **Primary**: `bg-primary text-primary-foreground`, `rounded-full`（よりモダンな印象）
*   **Ghost/Outline**: 余白を広めにし、ホバー背景は `bg-accent` 系で上品に

### Input / Form
*   **Style**: `bg-background` を基本に、密度の高い領域のみ `bg-muted` で面を分ける
*   **Focus**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`（shadcn/ui の標準に寄せる）

---

## 5. 画面別レイアウト & UI構成案

### 5.1 検索トップ (Search Home)
*   **Hero Section**:
    *   画面の80vhを占める高品質な背景画像（動画も検討）。
    *   中央に「次は、どこへ？」のような情緒的なコピー。
*   **Search Bar**:
    *   フローティングデザインの検索バー。
    *   スクロールしても上部に追従（Sticky）、またはヒーロー中央に配置。
    *   「場所」「日付」「人数」を1つの大きな角丸コンテナに収める（Airbnb風）。
*   **Featured Destinations**:
    *   人気都市を横スクロール（Carousel）またはMasonryグリッドで表示。

### 5.2 検索結果一覧 (Search Results)
*   **Layout**: `300px` (Filter) : `1fr` (List) の2カラム構成。
*   **Hotel Card**:
    *   画像を大きく配置（カードの高さの50%以上）。
    *   画像上に「お気に入り追加」ボタンをオーバーレイ。
    *   重要な情報（価格、評価）を強調。
    *   特徴タグ（「朝食付き」「駅近」）をBadgeで表示。
*   **Sticky Map (Optional)**:
    *   デスクトップでは右側に地図を表示するレイアウトも検討（今回はスコープ外だがデザインとして意識）。

### 5.3 ホテル詳細 (Hotel Details)
*   **Header**:
    *   ホテル名、住所、評価、アクションボタン（シェア、保存）。
*   **Gallery**:
    *   Bento Grid（弁当箱グリッド）レイアウト。メイン画像1枚＋サブ画像4枚の美しい組み方。
    *   クリックでモーダル拡大表示。
*   **Content**:
    *   左カラム（70%）: 説明、設備、部屋タイプ一覧。
    *   右カラム（30%）: 予約カード（Sticky）。日付選択と料金計算、予約ボタンを常に表示。

### 5.4 予約完了 (Booking Confirmation)
*   **Visual**:
    *   画面中央に大きなチェックマークのアニメーション。
    *   「旅の準備が整いました」という肯定的なメッセージ。
*   **Receipt**:
    *   チケット風のデザインの予約概要カード。
    *   ミシン目デザインやバーコード/QRコード装飾で「チケット感」を演出。

---

## 6. 状態設計（Loading / Empty / Error）

「APIなしデモ」でもユーザー体験の完成度を上げるため、状態を最初から UI として定義する。

### Loading
*   **検索結果一覧**: `Skeleton` でカードの形状（画像 + タイトル + 価格 + 評価）を 6〜8枚表示
*   **ホテル詳細**: ギャラリー（矩形） + 予約カード（ボタン） + 説明文（行）を Skeleton 化
*   **ボタン**: 送信中は `disabled` + スピナー（`Loader2` など） + 文言を「予約中…」に変更

### Empty
*   **検索結果0件**: 「条件を変えて再検索」メッセージ + 主要フィルタのリセットボタン
*   **お気に入り0件（将来）**: 保存導線の説明 + おすすめのホテル表示

### Error
*   **フォーム入力エラー**: フィールド直下のインラインエラー（`FormMessage`）に統一
*   **致命的エラー**: `Toast/Sonner` で通知 + 再試行ボタン（可能なら）
*   **画像読み込み失敗**: 代替画像 + ホテル名イニシャル/プレースホルダ（視覚の欠けを防ぐ）

---

## 7. モバイル体験（最重要導線）

デスクトップの2カラムはモバイルで破綻しやすいため、Sheet/Drawer を前提に設計する。

*   **検索バー**: 1行サマリー（場所/日付/人数） + タップで `Sheet` を開き編集
*   **日付選択**: カレンダーはフル幅、長押し不要、選択状態が明確（rangeの開始/終了）
*   **フィルタ**: 検索結果で `Filter` ボタン → `Sheet`（適用/リセットを下部固定）
*   **予約CTA**: 詳細画面は「料金/日付」サマリー + 「予約」ボタンを下部に固定（Sticky）

---

## 8. マイクロインタラクション

*   **Hover Effects**: ボタンやカードのホバー時に、わずかな浮き上がり（translate-y）と影の強調。
*   **Page Transition**: 画面遷移時にコンテンツが下からふわっと浮き上がる（Fade Up）アニメーション。
*   **Skeleton Loading**: データ読み込み中にコンテンツの形状を模した波打つスケルトンを表示し、体感待ち時間を短縮。
*   **Sticky Header**: スクロールに伴ってヘッダー背景が透明からぼかし（Glassmorphism）に変化。

### モーション配慮

*   `prefers-reduced-motion` を尊重し、`motion-reduce:*` を併用（ズーム、Fade Up など）
*   アニメーション時間は短め（150–250ms）に統一し、操作遅延を感じさせない

---

## 9. アクセシビリティ（最低ライン）

*   **キーボード操作**: すべての操作が Tab/Enter/Esc で完結（Dialog/Sheet は Radix 準拠）
*   **フォーカス可視化**: `focus-visible` でリング表示を統一し、消さない
*   **コントラスト**: `text-muted-foreground` の使い過ぎに注意（重要情報は `text-foreground`）
*   **画像**: `alt` を必ず設定（装飾画像は空 alt）
*   **フォーム**: ラベルとエラーの関連付け（shadcn/ui の `Form` パターンに統一）
