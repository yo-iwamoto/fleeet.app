## 概要

個人的な Next.js アプリケーションのテンプレートです．

## 注意点

- Next.js は standalone を利用しているので不要なら `next.config.js` を編集する。
- Dockerfile の定義はプロダクションビルドのみを想定しているため、開発環境でもコンテナが必要な場合は編集または別途作成する。

## ブランチ
`with-prisma` https://github.com/you-5805/my-next-template/tree/with-prisma
- prisma, @prisma/client をインストール
- prisma ディレクトリ
- db コンテナの定義
