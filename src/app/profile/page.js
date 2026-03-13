import { auth } from "@clerk/nextjs/server";
import { pool } from "@/lib/db";
import { saveProfile, addPost } from "../actions";
import Link from "next/link";
import Image from "next/image";
import * as Tabs from "@radix-ui/react-tabs";
import StartButton from "../../components/StartButton";
import { UserButton } from "@clerk/nextjs";
import PostControls from "./PostControls";
import RingCounter from "../../components/RingCounter";
import ProfileForm from "../../components/ProfileForm";

export const dynamic = "force-dynamic";

const tabBtnClass =
  "relative w-10 h-10 flex items-center justify-center text-[12px] rounded-full font-black uppercase italic border-2 transition-all duration-150 data-[state=active]:bg-[#A82B61] data-[state=active]:text-white data-[state=inactive]:bg-[#6B6D74]/40 data-[state=inactive]:text-[#C4C1C0] border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.5)] active:translate-y-[2px]";
const magentaBtnClass =
  "relative bg-[#A82B61] text-white rounded-full font-black uppercase italic tracking-tighter border-2 border-[#5e133a] shadow-[0_6px_0_#222] active:translate-y-[4px] active:shadow-[0_2px_0_#000] transition-all disabled:opacity-50 disabled:grayscale mb-2";
const fieldTitleClass =
  "text-[10px] font-black text-black/40 italic uppercase tracking-widest mb-1 block ml-1";

export default async function ProfilePage() {
  const { userId } = await auth();

  const [profileRes, postsRes] = await Promise.all([
    pool.query("SELECT * FROM profiles WHERE clerk_id = $1", [userId]),
    pool.query(
      `SELECT 
        posts.*, 
        profiles.username, 
        profiles.avatar_url 
       FROM posts 
       INNER JOIN profiles ON posts.clerk_id = profiles.clerk_id
       WHERE posts.clerk_id = $1 
       ORDER BY posts.created_at DESC`,
      [userId],
    ),
  ]).catch(() => [{ rows: [] }, { rows: [] }]);

  const profile = profileRes.rows?.[0] || {};
  const posts = postsRes.rows || [];

  // Single Source of Truth from DB
  const ringCount = profile.ring_count || 0;
  const isProfileComplete = !!profile.username?.trim();

  // Forces form reset on DB update
  const profileResetKey = `profile-${userId}-${profile.username || "empty"}-${profile.bio || "empty"}`;

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center font-sans antialiased"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/background.jpg')",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pixel-wipe {
          0% { clip-path: inset(0 100% 0 0); transform: translateX(-10px); }
          100% { clip-path: inset(0 0 0 0); transform: translateX(0); }
        }
        .animate-zone-transition {
          animation: pixel-wipe 0.2s steps(4) forwards;
        }
      `,
        }}
      />

      <nav className="bg-[#0054B4] border-b-4 border-blue-900 p-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-4 group shrink-0">
            <div className="relative w-11.5 h-11.5 -my-1">
              <Image
                src="/sonic-icon.png"
                alt="Sonic"
                fill
                sizes="46px"
                className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight text-white uppercase italic font-black">
              <span className="text-2xl tracking-tighter">Sonic</span>
              <span className="text-blue-200 text-[10px] tracking-[0.3em] ml-1">
                Social
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <RingCounter ringCount={ringCount} />
            <div className="flex items-center shrink-0">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-6 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <Tabs.Root defaultValue="new-post" suppressHydrationWarning>
            <div className="relative rounded-[28px] border-4 border-black/10 shadow-2xl bg-[#C4C1C0] w-full h-103.75 flex flex-col overflow-hidden">
              <div className="absolute top-4 left-4 flex flex-col items-center gap-0.5 z-20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_5px_red] animate-pulse" />
                <span className="text-[6px] font-black text-red-800 uppercase tracking-tighter">
                  BATT
                </span>
              </div>

              <div className="p-2 pb-0">
                <div className="pt-2 rounded-t-lg bg-[#6B6D74] border-b-2 border-black/20 px-4">
                  <div className="text-center pb-1">
                    <span className="text-[5px] font-black tracking-widest text-[#C4C1C0] uppercase opacity-40 italic">
                      Dot Matrix Display
                    </span>
                  </div>

                  <div
                    className="relative p-3 rounded bg-[#8bac0f] border-2 border-black/40 ring-4 ring-inset ring-black/20 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] h-43.75 overflow-y-auto scrollbar-hide font-['VT323',monospace]"
                    suppressHydrationWarning
                  >
                    <Tabs.Content
                      value="new-post"
                      className="outline-none h-full data-[state=active]:animate-zone-transition"
                    >
                      {isProfileComplete ? (
                        <form
                          action={addPost}
                          id="post-form"
                          className="h-full flex flex-col"
                        >
                          <textarea
                            name="content"
                            required
                            placeholder="TYPE A MESSAGE..."
                            className="w-full p-2 border-2 border-black/10 rounded bg-[#9bbc0f] text-xl text-[#0f380f] placeholder:text-[#0f380f]/50 mb-1 focus:outline-none resize-none grow"
                          />
                          <div className="flex flex-col items-center mt-auto">
                            <div className="flex items-center gap-1 opacity-80 mb-1">
                              <img
                                src="/sonic-ring.gif"
                                className="w-3.5 h-3.5 object-contain"
                                alt="ring"
                              />
                              <span className="text-[14px] font-bold text-[#0f380f] uppercase tracking-tighter">
                                EARN 1 RING FOR EVERY POST MADE!
                              </span>
                            </div>
                            <span className={`${fieldTitleClass} text-center`}>
                              Press Post It
                            </span>
                          </div>
                        </form>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[#0f380f] text-center">
                          <p className="text-xl font-bold uppercase mb-1 leading-none">
                            Access Denied
                          </p>
                          <p className="text-[14px] uppercase leading-tight">
                            to be able to Post
                          </p>
                          <p className="text-[14px] uppercase leading-tight">
                            create a profile by pressing B
                          </p>
                          <p className="text-[12px] mt-1 opacity-80 uppercase leading-tight">
                            (and earn your 1st ring for doing so)
                          </p>
                          <div className="mt-4 animate-bounce text-2xl font-bold">
                            ↓
                          </div>
                        </div>
                      )}
                    </Tabs.Content>

                    <Tabs.Content
                      value="edit"
                      className="outline-none h-full data-[state=active]:animate-zone-transition"
                    >
                      <ProfileForm
                        key={profileResetKey}
                        initialData={profile}
                      />
                    </Tabs.Content>
                  </div>
                </div>
              </div>

              <div className="relative flex-1">
                <div className="absolute top-5 left-6 w-14 h-14 flex items-center justify-center opacity-70">
                  <div className="absolute w-full h-4 bg-[#333] rounded-sm" />
                  <div className="absolute w-4 h-full bg-[#333] rounded-sm" />
                  <div className="absolute w-2.5 h-2.5 bg-[#222] rounded-full z-10" />
                </div>

                <div className="absolute top-4 right-6 flex flex-col items-center">
                  <div className="flex gap-4 rotate-[-10deg] text-[7px] font-black text-black/30 italic uppercase mb-1">
                    <span className="w-10 text-center">PROFILE</span>
                    <span className="text-[7px] w-10 text-center">POST</span>
                  </div>
                  <Tabs.List className="flex gap-3 rotate-[-10deg]">
                    <Tabs.Trigger value="edit" className={tabBtnClass}>
                      B
                    </Tabs.Trigger>
                    <Tabs.Trigger value="new-post" className={tabBtnClass}>
                      A
                    </Tabs.Trigger>
                  </Tabs.List>
                </div>

                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1.5 px-4">
                  <Tabs.Content
                    value="new-post"
                    className="w-full"
                    suppressHydrationWarning
                  >
                    <StartButton
                      type="submit"
                      form="post-form"
                      disabled={!isProfileComplete}
                      className={`${magentaBtnClass} w-full py-2 uppercase text-[10px]`}
                    >
                      POST IT
                    </StartButton>
                  </Tabs.Content>
                  <Tabs.Content
                    value="edit"
                    className="w-full"
                    suppressHydrationWarning
                  >
                    <StartButton
                      type="submit"
                      form="profile-form"
                      className={`${magentaBtnClass} w-full py-2 uppercase text-[10px]`}
                    >
                      SAVE CHANGES
                    </StartButton>
                  </Tabs.Content>
                  <div className="flex gap-5 text-[6px] font-black text-black/20 italic uppercase tracking-[0.2em] mt-1">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-1.5 bg-[#999] rounded-full mb-0.5 shadow-inner rotate-[-25deg]" />{" "}
                      SELECT
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-1.5 bg-[#999] rounded-full mb-0.5 shadow-inner rotate-[-25deg]" />{" "}
                      START
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 flex gap-1.5 rotate-[-30deg] opacity-25 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-8 bg-black rounded-full shadow-[1px_1px_0_rgba(255,255,255,0.1)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Tabs.Root>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3 mb-2 ml-1">
            <div className="w-2 h-6 bg-[#FFE600] shadow-[2px_2px_0_#000]" />
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              Latest Feed
            </h2>
            <div className="grow h-1 bg-[#FFE600]" />
          </div>
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => <PostControls key={post.id} post={post} />)
            ) : (
              <p className="text-white italic opacity-50 text-center py-10 font-['VT323'] text-2xl uppercase tracking-tighter drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                No Posts found in this zone...
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
