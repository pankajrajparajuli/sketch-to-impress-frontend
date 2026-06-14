import { createFileRoute } from "@tanstack/react-router";
import { RoomGame } from "@/components/game/RoomGame";

export const Route = createFileRoute("/room/$roomCode")({
  head: ({ params }) => ({ meta: [
    { title: `Room ${params.roomCode} — Sketch to Impress` },
    { name: "description", content: "A live Sketch to Impress multiplayer game room." },
    { property: "og:title", content: "Sketch to Impress Game Room" },
    { property: "og:description", content: "Join friends for a fast, anonymous drawing showdown." },
  ] }),
  component: Room,
});

function Room() { const { roomCode } = Route.useParams(); return <RoomGame roomCode={roomCode} />; }