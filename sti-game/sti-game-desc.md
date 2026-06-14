🎨 SKETCH TO IMPRESS: Complete Game Description
Sketch to Impress is a fast-paced, multiplayer digital party game that brings a competitive, runway-style judging twist to traditional social drawing games. Built strictly for quick-access sessions with friends, the game scraps traditional guess-the-word mechanics and text chat logs. Instead, players are given a unified theme-based prompt to sketch, followed by an anonymous gallery viewing where everyone reviews and rates each masterpiece on a sliding scale from 1 to 10 stars.

🎮 Core Gameplay Mechanics
The game runs on a loop that balances private creative execution with public, interactive group review. By keeping the visual displays synchronized across all monitors, players experience the exact same creative milestones and hilarious art reveals at the identical split-second.

🏠 The Staging Lobby
The experience kicks off in a unified staging room. One player acts as the host, possessing the administrative controls to dial in the match constraints, while friends join the group via a quick 6-character uppercase alphanumeric room access code (e.g., B7X9Q2).

Dynamic Setting Toggles: The host can swap game constraints on the fly. Clicking an option alters the parameters instantly on every guest screen, ensuring everyone is aligned on the rules before launching.

Draw Timer: Options for 60 seconds, 90 seconds, or 120 seconds to tailor the creative pressure.

Match Length: Sets the pacing at 1 Round, 3 Rounds, or 5 Rounds before crowning the champion.

Prompts Theme: Loads specialized vocabulary libraries including Anime, Cartoon, Gaming, or a totally chaotic Random assortment.

🖌️ Phase 1: The Studio (Drawing)
When the match begins, the staging area slips away, and every user lands inside their own isolated drawing studio.

The Shared Word: A single secret word or phrase matching the chosen theme lights up at the top of every screen (e.g., Theme: Cartoon | Prompt: "SpongeBob working a 9-to-5"). The system utilizes a `USED_PROMPTS(roomCode)` set in Redis to ensure no duplicate prompts are selected during the session.

The Silent Workspace: Everyone draws simultaneously on their private canvas. To prevent players from giving away their ideas or ruining the visual punchline, the chatbox is completely disabled. No text, no hints, no spoilers.

The Toolkit: Players manipulate their ideas using a responsive, uncluttered art dock containing a Paintbrush, a Paint Bucket Fill tool, an Eraser, a brush-size slider, a color grid, and a quick-action Undo/Redo buffer to smooth out mistakes.

🖼️ Phase 2: The Gallery (Anonymized Voting)
The moment the countdown clock strikes zero, all paint inputs freeze. The backend shuffles the collected canvases randomly to hide who drew what, transitioning the entire party into the exhibition phase.

The Show: One by one, each drawing takes center stage on a massive central easel for exactly 12 seconds. Gallery clients reconstruct the artwork by replaying the stored vector strokes.

Empty Gallery Protection: To prevent game freezes, the server checks if any drawings were submitted. If 0 drawings are found, the gallery phase is skipped, and the party advances directly to the `ROUND_RESULTS` screen.

Early Gallery Advance Optimization: To maintain a high-energy pace, the server monitors incoming ratings in real-time. By tracking both `eligibleVoters` (all players except the artist) and `completedVoters`, the server can immediately advance to the next artwork once the threshold is met, even if players disconnect mid-gallery.

Gallery Disconnect Recalculation: If a player disconnects during voting, the server instantly recalculates the eligible voter count and completion threshold.

The Rating Bar: Positioned directly underneath the artwork is a sleek row of 10 stars. To vote, players tap a number. If a drawing is a solid 7, hitting the 7th star fills the entire bar from 1 through 7 with a bright, glowing neon flare.

Vote Idempotency: To ensure fairness, the system records who has voted for each drawing in Redis. A player may only vote once per drawing.

The Integrity Shield: To keep things perfectly fair, you cannot vote on your own artwork. When your drawing slides onto the main stage, your star dock turns translucent, locks down your inputs, and flashes a "Your Turn - Voting Locked" alert.

🏆 Phase 3: The Cumulative Scoreboard & Finale
The Multi-Round Ladder (ROUND_RESULTS): If the host opted for a 3-round or 5-round marathon, a brief 5-second leaderboard pops up after the last drawing of a round is graded. This keeps the competitive fire burning, allowing lagging players to regroup and strategize a comeback for the next round's prompt.

The Final Standings (FINAL_RESULTS): Every single star given by a friend translates directly to 1 point on the leaderboard. The math simply tracks the overall summation of stars collected across every active round.

The Final Round Climax:
When the final round finishes its gallery voting window, the server immediately calculates the final rankings using accumulated stars from all completed rounds.

The Text-Only Podium:
The final screen is intentionally lightweight and contains no artwork.

Players are ranked purely by total stars earned throughout the match.

The podium reveals:

🥇 First Place
🥈 Second Place
🥉 Third Place

along with total stars collected.

This approach allows the backend to aggressively purge all vector stroke data the exact moment voting ends, preserving the system's zero-baseline memory footprint via the `CleanupService`.

The Clean Reset: A large "Play Again" button populates on the host's screen. Pressing it loops the entire party right back into the main lobby workspace. The current group roster is preserved, but all competitive state is wiped: the backend utilizes an atomic Redis transaction pipeline (`MULTI / EXEC`) to completely flush and rewrite the `LEADERBOARD`, prompt history, and submission sets back to `0` for all players *before* updating the room status back to `LOBBY`.


🏗️ Core System Architecture
1. The Gateway Layer (Stage 1 Entry)
Protocol: Standard HTTP REST (POST requests).

Purpose: Validates room states and checks lobby limits (max 8 players) before giving clients access to the main servers. Standardized 6-character uppercase alphanumeric room codes ensure secure and predictable access.

2. The Persistent Stream Layer (Stages 2–5 Gameplay)
Protocol: WebSockets via Socket.io (ws:// channels).

Purpose: Syncs lobby options, drives match round clocks, manages anonymous gallery rotations, and streams final text-only podium rankings instantly based on the explicit `RoomStatus` state machine (`LOBBY`, `DRAWING`, `GALLERY`, `ROUND_RESULTS`, `FINAL_RESULTS`). All events are versioned with a `v1:` prefix for future-proofing. This layer includes a robust Reconnection State Synchronization mechanism and strong authentication requiring a roomCode, playerId, and signed reconnect token.

3. The Ephemeral Data Pipeline (Storage Optimization)
Protocol: Volatile In-Memory Storage via Redis.

Purpose: Temporarily caches vector stroke arrays during active gallery showcases. Redis stores only the stroke data (tool, color, size, points). The system uses Redis pipelines for multi-key operations and a centralized `touchRoom(roomCode)` wrapper for TTL refreshes. All data is managed by a dedicated `CleanupService`.

📦 Detailed Stack Components
🖥️ Frontend Client (Next.js Application)
Core Framework: Next.js (v14+ App Router) running standard React components.

WebSocket Client Engine: socket.io-client

Why: Matches seamlessly with the NestJS server engine. It includes auto-reconnect workflows that utilize server-side Reconnection State Synchronization to restore the player's game context (timers, prompts, active drawings) after drops.

Drawing Sandbox Engine: Native HTML5 Canvas API

Why: Zero dependencies. It captures mouse/touch points and packages them as vector strokes. The frontend stores these strokes and submits them as a JSON payload, enabling features like easy Undo/Redo and faster cleanup.

State Machine Management: Zustand

Why: High-speed, minimal boilerplate state engine. It swaps layouts effortlessly based on incoming versioned socket commands (`v1:game:round_started`, etc.).

Styling & Fluid Polish: Tailwind CSS + Framer Motion

Why: Tailwind handles rapid UI coding for responsive screens. Framer Motion provides physics-driven transitions for reveals and UI feedback.

⚙️ Backend Server (NestJS Application)
Core API Framework: NestJS (v10+) built entirely with TypeScript.

Real-time Streaming Engine: @nestjs/websockets + @nestjs/platform-socket.io

Why: Simplifies backend messaging. It partitions connected screens into secure channels. The backend acts as the sole authority for Server-Owned Timers (`roundStartTimestamp`, `roundEndTimestamp`, etc.), Early Gallery Advance logic, and Gallery Disconnect Recalculation. Identity is strictly derived from socket metadata and signed tokens. Internal decoupling is handled by a Server-side Event Bus (`@nestjs/event-emitter`).

Volatile In-Memory Engine: ioredis + @nestjs/cache-manager

Why: Connects directly to Redis in RAM. It scales effortlessly and guarantees instantaneous executions of memory-cleaning commands via the `CleanupService`.

Data Validation Gatekeepers: class-validator + class-transformer

Why: Automatically blocks malicious or malformed packets via Full DTO Validation. All payloads are strictly validated using `@IsString()`, `@IsArray()`, `@Length()`, and `@Matches()`.

💾 High-Speed Infrastructure (Database & Cache)
Volatile Caching: Redis (Self-hosted via Docker locally, or hosted on AWS ElastiCache / Redis Labs in production).

Why: Your application never touches a disk-bound database for canvas assets. Storing vector strokes purely in RAM yields sub-millisecond response times and minimizes memory overhead.

Production Process Monitor: PM2 (or Docker containers)

Why: Ensures your Node.js application process restarts immediately if it hits an unexpected error, keeping your active lobbies running smoothly.

🖥️ User Experience & Viewport Interfaces
1. Main Landing Menu
A simple layout designed to segment players smoothly into Host or Guest tracks.

+-------------------------------------------------------------+
|                      SKETCH TO IMPRESS                      |
+-------------------------------------------------------------+
|                                                             |
|   [ CREATE A LOBBY ] <--- (Generates Code & Host Controls)  |
|                                                             |
|   - OR -                                                    |
|                                                             |
|   Enter Your Name: [ SwagMaster__________ ]                 |
|                                                             |
|   Enter Room Code: [ B 7 X 9 Q 2 ]                          |
|                                                             |
|   [ JOIN LOBBY ]                                            |
|                                                             |
+-------------------------------------------------------------+

2. Synchronized Lobby Rooms
The host modifies the game settings dynamically on the left while guests view the locked selections on the right.

HOST VIEW (Active Controls)            GUEST VIEW (Locked Sync)
+-------------------------------+      +-------------------------------+
| LOBBY CODE: [ B7X9Q2 ]        |      | LOBBY CODE: [ B7X9Q2 ]        |
+-------------------------------+      +-------------------------------+
| PLAYERS     | HOST SETTINGS   |      | PLAYERS     | VIEW SETTINGS   |
| 1. Host     | TIMER: [90s]    |      | 1. Host     | TIMER:  90s     |
| 2. Guest    | ROUNDS:[3]      |      | 2. Guest(You| ROUNDS: 3       |
| 3. Friend   | THEME: [Cartoon]|      | 3. Friend   | THEME:  Cartoon |
+-------------------------------+      +-------------------------------+
|                [ START GAME ] |      |       [ WAITING FOR HOST... ] |
+-------------------------------+      +-------------------------------+

3. The Studio Workspace
An isolated drawing interface stripped of chat logs to emphasize pure visual production.

+-------------------------------------------------------------+
|  [Timer: 01:24]           THEME: CARTOON  |  PROMPT: "GOKU" |
+-------------------------------------------------------------+
|  [COLORS]   |                                               |
|  +-------+  |                                               |
|  | # # # |  |                                               |
|  | # # # |  |                 DRAWING CANVAS                |
|  +-------+  |                                               |
|  [TOOLS]    |                                               |
|  [ Brush ]  |             (Isolated Creative Space)         |
|  [ Fill  ]  |                                               |
|  [Eraser ]  |                                               |
|             |                                               |
|  Size: [==] |                                               |
+-------------------------------------------------------------+
| [ Undo ] [ Redo ]                                           |
+-------------------------------------------------------------+

4. The Gallery Exhibition
The interactive grading stage. The artist's profile remains masked until the end-of-game tallies.

+-------------------------------------------------------------+
|  VOTING: [ Entry 2 of 5 ]                    Time Left: 09s |
+-------------------------------------------------------------+
|                                                             |
|                         THE DRAWING                         |
|                      (Identity Hidden)                      |
|                                                             |
+-------------------------------------------------------------+
|      🔥   🔥   🔥   🔥   🔥   🔥   🔥   ⭐   ⭐   ⭐      |
|     ( 1    2    3    4    5    6    7    8    9    10 )     |
+-------------------------------------------------------------+
| *Artist Panel Status*: [ YOUR DRAWING - VOTING LOCKED ]     |
+-------------------------------------------------------------+

5. The Grand Finale Podiums
The end-game summary viewport mapping total star weights across all rounds onto a 3-tier presentation block.

+-------------------------------------------------------------+
|                        FINAL RESULTS                        |
+-------------------------------------------------------------+
|                                                             |
|                         🥇 1st Place                        |
|                          DoodleBob                          |
|                           [⭐ 110]                          |
|                         +-----------+                       |
|          🥈 2nd Place   |           |                       |
|           Sketchy_Cat   |           |       🥉 3rd Place    |
|            [⭐ 102]     |           |        PlayerOne      |
|         +-----------+   |           |         [⭐ 72]       |
|         |           |   |           |      +-----------+    |
|         |           |   |           |      |           |    |
|         |___________|   |___________|      |___________|    |
|         |  PODIUM   |   |  PODIUM   |      |  PODIUM   |    |
|         +-----------+   +-----------+      +-----------+    |
+-------------------------------------------------------------+
|  [4th] SwagMaster (⭐ 55)                  [ PLAY AGAIN ]   |
+-------------------------------------------------------------+

🚀 Production Guardrails & Launch Readiness Criteria
All code patterns, utility files, module layouts, and state transitions across both boundaries of the architecture must natively incorporate these production-ready operational constraints.

1. 🛡️ Must Have Before Launch
A. High-Velocity Rate Limiting (Throttler Engine & Gateway Guardrails)
REST Endpoints: Protect the HTTP boundary using a centralized Throttler module backed by an in-memory Redis storage driver. Restrict POST /api/v1/rooms/create and POST /api/v1/rooms/join to a hard ceiling of 5 requests per 60 seconds per IP address to block automated brute-force room token scanning and credential stuffing.

WebSocket Gateway: Throttle continuous inbound user events (especially high-volume vectors like v1:canvas:submit_drawing and point actions like v1:vote:cast_stars) to a maximum threshold of 20 frames per 10 seconds per client socket connection.

Violation Strategy: Sockets breaching this threshold must be disconnected instantly by the server layer after being served an explicit, strongly typed structural JSON exception frame:

JSON
{ "success": false, "code": "error:rate_limited", "message": "Rate limit exceeded. Connection terminated." }
B. 🔑 Strongly Typed Redis Key Schema Matrix (Versioned)
To ensure isolation and prevent memory leakage, all keys written to the data layer must be versioned with the namespace prefix sti:v1: and handled through a dedicated REDIS_KEYS factory mapping. The absolute path constraints are:

Room Metadata Hash: sti:v1:room:{roomCode}:meta (Tracks core configuration fields: hostId, roomCode, createdTime)

Room Players Hash Matrix: sti:v1:room:{roomCode}:players (Maps structural player identifiers directly to nested metadata strings)

Room State Hash: sti:v1:room:{roomCode}:state (Maintains active lifecycle keys: status, currentRound, activePrompt)

Game Start Lock (Atomic): sti:v1:room:{roomCode}:game-start-lock (Used via SETNX to avoid duplicate match spins)

Transition Lock (Atomic): sti:v1:room:{roomCode}:round-transition-lock (Guards high-concurrency phase switches)

Round State Hash: sti:v1:room:{roomCode}:round:{roundNumber}:state (Tracks metrics bound to the current run)

Submission Tracker Set: sti:v1:room:{roomCode}:round:{roundNumber}:submitted (A Redis set storing playerIds who finished sketching)

Submission Lock (Atomic ID): sti:v1:player:{playerId}:submitted (Prevents multi-submits or payload overwrites within a round)

Leaderboard Sorted Set/Hash: sti:v1:room:{roomCode}:leaderboard (Maintains atomic score weights for the podium)

Prompt History Set: sti:v1:room:{roomCode}:used-prompts (Tracks allocated strings to guarantee random, unique prompts across rounds)

Active Drawing Storage Hash: sti:v1:room:{roomCode}:round:{roundNumber}:drawings (Stores raw serialized drawing payload structures)

Active Vote Matrix Voters Set: sti:v1:room:{roomCode}:round:{roundNumber}:drawing:{drawingId}:voters (Ensures voting idempotency)

C. 🪵 Structured JSON Logging Matrix
Engine Implementation: Inherit and extend the native NestJS Logger class.

Format Architecture: Direct console.log statements are strictly forbidden. All output pipes must emit structured JSON objects detailing execution scope, runtime events, system metadata, tracking targets, and ISO timestamps.

Payload Sanitation: Interceptors must scrub raw vector stroke coordinate datasets (strokes[].points) from log streams prior to reaching standard output to prevent memory exhaustion and log-disk thrashing.

D. 🪤 Unified Exception Filters & Full DTO Validation
Boundary Catchers: Enforce a global HttpExceptionFilter and a mirror-matched WsExceptionFilter to parse incoming anomalies into uniform, standardized contract frames.

Strict Runtime Type Checking: Every incoming network block must map to an explicit Data Transfer Object (DTO) fortified with class-validator decorators (@IsString(), @IsArray(), @Length(), @Matches()).

Validation Failure Payload: Structural anomalies caught during pipeline validation must bypass generic system stacks and output a direct, client-readable error object:

JSON
{ "success": false, "code": "BAD_REQUEST", "message": "Validation failed: [Explicit field validation failure message context]" }
E. 🚷 Gateway Guards & Strong Authentication Handshake
Administrative Protection: Secure critical infrastructure calls (such as v1:host:update_settings or v1:host:start_game) behind a dedicated GatewayGuard layer that matches the processing socket's playerId against the verified hostId inside ROOM_META.

Handshake Parameters: The initial WebSocket handshake must reject any connection that fails to provide a valid roomCode, playerId, and a cryptographically signed reconnect token (JWT).

F. 🐳 Containerized Infrastructure (Docker Compose)
Configuration Target: Maintain a production-parity local environment layout using Docker Compose.

Redis Performance Tunings: To optimize memory allocations for volatile, short-lived game state changes, spin up the cache container with persistent file synchronization turned off:

Bash

redis-server --appendonly no --save "" --maxmemory 512mb --maxmemory-policy allkeys-lru
G. 🧹 Dedicated Cleanup & Room Eviction
CleanupService Management: Centralize memory lifecycle tasks into three clear automation paths: cleanupRound() (purges heavy vector lines from completed rounds), cleanupMatch() (resets boards, player standings, and room statuses back to empty defaults), and cleanupRoom() (wipes the entire Redis key footprint for a room code).

Zero-Passenger Eviction: If room disconnect monitors or heartbeat drops reduce the member array length to zero, cleanupRoom() must execute immediately to free system resources.

H. Redis TTL Refresh & Pipeline Batching
touchRoom(roomCode) Command: Implement a uniform method within the repository layer that acts as a single point of responsibility for applying a fresh 2-hour (7,200 seconds) sliding expiration across all keys associated with a given room code.

Pipeline Integration: Multi-key operations, score increments, and multi-stage status changes must execute within native atomic Redis transactions (.pipeline() or MULTI/EXEC blocks) to compress roundtrip times and eliminate race conditions.

I. Server-Owned Clock & Timers
Synchronization Rule: The backend application engine retains sole authority over time calculations.

Storage Execution: Dynamic epoch calculations (roundStartTimestamp, roundEndTimestamp, galleryEndTimestamp) are written directly to Redis when changing stages. Clients must read these absolute timestamps to calculate their local UI countdown displays, rendering client-side timer drift impossible.

J. Temporary Disconnect Recovery & Delayed Host Migration
Heartbeat Mechanics: Configure real-time socket connections with tight timeouts (pingInterval: 25000, pingTimeout: 20000) to quickly identify dead sockets.

The Grace Window: Provide players with an exact 30,000ms (30 seconds) window to complete a reconnection handshake before dropping them from the match framework.

Delayed Host Migration: If the host drops connection and fails to recover within the 30-second window, the system must update ROOM_META, pick the next oldest active socket connection, and broadcast the change:

TypeScript
this.server.to(roomCode).emit('v1:room:host_changed', { roomCode, newHostId });
Snapshot Recovery Payload: Reconnecting sockets passing validation during active gameplay bypass standard room initialization paths. They receive a full state snapshot (v1:player:reconnected) containing status, currentRound, totalRounds, activePrompt, galleryEndTimestamp, and current scoreboard states.

K. Vector Stroke Storage & Validation
Storage Constraints: Redis memory is dedicated solely to storing drawing paths. Payloads sent to v1:canvas:submit_drawing must match the flat DrawingStroke layout structure:

TypeScript
{ points: number[]; color: string; brushSize: number; }
Identity Injection: The server must ignore any user-supplied author IDs inside incoming drawing arrays. The saving routine must explicitly bind ownership using the verified playerId extracted from the socket's connection data (client.data.playerId).

L. Suspicious Join Attempt Detection
Brute-Force Interception: Track failed validation entries and invalid room code attempts against a sliding window grouped by origin IP addresses.

Blacklist Punishment: IPs that hit a threshold of 10 failed attempts within 3 minutes must trigger a 15-minute lockout, causing the REST layer to reject further access attempts with an immediate HTTP 429 Too Many Requests error response.

M. Centralized Game & Security Constants
Single Source of Truth: Game configurations must not be hardcoded across dynamic components or service files. Consolidate core properties inside src/game/constants/game.constants.ts.

Target Values: Maintain fixed controls including MAX_PLAYERS = 8, RECONNECT_GRACE_SECONDS = 30, and MAX_ST_PAYLOAD_BYTES = 1048576 (1MB limit for incoming canvas vector streams).

N. Server-Side Event Bus Architecture
System Decoupling: Enforce separation of concerns between raw packet ingestion and game engine states. The WebSocket gateway must focus on incoming data validation and pass approved inputs to the processing layers using @nestjs/event-emitter.

Core Handlers: Decouple key events like PLAYER_JOINED, ROUND_STARTED, CANVAS_SUBMITTED, and HOST_MIGRATED from the gateway's direct network management tasks.

2. 🧪 Good to Have (Testing Infrastructure)
A. Granular Unit Tests
Deterministic Isolation: Maintain high-coverage, mock-free unit tests isolated from the database and networking layers.

Target Targets: Validate core utility operations, such as the 6-character unique uppercase alphanumeric room code generator, internal payload compression functions, score-weight calculation models, and time-drift adjustment algorithms.

B. End-to-End (E2E) Test Suite
Verify whole-system compliance by orchestrating programmatic client simulations across full match lifecycles. Scripted scenarios must validate:

Lobby & Match Start Flow: Verifies room creation, guest entry, settings updates, and the transition into the drawing phase once the start command is issued.

Host Recovery Loop: Simulates a host disconnecting during active sketching and successfully reconnecting within the 30-second window to restore state.

Host Migration Trigger: Confirms that when a host disconnects and remains offline past the 30-second window, administrative privileges successfully migrate to the next available user.

Vote/Submit Idempotency: Simulates race conditions where clients send multiple drawing uploads or vote submissons simultaneously, verifying that the server correctly drops duplicate entries.

Session Termination: Ensures that when the final socket disconnects, the system runs a zero-passenger audit and executes cleanupRoom(), completely removing all room keys from Redis.