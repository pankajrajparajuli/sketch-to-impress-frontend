🗺️ Viewport 1: The Main Landing Menu (The Start Screen)
Visual Aesthetic: Bright sky-blue background (#5c94fc), floating pixelated question-mark blocks, and a massive, bouncy game title text using the Press Start 2P font.

Layout Structure: A centered, thick-bordered retro dialog box (border-4 border-black box-shadow-retro) split into two distinct execution tracks.

👑 The Host Track (Left/Top Component)
Interactive Elements: A prominent, chunky green 3D button labeled [ CREATE A LOBBY ].

Client Execution & Logic: * Clicking this button automatically bypasses manual input and sends a quick name generation or grabs a baseline placeholder to fire a POST /api/v1/rooms/create payload.

It intercepts the JSON success response, securely commits the reconnectToken, playerId, and room code metadata to sessionStorage, sets the local Zustand state isHost: true, and immediately executes a client-side route push to /room/[roomId].

🍄 The Guest Track (Right/Bottom Component)
Interactive Elements: * Enter Your Name text field styled like a classic RPG chat dialog box.

Enter Room Code text field divided into 6 distinct, chunky pixel input boxes.

A bright yellow [ JOIN LOBBY ] action button.

Client Execution & Validation Logic:

Input Masking: The text field limits names strictly to 3–20 characters and blocks special symbols. The Room Code input automatically capitalizes letters on the fly and filters out confusing glyphs like 0, O, 1, and I.

Network Submission: Clicking join fires a POST /api/v1/rooms/join request. If the backend returns an error (e.g., 404 Room Not Found or 429 Too Many Requests), a cartoonish exclamation bubble pops up with an error sound effect. On success, it stores the guest credentials and routes them forward.

🍄 Viewport 2: Synchronized Lobby Rooms (The Staging World)
Visual Aesthetic: The screen splits dynamically into a Left Panel (Configuration) and a Right Panel (Roster). The borders look like retro brick tiles, and player cards resemble classic character selection panels.

The WebSocket Handshake: As soon as this layout mounts, src/hooks/useSocketSync.ts reads the reconnectToken from storage, attaches it to the connection metadata, and spins up the live socket.io-client pipe.

🕹️ The Host View (Active Controls)
Interactive Elements: Editable, tactile drop-down option grids and slider toggles.

Timer Caps: 60s, 90s, or 120s options.

Round Limits: 1, 3, or 5 rounds.

Theme Decks: Anime, Cartoon, or Gaming.

A big, flashing green pipe button: [ START GAME ].

Real-Time Client Logic: * Whenever the Host updates a setting (e.g., clicking 90s), the component catches the click and instantly emits a v1:room:update_settings WebSocket event to the server.

This action does not wait for a page reload—it streams directly to the backend.

👥 The Guest View (Locked Sync View)
Interactive Elements: An identical layout matrix to the host view, but entirely non-interactive. All selectors are layered over with a solid gray stone block or locked question-mark tile texture.

Real-Time Client Logic:

The guest client listens continuously for v1:room:settings_updated broadcasts coming from the WebSocket gateway.

The moment the host clicks an option, the guest's Zustand store absorbs the new variables, causing the locked UI numbers and selection indicators to change, bounce, or slide instantly in real-time.

The action button text updates dynamically to show [ WAITING FOR HOST... ].

👥 The Player Roster Panel
Displays an animated list of all connected players as character cards.

It updates instantly whenever a v1:room:player_joined event is intercepted. The host card features a distinct bouncing golden 8-bit star or crown icon.

🎨 Viewport 3: The Studio Workspace (The Private Canvas)
Visual Aesthetic: Clean, solid workspace focus with zero text chat boxes. The drawing frame is encased in a clean pixel boundary.

The Phase Switch: When the Host clicks start, the server verifies permissions via a SETNX lock and broadcasts v1:game:phase_changed with the state value STUDIO. All screens change simultaneously using a cartoon squash-and-stretch screen transition.

⏱️ The Server-Authoritative Clock & Header
Displays the active prompt in bold letters (e.g., PROMPT: "GOKU" under the THEME: CARTOON heading).

Instead of running an unstable local interval timer, the client reads a high-accuracy absolute Unix timestamp (roundEndTimestamp) pushed down the socket.

A requestAnimationFrame loop calculates endTimestamp - currentServerTime every millisecond. The timer displays a bold countdown that flashes red and shakes wildly like an exploding bomb when time drops below 10 seconds.

🖌️ The Drawing Canvas Engine & Tool Tray
The Interaction Core: A native, highly responsive HTML5 Canvas element managed by src/hooks/useCanvasEngine.ts.

Data Capture Handling: As the user moves their mouse or drags their finger across a touch screen, the hook intercepts the precise pixel coordinates relative to the canvas bounding box. It avoids heavy React state re-renders by storing paths as an ultra-lightweight stream of numerical coordinate pairs ([x1, y1, x2, y2]).

Tool Controls: A compact toolbar panel containing a color palette grid, a line thickness slider, a Fill bucket tool, and an Eraser tool.

Local Buffers: Dedicated [ Undo ] and [ Redo ] buttons pull or push vector strokes from local stack arrays instantly without hitting the network.

The Submission Trigger: Clicking the submit button—or letting the server timer hit zero—causes the canvas engine to instantly stringify the raw vector stroke array ({ strokes: [...] }) and stream it over the v1:studio:submit_drawing pipe. It sets a local hasSubmitted flag to lock out any further edits.

🏛️ Viewport 4: The Gallery Exhibition (The Runway Judging)
Visual Aesthetic: Styled like a grand gallery museum layout with a massive, prominent display easel frame in the center.

The Phase Transition: Once the backend locks down submissions and pipeline locks clear, all viewports change to GALLERY.

🎭 Anonymized Carousel Layout
The Carousel Loop: The client displays drawings one-by-one following the server's v1:gallery:next_canvas coordinate streams.

Dynamic Vector Rendering: The component <ShowcaseCanvas /> reads the incoming raw numerical stroke arrays and paints the lines onto a read-only canvas element. It applies scale multipliers based on bounding boxes, ensuring the artwork renders with pixel-perfect accuracy on all device sizes.

Anonymity Layer: The artist's nickname, profile card, and score values are completely hidden.

🔥 The Fire-Flower 1-10 Rating Axis
Interactive Elements: A horizontal layout tracking 10 distinct, glowing 8-bit Fire-Flower or Star nodes.

The Self-Voting Guard: The engine automatically checks the current drawing’s anonymous metadata against the client's local playerId. If they match, the slider bar locks immediately, and an overlay banner drops down reading: [ YOUR DRAWING - VOTING LOCKED ].

The Submission Pipeline: For eligible drawings, tapping a star node fires a transactional v1:gallery:cast_vote socket packet and triggers a local store flag (hasVoted: true), changing the node styles to a solid color to prevent double-voting or spam.

🏆 Viewport 5: The Grand Finale Podiums (The Score Celebration)
Visual Aesthetic: A dramatic, classic platformer completion background. The 1st, 2nd, and 3rd place markers are designed to look like stacked pixel ground blocks or green warp pipes.

🥇 Staggered Pillar Celebrations
The Results Trigger: When the final gallery turn completes, the scoring engine calculates the star weights. The client catches either a v1:game:round_complete (intermediate round standings) or a v1:game:final_results_started event.

Animation Sequences: Framer Motion executes staggered animation frames based on the ordered standings array. The 3rd-place pipe springs up from the bottom of the screen, followed by 2nd place, and finally, the 1st-place champion block drops down from above with an explosion of star particles and arcade fanfares.

The Runner-Up Ledger: A clean scrollable leaderboard list renders underneath the top 3 blocks, displaying 4th-place and lower runner-up point totals.

🔄 The Reconnection Handshake & Play Again Loop
The frontend contains two absolute emergency and cleanup state machines to ensure games never break or hang:

⏱️ The 30-Second Grace Reconnection Handshake
The Disconnect Catch: If a player experiences a network dropout or accidentally reloads their browser, the frontend immediately intercepts the connection drop.

The Pause Screen: It launches a dark, pixelated full-screen overlay reading [ GAME PAUSED - RECONNECTING TO KINGDOM... ] and halts UI timers.

The Snapshot Restore: The socket tries to connect again using the reconnectToken. The backend matches the credentials and replies with a v1:player:reconnected snapshot. The client store instantly absorbs the active round state, current game phase, active prompt, and remaining server clock window, tearing down the pause overlay and dropping the player right back into the active loop.

🔁 The Play Again Transaction Reset
The Control Security: The [ PLAY AGAIN ] button renders exclusively on the Host's podium screen.

The Atomic State Reset: Clicking it emits a v1:host:trigger_play_again event. This commands the backend to wipe out scores, prompt logs, and canvas assets. The backend then moves the game state back to LOBBY.

The Seamless Loop: All connected client stores intercept the state update, flush out their old drawing and history data arrays, and transition smoothly back to the Viewport 2 Staging Lobby without requiring anyone to enter a new code.