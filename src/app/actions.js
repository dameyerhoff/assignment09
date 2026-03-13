"use server";
import { pool } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  const username = formData.get("username") || "";
  const bio = formData.get("bio") || "";

  if (!userId) return;

  try {
    // 1. Update or Insert the profile.
    await pool.query(
      `INSERT INTO profiles (clerk_id, username, bio, ring_count, welcome_ring_claimed) 
       VALUES ($1, $2, $3, 0, FALSE) 
       ON CONFLICT (clerk_id) 
       DO UPDATE SET username = $2, bio = $3`,
      [userId, username, bio],
    );

    // 2. Check the claim status
    const profileStatus = await pool.query(
      "SELECT welcome_ring_claimed FROM profiles WHERE clerk_id = $1",
      [userId],
    );

    const hasClaimed = profileStatus.rows[0]?.welcome_ring_claimed;

    // 3. Award the ring
    if (username.trim().length > 0 && !hasClaimed) {
      await pool.query(
        `UPDATE profiles 
          SET ring_count = COALESCE(ring_count, 0) + 1, 
              welcome_ring_claimed = TRUE 
          WHERE clerk_id = $1`,
        [userId],
      );
    }
  } catch (error) {
    console.error("Save Profile Error:", error);
    return;
  }

  // THE NUKE: We revalidate the entire layout and force a hard redirect.
  // This destroys the client-side cache that was holding onto your old "ghost" text.
  revalidatePath("/profile", "layout");
  redirect("/profile");
}

export async function addLike(postId) {
  const { userId } = await auth();
  if (!userId) return;
  const numericPostId = parseInt(postId);
  try {
    await pool.query(
      "INSERT INTO post_likes (post_id, clerk_id) VALUES ($1, $2)",
      [numericPostId, userId],
    );
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
