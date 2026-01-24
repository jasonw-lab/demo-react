#  CLI 開発フロー（Issue → Branch → 実装 → Commit/Push → PR）

本ドキュメントは、Codex CLI を活用した開発の標準手順を定義する。
目的は「迷いを減らし、変更範囲のブレを防ぎ、PRレビューを容易にする」こと。

---

## 1. 基本原則（守ること）

1. **1 Issue = 1 Branch**
2. **1 Branch は 1つの目的だけ**（Issue外の改善は混ぜない）
3. **受け入れ条件（AC）で完了を判断**する（実装者の主観で終わらせない）
4. **小さくコミット**し、PRでレビューしやすくする
5. Codex CLI には毎回 **「やること／やらないこと」** を明示する

---

## 2. 成果物と配置

* 要件：`docs/要件定義.md`
* Issue（設計）：`docs/issues/issue-XXX-*.md`
* 開発フロー：`docs/flow/codex-dev-flow.md`（本書）
* （任意）PRテンプレ：`.github/pull_request_template.md`

---

## 3. 命名規約

### 3.1 ブランチ名

* 形式：`feature/issue-XXX-<slug>`
* 例：`feature/issue-002-search-results`

### 3.2 コミットメッセージ（推奨）

* `feat: ...` / `fix: ...` / `docs: ...` / `refactor: ...` / `chore: ...`
* 例：`feat: implement search results list (issue-002)`

### 3.3 PRタイトル（推奨）

* `Issue-XXX <短い説明>`
* 例：`Issue-002 検索結果一覧（フィルタ/ソート）`

---

## 4. 標準フロー

### Step 0. Issue 作成（要件 → Issue）

**目的**：実装前に「何を作るか」「完了条件」を確定する。
**成果物**：`docs/issues/issue-XXX-*.md`

* `docs/要件定義.md` をベースに Issue を作成する
* Issue は **機能の塊** 単位で切る（細かすぎない）
* 必ず以下を含める：

  * 背景・目的
  * スコープ（含む／含まない）
  * 受け入れ条件（AC）
  * 依存関係（前提Issue／後続Issue）

---

### Step 1. 最新化 & ブランチ作成

```bash
git checkout main
git pull
git checkout -b feature/issue-XXX-<slug>
```

---

### Step 2. Codex CLI へ実装指示（Issue単位）

**目的**：対象Issueのスコープ内だけを実装させる。

指示の最低限ルール：

* 対象Issueファイルを明示する（例：`docs/issues/issue-002-xxx.md`）
* **ACを満たすことがゴール**と明記する
* **やらないこと（スコープ外）** を明記する
* 出力に「変更ファイル一覧」と「動作確認手順」を含めさせる

#### 推奨プロンプト（テンプレ）

* 例（貼り替え用）：

  * 対象Issue：`docs/issues/issue-XXX-xxx.md`
  * 制約：Issue外の変更禁止、コード生成は必要最小限、見栄え優先（デモ）
  * 完了：ACチェックを全て満たす

---

### Step 3. ローカル動作確認（最小セット）

**目的**：PR前に最低限の品質を担保する。

推奨チェック：

```bash
npm install
npm run lint
npm test      # テストがある場合
npm run dev
```

確認観点：

* 対象機能が AC を満たす
* 画面遷移／戻る操作で破綻しない
* 表示崩れがない（主要ブレークポイント）

---

### Step 4. Commit（レビュー可能な単位）

**目的**：差分を追いやすくする。

1 Issue でも差分が大きい場合は 2〜3コミットに分割する：

* 例：

  * `feat: add search results page layout (issue-002)`
  * `feat: add filters and sorting (issue-002)`

実行：

```bash
git status
git add -A
git commit -m "feat: <message> (issue-XXX)"
```

---

### Step 5. Push

```bash
git push -u origin feature/issue-XXX-<slug>
```

---

### Step 6. PR 作成（GitHub）

**目的**：レビューとマージの標準化。

PR本文に含める（推奨）：

* 対象Issue番号/リンク
* 変更概要（3行程度）
* ACチェック結果（チェックボックス）
* 動作確認手順
* スクリーンショット（UIの場合は任意だが強く推奨）

---

### Step 7. マージ後の後片付け

```bash
git checkout main
git pull
git branch -d feature/issue-XXX-<slug>
```

---

## 5. 運用ルール（よくある事故を防ぐ）

* 「気づいた改善」は別Issueへ（同じPRに混ぜない）
* リファクタは **専用Issue** にする（デモは特に）
* コンフリクト回避のため、長期ブランチを作らない
* IssueのACが曖昧な場合、**実装前にIssueを修正**してから着手する

---

## 6. Doneの定義

以下を満たしたら Issue 完了（PRマージ可）：

* 対象IssueのACをすべて満たす
* スコープ外の変更が混ざっていない
* ローカルの最低限チェック（lint / dev起動）が通る
* PRの説明が揃っている（ACチェック、手順、概要）
