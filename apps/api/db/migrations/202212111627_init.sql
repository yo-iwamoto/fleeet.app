-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "twitter_user_id" TEXT NOT NULL,
    "twitter_user_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "twitter_access_tokens" (
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    CONSTRAINT "twitter_access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "target_tweets" (
    "tweet_id" TEXT NOT NULL,
    "should_be_deleted_at" DATETIME NOT NULL,
    "has_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "target_tweets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_twitter_user_id_key" ON "users"("twitter_user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_twitter_user_name_key" ON "users"("twitter_user_name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "twitter_access_tokens_user_id_key" ON "twitter_access_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "target_tweets_tweet_id_key" ON "target_tweets"("tweet_id");
