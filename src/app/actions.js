"use server";

import { pool } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * ADDS A NEW POST
 * Rewards the user with 1 Ring and checks for Chaos Emerald milestones.
 */
export async function addPost(formData) {
  const { userId } = await auth();
  const content = formData.get("content");
  if (!userId || !content) return;

  try {
    // 1. Insert the post
    await pool.query("INSERT INTO posts (clerk_id, content) VALUES ($1, $2)", [
      userId,
      content,
    ]);

    // 2. REWARD: Add 1 Ring for the update
    await pool.query(
      "UPDATE profiles SET ring_count = COALESCE(ring_count, 0) + 1 WHERE clerk_id = $1",
      [userId],
    );

    // 3. MILESTONE: Check Post Count for Chaos Emeralds
    const postCountResult = await pool.query(
      "SELECT COUNT(*) FROM posts WHERE clerk_id = $1",
      [userId],
    );
    const postCount = parseInt(postCountResult.rows[0].count);

    let emeraldColor = "none";
    if (postCount >= 50) emeraldColor = "ultimate";
    else if (postCount >= 20) emeraldColor = "purple";
    else if (postCount >= 10) emeraldColor = "blue";
    else if (postCount >= 5) emeraldColor = "green";

    await pool.query(
      "UPDATE profiles SET emerald_status = $1 WHERE clerk_id = $2",
      [emeraldColor, userId],
    );

    revalidatePath("/profile");
  } catch (error) {
    console.error("Add Post Error:", error);
  }
}

/**
 * DELETES A POST
 * Implements "Fair Play": Deducts the initial Post Ring + any rings earned from Likes.
 */
export async function deletePost(postId) {
  const { userId } = await auth();
  if (!userId) return;

  try {
    const postData = await pool.query(
      "SELECT likes FROM posts WHERE id = $1 AND clerk_id = $2",
      [postId, userId],
    );

    if (postData.rows.length > 0) {
      const likesOnPost = parseInt(postData.rows[0].likes || 0);
      const totalToDeduct = 1 + likesOnPost;

      await pool.query(
        "UPDATE profiles SET ring_count = GREATEST(0, COALESCE(ring_count, 0) - $1) WHERE clerk_id = $2",
        [totalToDeduct, userId],
      );

      await pool.query("DELETE FROM posts WHERE id = $1 AND clerk_id = $2", [
        postId,
        userId,
      ]);
    }

    revalidatePath("/profile");
  } catch (error) {
    console.error("Delete Post Error:", error);
  }
}

/**
 * UPDATES POST CONTENT
 */
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

/**
 * SAVES PROFILE DATA
 * Syncs Clerk Avatar to Supabase and awards the Welcome Ring.
 */
export async function saveProfile(formData) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) return;

  const username = formData.get("username")?.toString().trim() || "";
  const bio = formData.get("bio")?.toString().trim() || "";
  const avatarUrl = user.imageUrl; // Grab the personal Clerk avatar URL

  try {
    // 1. Sync Clerk image into the avatar_url column
    await pool.query(
      `INSERT INTO profiles (clerk_id, username, bio, avatar_url, ring_count, welcome_ring_claimed) 
       VALUES ($1, $2, $3, $4, 0, FALSE) 
       ON CONFLICT (clerk_id) 
       DO UPDATE SET username = $2, bio = $3, avatar_url = $4`,
      [userId, username, bio, avatarUrl],
    );

    // 2. Check and Award Welcome Ring
    const status = await pool.query(
      "SELECT welcome_ring_claimed FROM profiles WHERE clerk_id = $1",
      [userId],
    );
    if (username.length > 0 && !status.rows[0]?.welcome_ring_claimed) {
      await pool.query(
        `UPDATE profiles 
         SET ring_count = COALESCE(ring_count, 0) + 1, 
             welcome_ring_claimed = TRUE 
         WHERE clerk_id = $1`,
        [userId],
      );
    }

    // 3. THE NUKE: Clear caches and hard redirect
    revalidatePath("/profile", "layout");
  } catch (error) {
    console.error("DATABASE ERROR:", error);
  }
  redirect("/profile");
}

/**
 * ADDS A LIKE
 * Prevents double-likes and rewards the author with 1 Ring.
 */
export async function addLike(postId) {
  const { userId } = await auth();
  if (!userId) return;
  const numericPostId = parseInt(postId);

  try {
    // 1. Log the like (Prevents double-likes via Unique Constraint)
    await pool.query(
      "INSERT INTO post_likes (post_id, clerk_id) VALUES ($1, $2)",
      [numericPostId, userId],
    );

    // 2. Increment Post Likes and get Author ID
    const result = await pool.query(
      "UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING likes, clerk_id",
      [numericPostId],
    );

    const authorId = result.rows[0].clerk_id;
    const currentLikes = parseInt(result.rows[0].likes);

    // 3. Reward Author 1 Ring
    await pool.query(
      "UPDATE profiles SET ring_count = COALESCE(ring_count, 0) + 1 WHERE clerk_id = $1",
      [authorId],
    );

    // 4. S-Rank Detection (Milestone: 10 Likes)
    if (currentLikes >= 10) {
      await pool.query("UPDATE posts SET is_s_rank = TRUE WHERE id = $1", [
        numericPostId,
      ]);
    }

    revalidatePath("/profile");
  } catch (error) {
    if (error.code === "23505") {
      console.log("Anti-cheat: Already liked.");
    } else {
      console.error("Like error:", error);
    }
  }
}
