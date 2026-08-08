import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { artists } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat/$conversationId")({
  head: () => ({
    meta: [
      { title: "Chat | Glowlist" },
      {
        name: "description",
        content: "Message your makeup artist about timings, looks and travel before the big day.",
      },
      { property: "og:title", content: "Chat | Glowlist" },
      {
        property: "og:description",
        content: "Message your artist about timings, looks and travel.",
      },
    ],
  }),
  component: ChatPage,
});

const messages = [
  { id: "m1", mine: false, text: "Hi Ishita! Excited for the 22nd 💐", time: "09:12" },
  { id: "m2", mine: true, text: "Same! Can you reach by 6:30am?", time: "09:14" },
  { id: "m3", mine: false, text: "Yes, I'll be there by 6:15 to set up.", time: "09:15" },
  { id: "m4", mine: true, text: "Perfect. Sending my outfit photos tonight.", time: "09:16" },
];

function ChatPage() {
  const { conversationId } = Route.useParams();
  const artist = artists.find((a) => a.id === conversationId) ?? artists[0]!;

  return (
    <AppShell title={artist.name} subtitle="Usually replies within an hour">
      <div className="flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
              m.mine
                ? "self-end bg-primary text-primary-foreground"
                : "self-start border bg-card",
            )}
          >
            {m.text}
            <span
              className={cn(
                "mt-1 block text-[0.6rem]",
                m.mine ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {m.time}
            </span>
          </div>
        ))}
      </div>

      <div className="sticky bottom-2 mt-6 flex items-center gap-2 rounded-full border bg-card p-1.5 shadow-soft">
        <input
          placeholder="Write a message"
          className="flex-1 bg-transparent px-3 text-sm outline-none"
        />
        <button
          aria-label="Send message"
          className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <Send className="size-4" />
        </button>
      </div>
    </AppShell>
  );
}
