
# ホテル予約デモ 要件定義（UIデモ／APIなし）

## 1. 目的

本デモは、ホテル予約サービス（Booking系）を題材に
**検索 → 詳細 → 予約 → 完了** の一連のユーザー体験を
**フロントエンドのみ（APIなし）** で再現し、
**プロフェッショナルなUI設計力・状態設計力・画面遷移設計** を示すことを目的とする。

### 1.1 重点目標

* **即座にプロフェッショナル感が伝わる洗練されたUI**
* **モダンな技術スタック（Next.js + shadcn/ui）の効果的な活用**
* **直感的で快適なユーザー体験の実現**

## 2. 技術スタック

### 2.1 選定技術

* **フレームワーク**: Next.js 14+ (App Router)
* **言語**: TypeScript
* **UIコンポーネント**: shadcn/ui
* **スタイリング**: Tailwind CSS

📋 **詳細**: 技術選定の詳細な理由と検討経緯は [ADR-001: UI技術スタックの選定](../adr/001-ui-technology-stack.md) を参照。

### 2.2 選定理由（サマリー）

* **Next.js**: SSR/SSG対応、最適化された画像処理、優れたDX
* **shadcn/ui**: カスタマイズ可能な高品質UIコンポーネント、即プロ感の実現
* **TypeScript**: 型安全性と保守性の向上

## 3. 前提条件

* バックエンド/API は存在しない
* データはすべてモックデータ（TypeScript型定義付き）を使用する
* 実決済・会員登録・認証は行わない
* **見栄えと体験の分かりやすさを最優先とする**
* **デモとして10秒以内に価値が伝わること**

## 4. 想定ユーザー

* 宿泊先を検索・比較し、予約を行う一般ユーザー
* デモを評価する技術者・採用担当者

## 5. 対象スコープ

### 5.1 対象

* ホテル検索 UI
* ホテル詳細 UI
* 予約入力 UI
* 予約完了 UI

### 5.2 非対象

* ユーザー認証／ログイン
* 実在庫管理
* 実決済処理
* 管理者画面
* 通知（メール等）

## 6. 画面構成

### 6.1 画面一覧

1. **検索トップ（Landing Page）**
2. **検索結果一覧（Search Results）**
3. **ホテル詳細（Hotel Details）**
4. **予約完了（Booking Confirmation）**

### 6.2 UI/UXデザイン原則

📋 **詳細**: デザインコンセプト、カラーパレット、画面レイアウトの詳細は [UI/UXデザイン提案書](../ui-design.md) を参照。

* **shadcn/uiコンポーネントを最大限活用**
* **一貫したデザインシステム（カラー、タイポグラフィ、スペーシング）**
* **スムーズなアニメーション・トランジション**
* **明確な視覚階層とホワイトスペースの活用**
* **高品質な画像とアイコンの使用**

## 7. ユースケース

### UC-01 検索条件を入力する

* 行き先（都市・エリア）- Combobox / Select
* チェックイン日／チェックアウト日 - Calendar / Date Picker
* 人数（大人・子供）- Counter / Number Input
* 部屋数 - Counter / Number Input

### UC-02 検索結果を閲覧する

* 条件に合致するホテル一覧を表示する (Card コンポーネント)
* 各ホテルの概要（価格・評価・特徴）を確認できる
* スケルトンローディングで初回表示を最適化

### UC-03 条件で絞り込み・並び替えを行う

* 価格帯 (Slider)
* 評価（★）(Checkbox / Radio Group)
* 設備条件 (Checkbox Group)
* ソート（おすすめ／価格順／評価順）(Select / Tabs)

### UC-04 ホテル詳細を確認する

* 写真ギャラリー (Carousel / Image Gallery)
* 基本情報 (Card)
* 設備情報 (Badge / Icon Grid)
* 部屋タイプと料金 (Accordion / Card)

### UC-05 予約を完了する

* 予約者情報を入力する (Input / Form)
* 予約内容を確認する (Dialog / Sheet)
* 予約完了画面を表示する

## 8. 画面別要件

### 8.1 検索トップ

**目的**: ユーザーの最初の印象で「プロフェッショナル」を感じさせる

**UI要件**:
* ヒーローセクションに高品質な背景画像
* 中央配置の検索フォーム（Card / Form コンポーネント）
* 人気の目的地一覧（Grid レイアウト）
* スムーズなフェードインアニメーション

**shadcn/uiコンポーネント**:
* `Card`, `Form`, `Input`, `Calendar`, `Button`, `Select`

**機能**:
* 検索条件入力フォームを表示する
* バリデーション（Zod）による入力チェック
* 検索実行時、検索結果一覧画面へ遷移する
* 入力内容は検索結果画面でも保持される

### 8.2 検索結果一覧

**目的**: 複数のホテルを効率的に比較できる

**UI要件**:
* 左サイドバー: フィルター（Collapsible / Accordion）
* 右メインエリア: ホテルカードリスト（Grid / List）
* 各カード: 画像、評価、価格、特徴バッジ
* ホバー時のスムーズなアニメーション効果

**shadcn/uiコンポーネント**:
* `Sheet`, `Accordion`, `Slider`, `Checkbox`, `Card`, `Badge`, `Skeleton`

**機能**:
* ホテルをカード形式で一覧表示する
* フィルタ条件を変更すると即時に結果が反映される
* 並び替え条件を変更できる（Tabs / Select）
* ホテル選択で詳細画面へ遷移する
* モバイル: フィルターは Sheet で表示

### 8.3 ホテル詳細

**目的**: ホテルの魅力を最大限伝える

**UI要件**:
* フルスクリーン画像ギャラリー（Carousel）
* タブ切り替え式の情報セクション（Tabs）
* 固定された予約CTAボタン（Sticky）
* 部屋タイプ選択（Radio Group / Card Select）
* レビュー・評価の視覚的表示

**shadcn/uiコンポーネント**:
* `Carousel`, `Tabs`, `Card`, `Button`, `Dialog`, `RadioGroup`, `Separator`, `Avatar`

**機能**:
* ホテルの詳細情報を表示する
* 部屋タイプを選択できる
* 「予約する」操作が可能である（Dialog / Sheet で予約フォーム表示）

### 8.4 予約完了

**目的**: 予約完了の達成感と安心感を与える

**UI要件**:
* 成功アイコン（CheckCircle）とアニメーション
* 予約内容のサマリーカード
* QRコード（擬似）表示
* 明確な次のアクションボタン

**shadcn/uiコンポーネント**:
* `Card`, `Button`, `Separator`, `Badge`

**機能**:
* 予約完了メッセージを表示する
* 以下の情報を表示する

  * 予約番号（擬似）
  * 宿泊日
  * ホテル名
  * 人数・部屋数
  * 合計金額
* トップ画面へ戻る導線を提供する
* 予約詳細のダウンロード（PDF風プレビュー）

## 9. 状態管理要件

### 9.1 状態の種類

* **検索条件**: URL Search Params / Context / Zustand
* **フィルタ・ソート条件**: useState / URL Search Params
* **選択中のホテル・部屋情報**: Context / Zustand
* **予約情報**: Context / LocalStorage（optional）

### 9.2 要件

* 検索条件は画面遷移後も保持される
* フィルタ・ソート条件は即時に画面へ反映される
* 選択中のホテル・部屋情報は予約完了まで保持される
* 画面更新・戻る操作で体験が破綻しないこと
* TypeScript型定義による型安全な状態管理

## 10. モックデータ要件

### 10.1 データ構造（TypeScript）

```typescript
// 都市・エリア
interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
}

// ホテル
interface Hotel {
  id: string;
  name: string;
  destinationId: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  amenities: string[];
  roomTypes: RoomType[];
}

// 部屋タイプ
interface RoomType {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}
```

### 10.2 データ量

* 都市情報: 5〜10件
* ホテル情報: 20〜30件
* 部屋タイプ: 各ホテル2〜4タイプ
* 高品質な画像（Unsplash API / Next.js Image Optimization）

## 11. 非機能要件

### 11.1 UI/UX品質

* **視覚的インパクト**: 初回表示で「プロ感」が伝わる
* **一貫性**: shadcn/uiのデザイントークンを活用
* **アニメーション**: Framer Motion / CSS Transition（適度に使用）
* **レスポンシブ**: Mobile First アプローチ
* **フォント**: 日本語フォント（Noto Sans JP / Inter）の適切な適用

### 11.2 パフォーマンス

* **初回表示**: 2秒以内（Lighthouse Performance Score 90+）
* **画像最適化**: Next.js Image コンポーネント使用
* **コード分割**: Dynamic Import による遅延ロード
* **ローディング**: Skeleton / Suspense による体験向上

### 11.3 アクセシビリティ

* **WCAG 2.1 AA準拠**
* **キーボードナビゲーション対応**
* **適切なARIAラベル**
* **色のコントラスト比: 4.5:1以上**
* **shadcn/uiコンポーネントのアクセシビリティ機能活用**

### 11.4 デバイス対応

* **デスクトップ**: 1920px, 1440px, 1280px
* **タブレット**: 768px, 1024px
* **モバイル**: 375px, 414px

### 11.5 ブラウザ対応

* Chrome / Edge（最新版）
* Safari（最新版）
* Firefox（最新版）

## 12. 完了条件

### 12.1 機能完了

* ✅ 検索から予約完了まで一連の操作が可能である
* ✅ APIなしでも「予約できた」と理解できる体験になっている
* ✅ すべてのshadcn/uiコンポーネントが適切に動作する
* ✅ TypeScriptの型エラーがゼロである

### 12.2 品質完了

* ✅ **10秒ルール**: 初見のユーザーが10秒以内に価値を理解できる
* ✅ **プロ感**: デザインとUIが洗練されており、商用レベルに見える
* ✅ **直感性**: 操作内容を説明なしで理解できる
* ✅ Lighthouse Scoreが全項目80点以上
* ✅ レスポンシブデザインがすべてのブレークポイントで破綻しない

### 12.3 デモ完了

* ✅ README.mdにプロジェクト概要・セットアップ手順を記載
* ✅ スクリーンショット・動画で主要画面を記録
* ✅ デプロイ可能な状態（Vercel対応）

---

**最終目標**: このデモを見た人が「すぐにでもプロダクション環境で使えそう」と感じるクオリティを実現すること。
