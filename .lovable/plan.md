# Sketch to Impress — Full Frontend Plan

## Goal
Build the complete six-stage party-game client against the supplied REST and Socket.io contracts, adapting the attached Next.js-oriented architecture to the existing TanStack Start project without changing the backend protocol.

## 1. Foundation and visual system
- Replace the placeholder home screen with the game experience.
- Add `socket.io-client`, Zustand, and Motion for React.
- Create an original pixel-arcade design system using sky blue, coin yellow, coral red, and arcade green, with sharp pixel borders, offset shadows, playful display type, and responsive layouts.
- Add accessible focus, reduced-motion, touch sizing, high-contrast states, and game-specific page metadata.
- Use CSS-built pixel scenery and iconography rather than copyrighted characters or branded game assets.

## 2. Typed client architecture
- Define strict types for credentials, players, room settings, phases, strokes, gallery entries, acknowledgements, and standings.
- Build a validated REST client for:
  - `POST /api/v1/rooms/create`
  - `POST /api/v1/rooms/join`
- Build one Socket.io client bound to the backend HTTP server and `/game` namespace if required by the gateway contract.
- Configure backend URLs through Vite client environment values, defaulting to `http://localhost:3000` for local development.
- Normalize minor naming inconsistencies in the documents by listening to the canonical endpoint events plus documented aliases where safe.

## 3. Session and real-time state
- Store only the issued room code, player ID, username, host ID, and reconnect token in `sessionStorage` so refreshes can recover the active room.
- Create Zustand slices for room/game state and local drawing state.
- Centralize socket listener registration and cleanup to prevent duplicate handlers.
- Apply server snapshots, host migration, roster/settings updates, phase changes, timers, gallery entries, round results, and final standings to the store.
- Show a full-screen reconnecting state and restore the current phase from `v1:player:reconnected`; show a recoverable error and return-home action if recovery expires.

## 4. Gateway route
- Build the responsive create/join screen with:
  - host username input and **Create Lobby** action
  - guest username input
  - six-cell room-code entry
  - uppercase filtering and exclusion of `0/O/1/I`
  - 3–20 character username validation
  - loading, rate-limit, room-full, invalid-room, and network error feedback
- On success, persist credentials and navigate with TanStack Router to `/room/$roomCode`.

## 5. Room game shell and lobby
- Add the typed dynamic room route and mount the socket lifecycle there.
- Render each game viewport from the server-owned phase state.
- Lobby features:
  - room code and copy affordance
  - live roster up to eight players with host/current-player/connection states
  - host-only timer (60/90/120), rounds (1/3/5), and theme controls
  - locked synchronized guest view
  - host-only start action and waiting state for guests
  - host migration updates without reload

## 6. Drawing studio
- Implement a native HTML canvas supporting mouse, touch, and pen input.
- Capture backend-compatible vector strokes with points, color, and brush size.
- Add brush, eraser, fill, color palette, brush-size control, undo, redo, clear, and submit.
- Keep history outside React’s high-frequency render path.
- Scale pointer coordinates consistently across responsive canvas sizes.
- Use the server timestamp offset for an authoritative countdown; pulse/shake below ten seconds.
- Freeze editing after acknowledgement and auto-submit when time expires.

## 7. Anonymous gallery voting
- Reconstruct incoming vectors on a responsive read-only showcase canvas.
- Display gallery position and server-authoritative voting countdown.
- Add a tactile 1–10 rating rail with filled preview and one-time submission lock.
- Handle self-vote rejection/locked state without exposing artist identity.
- Reset local voting state for every `v1:gallery:next_canvas` event and support early server-driven advancement.

## 8. Results and replay
- Build a short intermediate round leaderboard driven by `round_results_started`, then follow the server into the next round.
- Build final text-only standings with animated top-three pixel podiums and a runner-up list.
- Show **Play Again** only to the current host and emit `v1:host:trigger_play_again`.
- On return to `LOBBY`, clear drawings, votes, timers, and standings while preserving room credentials and roster.

## 9. Reliability and verification
- Add bounded payload checks before rendering/submitting strokes and friendly handling for malformed acknowledgements or server error frames.
- Prevent duplicate creates, joins, drawing submissions, votes, and play-again actions while requests are pending.
- Verify route navigation, form validation, canvas pointer behavior, undo/redo, timer calculations, phase rendering, socket cleanup, reconnect restoration, and responsive desktop/mobile layouts.
- Keep a clear disconnected state in the hosted preview: an HTTPS preview cannot normally connect to an insecure `http://localhost:3000` backend, while the complete integration will work when this frontend and the NestJS server are run locally (or once HTTPS production API/socket URLs are supplied).

## Technical adaptation
- The attached docs reference Next.js, but this repository is TanStack Start. The same screens and contracts will be implemented with TanStack file routes (`/` and `/room/$roomCode`) and existing Tailwind v4 conventions.
- No new database or application backend will be added; the existing NestJS/Redis service remains authoritative for rooms, timing, scores, and reconnection.