import type { Timestamp } from 'firebase-admin/firestore';

export type UserDocRaw = {
  /** Twitter API で返される user の id */
  twitter_user_id: string;
  /** Twitter API で返される user の name */
  twitter_user_name: string;
  /** Twitter API で返される user の username (display id) */
  twitter_user_username: string;
  /** Twitter API の access_token */
  access_token: string;
  /** Twitter API の refresh_token */
  refresh_token: string;
  /** ドキュメントの作成日時 */
  created_at: Timestamp;
};

export type TargetTweetDocRaw = {
  /** Twitter API で使用する tweet の id */
  tweet_id: string;
  /** tweet の作成日時 */
  tweeted_at: Timestamp;
  /** tweet のテキスト */
  text: string;
  /** 削除予定日時, 現仕様で tweeted_at の24時間後 */
  should_be_deleted_at: Timestamp;
  /** 削除されたことを示すフラグ */
  has_deleted: boolean;
};

export type Parse<T> = {
  [key in keyof T]: T[key] extends Timestamp ? Date : T[key];
};
