"use server";
import { pool } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addPost(formData) {
  const { userId } = await auth();
  const content = formData.get("content");
  if (!userId || !content) return;
  await pool.query("INSERT INTO posts (clerk_id, content) VALUES ($1, $2)", [
    userId,
    content,
  ]);
  revalidatePath("/profile");
}

export async function deletePost(postId) {
  const { userId } = await auth();
  if (!userId) return;
  await pool.query("DELETE FROM posts WHERE id = $1 AND clerk_id = $2", [
    postId,
    userId,
  ]);
  revalidatePath("/profile");
}

export async function updatePost(formData) {
  const { userId } = await auth();
  const postId = formData.get("postId");
  const content = formData.get("content");
  if (!userId || !postId || !content) return;
  await pool.query(
    "UPDATE posts SET content = $1 WHERE id = $2 AND clerk_id = $3",
    [content, postId, userId],
  );
  revalidatePath("/profile");
}

export async function saveProfile(formData) {
  const { userId } = await auth();
  const username = formData.get("username");
  const bio = formData.get("bio");
  if (!userId) return;
  await pool.query(
    "INSERT INTO profiles (clerk_id, username, bio) VALUES ($1, $2, $3) ON CONFLICT (clerk_id) DO UPDATE SET username = $2, bio = $3",
    [userId, username, bio],
  );
  revalidatePath("/profile");
}

export async function addLike(postId) {
  const { userId } = await auth();
  if (!userId) return;
  const numericPostId = parseInt(postId);
  try {
    // ANTI-CHEAT: Check junction table first
    await pool.query(
      "INSERT INTO post_likes (post_id, clerk_id) VALUES ($1, $2)",
      [numericPostId, userId],
    );
    // Only if the above succeeds, we increment the ring count
    await pool.query(
      "UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = $1",
      [numericPostId],
    );
    revalidatePath("/profile");
  } catch (error) {
    if (error.code === "23505") {
      console.log("Anti-cheat: User already liked this post.");
    } else {
      console.error("Like error:", error);
    }
  }
}
