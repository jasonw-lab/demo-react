# Photo Gallery Application

A moder# 📦 Release Notes

本文件用于记录每次版本发布的功能更新、修复、数据库变更以及部署说明。

---

## 🆕 Version: v0.1.0
📅 Release Date: 2025-05-15

### ✨ 新功能（Features）

- 写真一覧画面を実装（shadcn/ui + Next.js）
- 写真アップロード機能（MinIO + presigned URL）
- Prisma を使った MySQL 保存（タイトル・説明文）
- API: `/api/photos` CRUD 完成（GET/POST/PUT/DELETE）

### 🐛 修正（Bug Fixes）

- 写真削除時の MinIO 削除漏れを修正
- Next.js API の 404 エラー処理を改善

### 🗃 DB 変更（Database Changes）

```sql
CREATE TABLE `Photo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255),
  `description` TEXT,
  `url` VARCHAR(255),
  `folder` VARCHAR(255),
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
);

```

---

## 🆕 Version: v0.2.0
📅 Release Date: 2025-06-13

### ✨ 仕様変更・機能改善
- 写真フォルダ対応
---

## 🆕 Version: v0.3.0
📅 Release Date: 2025-06-23

### ✨ 仕様変更・機能改善
- Photoテーブルの`url`カラムを「ファイル名のみ」格納する仕様に変更。
- 画像URLは `MINIO_BASE_URL + / + folder + / + url` で組み立てる方式に統一。
- UI側も上記仕様に対応し、すべての画像表示箇所で正しいURLを生成するよう修正。

### 🗃 DB 変更（Database Changes）
- `url`カラムにはファイル名のみを保存。
- `folder`カラムを追加し、画像の保存先フォルダを管理。
