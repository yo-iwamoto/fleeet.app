-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "twitter_user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "target_tweets" (
    "tweet_id" TEXT NOT NULL,
    "should_be_deleted_at" DATETIME NOT NULL,
    "has_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "target_tweets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_twitter_user_id_key" ON "users"("twitter_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "target_tweets_tweet_id_key" ON "target_tweets"("tweet_id");
