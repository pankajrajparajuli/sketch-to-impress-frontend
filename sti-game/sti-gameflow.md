[ STAGE 1: GATEWAY ] ──> [ STAGE 2: LOBBY ] ──> [ STAGE 3: DRAWING ] ──> [ STAGE 4: GALLERY ] ──> [ STAGE 5: ROUND_RESULTS ] ──> [ STAGE 6: FINAL_RESULTS ]
   Landing, Create &        Real-Time Rule     Synchronized                 Anonymous Show            Intermediate              Text-Only Podium &
    Join Validation            Sync Room         Private Sketch              & Light-Up Voting          Leaderboard              Final Results
    (HTTP REST API)         (WebSocket Connect)  (WebSocket Stream)         (WebSocket Server)          (Redis Purge)               (Global Purge)

🚪 Stage 1: The Gateway (Landing, Create & Join)
The initialization phase acts as a security and capacity gatekeeper.

The Occupancy Guard: The `POST /api/v1/rooms/join` and `/create` endpoints calculate total capacity by adding `Active Roster Count` and `Pending Reservations`. This prevents more than 8 players from obtaining tokens simultaneously.

Atomic Reservation: Successful validation triggers a temporary Redis reservation key (10s TTL) to lock the slot while the client transitions to the WebSocket connection.

The Handoff: The server issues a Player ID and a signed reconnect token.

🏠 Stage 2: The Synchronized Lobby
Clients connect via WebSockets with strong authentication. Upon connection, the pending reservation is cleared, and the player is added to the permanent roster.

Game Start Lock: A Redis `SETNX` lock prevents duplicate match initializations.

Host Migration: If a host disconnects, the server waits 30 seconds before migrating status to the next available player via `v1:room:host_changed`.

🖌️ Stage 3: The Creative Crucible (Drawing Phase)
Players sketch based on a prompt while the server-side clock (`roundEndTimestamp`) counts down.

Active Live-Voter Matrix: Phase transitions and synchronization rely on the **active live-voter matrix**. If a player disconnects, their drawing is preserved for the gallery, but their status is flagged as inactive.

🖼️ Stage 4: The Spotlight Rotation (Gallery & Voting Phase)
Synchronized 12-second viewing frames for each artwork.

Early Advance Optimization: The algorithm calculating `eligibleVoters` cross-references the live presence status. If a player disconnects (`connected: false`), the vote threshold for the current canvas is immediately dropped to prevent the gallery from hanging.

Voting Suspension: If a player disconnects during this stage, their voting privileges are suspended until they complete the 30-second reconnection handshake. This ensures the 12-second carousel moves forward seamlessly.

Vote Idempotency: Redis sets ensure one vote per player per drawing.

🏆 Stage 5: ROUND_RESULTS (Intermediate Results)
A 5-second leaderboard appears. The `CleanupService` executes `cleanupRound()`, using a **multi-key Redis pipeline** to refresh the TTL for all remaining session keys while purging round-specific stroke data.

🏆 Stage 6: FINAL_RESULTS (Final Podium)
The match concludes with a text-only podium. The `CleanupService` executes `cleanupMatch()`, purging all round-specific data from Redis.

The Play Again Loop:
An atomic `MULTI / EXEC` transaction resets scores, rounds, prompt history, and submission sets, returning the room to the `LOBBY` state with a fresh 2-hour TTL across all keys.
