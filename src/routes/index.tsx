import { createFileRoute } from "@tanstack/react-router";
import { Gateway } from "@/components/game/Gateway";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sketch to Impress — Multiplayer Drawing Game" },
      { name: "description", content: "Create a room, sketch wild prompts, rate anonymous art, and climb the podium with friends." },
      { property: "og:title", content: "Sketch to Impress — Multiplayer Drawing Game" },
      { property: "og:description", content: "Sketch wild prompts, rate anonymous art, and climb the podium with friends." },
    ],
  }),
  component: Index,
});

function Index() {
  return <Gateway />;
}
