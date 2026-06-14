🍄 Sketch to Impress: Frontend Atomic Level Agile Sprint Registry (Plumber Edition)
This registry details the highly granular development execution path for sketch-to-impress-frontend. Adhering to high-performance real-time party game constraints, the application uses Next.js 14 App Router for structural page lifecycles, Zustand for micro-state tracking of high-frequency network events, and Native HTML5 Canvas for zero-overhead vector stroke tracking.

All components are styled with a vibrant, playful Retro Mario / 8-Bit Platformer Aesthetic using Tailwind CSS, with squash-and-stretch, gravity-defying animations driven by Framer Motion.

🛠️ Phase 1: Engine Initialization & Real-Time Client Foundations
SPRINT 1: Next.js 14 App Router Setup & Scaffolding
Goal: Initialize a clean Next.js 14 template, enforce strict type-safe compilation configurations, and purge template boilerplate.

Tasks:

Initialize an isolated frontend workspace directory using npx create-next-app@14 --typescript --tailwind --eslint --app --src-dir.

Open tsconfig.json and append strict type compiler safety parameters, ensuring "strict": true, "noImplicitAny": true, and "strictNullChecks": true are active.

Purge the default assets and global styles in src/app/page.tsx and src/app/globals.css to deliver a zero-baseline layout core.

Deliverables: A clean, warning-free TypeScript next-app structure compiling with absolute strictness.

SPRINT 2: Core Matrix Dependency Provisioning
Goal: Pull, verify, and lock all core dependencies required for micro-state coordination, real-time channels, and cartoon-physics animations.

Tasks:

Populate the dependency trees in package.json by executing explicit installations for socket.io-client, zustand, and framer-motion.

Add utility formatting and validation packages by installing lucide-react (for design icons), clsx, and tailwind-merge (for dynamic class binding).

Lock structural developer utilities by installing @types/node and internal configuration schemas matching your build targets.

Deliverables: A locked dependency manifest operating seamlessly without peer-dependency conflicts.

SPRINT 3: Environmental Configurations & Network Gateway Singletons
Goal: Standardize environmental entry vectors and provision an explicit network gateway to track API and WebSocket contexts.

Tasks:

Build a local environment config blueprint file .env.local containing NEXT_PUBLIC_API_URL=http://localhost:3000 and NEXT_PUBLIC_WS_URL=ws://localhost:3000.

Construct a lightweight HTTP fetch client utility inside src/services/http.ts configuring base headers and standard JSON payload serialization wrappers.

Construct an isolated, decoupled Socket.io connection instance inside src/services/socketClient.ts that exports a single connection factory wrapper configured with autoConnect: false.

Deliverables: Global network handlers established, preventing structural socket duplication leaks upon hot-reloads.

SPRINT 4: Immutable Interface Types Matching Backend Contracts
Goal: Code an identical type-safe mirror of the backend structural data formats to ensure client-server interface compatibility.

Tasks:

Create a type registration ledger inside src/types/room.ts modeling the REST/WS response properties (roomCode, playerId, hostId, reconnectToken).

Program a strongly-typed state schema model inside src/types/game.ts defining explicit TypeScript enums tracking game phase transitions: LOBBY, STUDIO, GALLERY, ROUND_RESULTS, and FINAL_RESULTS.

Centralize type routing using a master exporter manifest file located at src/types/index.ts.

Deliverables: Complete TypeScript contract compatibility mapping directly to the NestJS endpoint parameters.

SPRINT 5: Zustand Central Store Design & Micro-State Architectures
Goal: Construct a highly responsive, atomic Zustand state engine capable of running high-frequency mutations with zero-lag UI component subscriptions.

Tasks:

Build the primary structural store framework inside src/store/gameStore.ts.

Establish the core state properties: roomCode, playerId, username, isHost, currentPhase, playersRoster (array), and activePrompt.

Code explicit, self-contained slice mutations (setRoomData, updateRoster, setGamePhase, clearStore) ensuring component trees only subscribe to isolated nodes to mitigate component re-render overhead.

Deliverables: A highly reactive store engine operational and ready to swallow asynchronous WebSocket payloads.

🚪 Phase 2: Viewport 1 — Main Landing Menu & Plumber-Style Security
SPRINT 6: Mushroom Kingdom Typography & Pixel-Box Shell
Goal: Inject custom retro 8-bit typography assets and configure a persistent global container styled with a goofy, colorful platformer aesthetic.

Tasks:

Provision a playful 8-bit pixel font family (e.g., Press Start 2P or similar retro arcade web fonts) within src/app/layout.tsx using next/font/local.

Configure src/app/globals.css with bright, retro color primitives: sky blue backgrounds (#5c94fc), coin yellow (#f8b800), brick red (#b83418), and pipes green (#00a800). Create pixelated, thick, multi-layered black borders (border-4 border-black box-shadow-retro).

Build reusable atomic UI elements under src/components/shared/ containing ArcadeButton.tsx (chunky 3D style buttons that visually compress downward when clicked) and TextInput.tsx (styled like a retro dialog message box).

Deliverables: Root visual environment operational, offering snappy, squishy, hardware-accelerated button clicks and pixelated layouts.

SPRINT 7: Create Lobby Card Flow (Host Gatekeeper)
Goal: Implement the Host entry gate triggering room initialization calls to the backend REST infrastructure.

Tasks:

Create the component view container src/components/landing/CreateLobbyCard.tsx and map it into the primary src/app/page.tsx file grid.

Wire an onClick asynchronous pipeline that reads input fields, builds a valid request schema, and hits the POST /api/v1/rooms/create backend REST path.

Capture the response variables (roomCode, playerId, reconnectToken), commit them to local memory (sessionStorage), update the Zustand state cache, and trigger a Next.js client route push targeting /room/[roomId].

Deliverables: Clicking "CREATE A LOBBY" triggers backend registration and boots the newly assigned Host directly into the designated secure room container.

SPRINT 8: Join Lobby Form Flow (Guest Track Validation)
Goal: Program strict alphanumeric input constraints matching the backend rules, and execute entry verification requests.

Tasks:

Code the layout configuration structure inside src/components/landing/JoinLobbyForm.tsx.

Restrict input interaction strings natively using pattern masks (enforcing 3–20 characters for names and converting the 6-character room code input to uppercase on the fly, skipping ambiguous glyphs like 0, O, 1, and I).

Wire the form submission pipeline to execute requests against the POST /api/v1/rooms/join endpoint, handle HTTP error states (such as a 429 rate limit or 404 Room Not Found), and push authorized Guests onto the dynamic page layout.

Deliverables: Guest form prevents bad payloads locally before transmission and handles API errors via clean, contextual retro text bubble alerts.

👥 Phase 3: Viewport 2 — Synchronized Lobby Rooms & WebSocket Pipelines
SPRINT 9: Persistent Real-Time Channel Mounting Loop
Goal: Initialize and maintain the active Socket.io connection loop within dynamic layouts, enforcing automatic credential handshakes.

Tasks:

Build the client-side network interceptor inside src/app/room/[roomId]/layout.tsx to handle route params.

Write an initialization hook src/hooks/useSocketSync.ts that safely reads the reconnectToken from storage, appends authorization values inside the client handshake configuration, and executes .connect().

Establish basic lifecycle event bindings tracking connect errors, and inject a global UI error boundary layer to catch network disconnect events.

Deliverables: Accessing a room route automatically provisions a validated real-time WebSocket channel mapping matching user roles.

SPRINT 10: Live Player Roster Management Rendering
Goal: Listen for live player onboarding events and render dynamic, responsive player roster grids.

Tasks:

Construct the view layout component inside src/components/lobby/PlayerRoster.tsx.

Code a WebSocket listener block inside useSocketSync.ts that hooks into the v1:room:player_joined backend broadcast events and pipes payload updates straight to your Zustand store.

Map player arrays inside the UI wrapper container, rendering a distinct Host indicator badge (e.g., a pixelated crown or star icon) beside the authorized user card.

Deliverables: Real-time player entry broadcasts update all client player matrices instantly across screens.

SPRINT 11: Host Parameter Control Interface
Goal: Build the interactive rule modification configuration dashboard restricted strictly to the authenticated room creator.

Tasks:

Construct src/components/lobby/HostControls.tsx featuring chunky option panels for the round constraints (1, 3, 5 rounds), draw timer (60s, 90s, 120s), and theme selectors (Anime, Cartoon, Gaming).

Guard interaction fields natively by evaluating isHost state values, allowing administrative mouse clicks only if verified true.

Wire active UI option shifts to transmit transactional v1:room:update_settings data packets directly to the server.

Deliverables: The host interface registers changes and relays outbound rule updates immediately across the WebSocket pipe.

SPRINT 12: Locked Guest Settings View Synchronization
Goal: Build the immutable configuration mirror displayed to standard users, ensuring accurate property synchronizations.

Tasks:

Code an elegant, locked display layout panel inside src/components/lobby/GuestSettingsView.tsx.

Setup an incoming socket event handler intercepting v1:room:settings_updated messages, pushing updated configuration properties to the store.

Style the Guest settings block with visual locking signifiers (e.g., solid gray stone blocks or locked question-mark box assets), reflecting real-time backend variables with crisp opacity animations.

Deliverables: Guest configurations change instantly following Host actions while strictly blocking unauthorized local user modifications.

SPRINT 13: 30-Second Grace Window State Recovery Handler
Goal: Catch network dropouts, trigger automatic socket-client reconnect sequences, and apply incoming state snapshots smoothly.

Tasks:

Update useSocketSync.ts to hook into native connection-loss monitoring hooks (disconnect, connect_error).

Create a full-screen loading overlay block that displays a high-visibility connection recovery status indicator (styled like a pixelated "PAUSE" screen).

Build an ingestion filter listening for the v1:player:reconnected snapshot payload, mapping properties (currentRound, phase, remainingTime, activePrompt) across variables to seamlessly restore user sessions.

Deliverables: Sudden client disconnects trigger an instant local recovery interface, restoring the entire game view state upon successful reconnection within 30 seconds.

🎨 Phase 4: Viewport 3 — The Studio Workspace & Canvas Engine
SPRINT 14: Isolated Studio Layout State Controller
Goal: Build the absolute interface switch routing users away from lobby configurations and launching the isolated workspace.

Tasks:

Code the primary matching switch engine directly inside src/app/room/[roomId]/page.tsx evaluating active currentPhase variables.

Build the root wrapper block for src/components/studio/StudioWorkspace.tsx, stripping out chats, menus, or external page panels to match your visual requirement.

Wire an incoming event listener for v1:game:phase_changed with value STUDIO to trigger a Framer Motion bounce transition into the sketch interface.

Deliverables: Room phase transitions instantly lock user viewports into the unencumbered, high-focus sketching environment.

SPRINT 15: Server-Authoritative Clock & Prompt Header Rendering
Goal: Build the top status banner rendering prompt words and a localized synchronized visual clock tracking server intervals.

Tasks:

Program the visual component layout inside src/components/studio/PromptHeader.tsx.

Listen for incoming v1:game:round_started socket event streams, committing the chosen activePrompt and roundEndTimestamp to Zustand.

Implement an active local requestAnimationFrame countdown clock interval loop calculating remaining session time against the server-issued absolute timestamp, formatting the text into a bold, flashing timer box that shakes slightly when time runs low.

Deliverables: Prompt details load instantly, running a high-accuracy, server-synchronized countdown timer that alerts the player as zero approaches.

SPRINT 16: Native HTML5 Canvas Vector Tracking Core
Goal: Build a high-performance custom React hook managing canvas interaction loops, capturing mouse/touch pathways as low-overhead numeric vector arrays.

Tasks:

Design a high-speed custom interaction hook inside src/hooks/useCanvasEngine.ts that binds mouse event contexts (onMouseDown, onMouseMove, onMouseUp) and mobile touch event vectors.

Configure an internal tracking state capturing raw pointer coordinates relative to the canvas bounding box, compiling positions as a lightweight numerical stream object: [x1, y1, x2, y2].

Bind options to update local structural metrics including drawing line widths and current hexadecimal stroke strings.

Deliverables: Pointer coordinates translate smoothly into lightweight mathematical lines, running without processing delays or heavy component re-renders.

SPRINT 17: Drawing Tools Matrix & Tool Tray UI
Goal: Code the sidebar instrumentation deck giving users control over brush parameters, fill bucket triggers, and canvas clearing functions.

Tasks:

Build the component module src/components/studio/ToolTray.tsx and attach sub-elements for ColorPalette.tsx.

Establish a local UI variable map detailing the hexadecimal color options array, binding active states to update the useCanvasEngine stroke variables.

Add cartoonish styling cues to indicate the currently active drawing utility, complete with a clean layout slider to modulate line thicknesses on the fly.

Deliverables: The studio toolbar offers precise color selection and stroke control across desktop and touch screens.

SPRINT 18: Local Canvas History Buffers (Undo & Redo Arrays)
Goal: Program a local canvas operations buffer tracking action arrays to allow instantaneous client canvas adjustments.

Tasks:

Build the tool button matrix inside src/components/studio/HistoryControls.tsx.

Inside useCanvasEngine.ts, provision two local array storage points: an undoStack and a redoStack storing vector action entries.

Write explicit function triggers that pop stroke elements off stacks, clear the native canvas rendering context, and re-draw remaining vector paths when hotkeys or control buttons are clicked.

Deliverables: Sketch configurations support unlimited local history manipulation paths, optimizing performance by entirely tracking vector data locally.

SPRINT 19: High-Efficiency Vector Submissions Pipeline
Goal: Package, validate, and stream the finalized numerical stroke matrix to the backend prior to step expirations.

Tasks:

Create an automated submission serializer method inside your canvas state handlers.

Program the engine to convert the local vector strokes cache array into a clean JSON data structure ({ strokes: Array<{ color: string, brushSize: number, points: number[] }> }), verifying the package stays under the 150 KB limit.

Wire an event call to transmit the payload over the v1:studio:submit_drawing WebSocket channel either when the user clicks submit or when the synchronized countdown hits zero.

Deliverables: Complete vector drawing records are stringified and transmitted instantly, fitting neatly within your backend's DTO validation schemas.

🏛️ Phase 5: Viewport 4 — The Gallery Exhibition & Rating Runway
SPRINT 20: Anonymous Drawing Runway Viewport Controller
Goal: Configure the staging framework responsible for managing the exhibition rounds, maintaining strict artist anonymity.

Tasks:

Create the root viewing element container src/components/gallery/GalleryExhibition.tsx.

Establish store states to capture active exhibition indices, drawing identifiers, and lock properties (currentEntryIndex, totalEntries, isOwnDrawing).

Listen for inbound v1:gallery:next_canvas socket streams, update layout parameters, and automatically reset voting input states to a zero baseline value upon each view transition.

Deliverables: The gallery layout mounts dynamically, presenting drawings in a randomized sequence with identifying player metadata stripped.

SPRINT 21: Read-Only Scaled Vector Playback Canvas
Goal: Design an unencumbered canvas drawing pipeline that accepts raw coordinate matrices and handles dynamic cross-device canvas scaling.

Tasks:

Construct src/components/gallery/ShowcaseCanvas.tsx running a read-only native HTML5 canvas workspace context.

Write a vector reconstruction method that iterates through incoming stroke payloads, executing native .beginPath(), .moveTo(), and .lineTo() path loops.

Inject simple coordinate scaling mechanics that calculate target element boundaries relative to the original drawing grid bounds, ensuring sketches look accurate regardless of user screen size.

Deliverables: Remote vector telemetry datasets render flawlessly across diverse modern client monitors with scaling accuracy.

SPRINT 22: Tactile Fire-Bar Rating Slider & Control Nodes
Goal: Build the tactile 1-10 rating input control matrix featuring physics-driven selector responses.

Tasks:

Code the layout component structure inside src/components/gallery/StarRatingBar.tsx.

Map 10 discrete target input nodes across an arcade slider axis, styling individual elements with classic 8-bit Fire-Flower or Star graphics instead of dark shapes.

Enforce reactive lookups that evaluate current player parameters against the active canvas asset: if isOwnDrawing registers true, instantly lock the slider bar view and render an <IdentityStatus /> alert banner stating "YOUR DRAWING - VOTING LOCKED".

Deliverables: The rating interface accepts touch or mouse clicks, responding with interactive jumping and glowing animations on every node selection.

SPRINT 23: Idempotent Score Dispatched Event Pipelines
Goal: Dispatch user ratings over WebSocket channels while establishing local guards to prevent submission duplication.

Tasks:

Wire user tap interactions to trigger outbound v1:gallery:cast_vote WebSocket payloads containing the designated numerical value.

Add a local submission lock state flag (hasVoted) inside your store that flips to true the exact millisecond a vote is fired.

Configure layout styles to change once the lock is active, offering clear visual confirmation that the vote was successfully received.

Deliverables: Star ratings stream instantly, with local locks blocking transaction spam or double-voting race conditions.

🏆 Phase 6: Viewport 5 — The Grand Finale Podiums & Reset Loops
SPRINT 24: Staggered Platformer Podium Animation Orchestration
Goal: Build the intermediate leaderboard view and final match podium animations using staggered transitions.

Tasks:

Construct the view components src/components/podium/PodiumDisplay.tsx and src/components/podium/LeaderboardList.tsx.

Configure an incoming channel monitor tracking the v1:game:round_complete and v1:game:final_results_started socket signals.

Program sequential staggered animation frames using Framer Motion variants, directing the second-place, third-place, and first-place columns (styled like colorful 3D blocks or green warp pipes) to spring or jump vertically into view relative to their points.

Deliverables: Match standings render using high-impact, bouncy animations, making leaderboard changes feel celebratory and satisfying.

SPRINT 25: Unified Post-Game Play Again Reset Lifecycle
Goal: Hook up the host configuration reset command path and wipe local client states back to a clean slate.

Tasks:

Embed a dedicated [ PLAY AGAIN ] call-to-action button within the podium menu wrapper, wrapping its rendering visibility behind an explicit isHost validation check.

Bind the click pipeline to emit a v1:host:trigger_play_again message to the backend server.

Wire an incoming listener event block that catches the subsequent game-state change, clears local state stores, purges session canvas history indices, and returns all participants seamlessly back to the Lobby layout.

Deliverables: Clicking "Play Again" performs an instantaneous state reset, transitioning all connected players back to a clean staging lobby without forcing separate room re-entries.

🧪 Phase 7: Quality Assurance & Production Validation
SPRINT 26: Automated UI/UX Validation Tests
Goal: Build automated frontend validation scripts ensuring clean layout switches and robust input validation rules.

Tasks:

Configure a testing setup within a localized /test folder using Cypress or Playwright.

Script functional E2E interface scenarios that simulate standard user registration inputs, verify formatting edge cases, and assert that fields drop bad inputs locally.

Script UI verification routines ensuring that when the room store state swaps phases, the corresponding viewports render accurately on screen.

Deliverables: Automated test suites confirm core client layout changes and component validation parameters pass with zero warnings.

📊 Frontend Architectural Flow Map
To better understand how these sprints tie together across the application state lifecycle, review the architecture mapping below. This flow illustrates how high-frequency WebSocket events bypass typical React re-render performance bottlenecks to trigger clean viewport swaps:

Plaintext
    +-----------------------------------------------------------------------+
    |                   src/services/socketClient.ts                        |
    |          Maintains persistent real-time ws:// connection              |
    +-----------------------------------------------------------------------+
                                        |
                          Inbound WS Event Stream
            (v1:game:phase_changed, v1:room:settings_updated, etc.)
                                        v
    +-----------------------------------------------------------------------+
    |                        src/store/gameStore.ts                         |
    |     Zustand Store Engine digests raw payloads & runs mutations         |
    +-----------------------------------------------------------------------+
              |                        |                        |
       currentPhase="LOBBY"     currentPhase="STUDIO"    currentPhase="GALLERY"
              |                        |                        |
              v                        v                        v
    +--------------------+   +--------------------+   +--------------------+
    | src/components/    |   | src/components/    |   | src/components/    |
    | lobby/             |   | studio/            |   | gallery/           |
    |                    |   |                    |   |                    |
    | Renders Roster,    |   | Launches isolated  |   | Pulls raw vector   |
    | Locked Sync Views, |   | HTML5 canvas and   |   | stroke inputs &    |
    | & Blocky Panels    |   | locks viewports    |   | mounts rating bar  |
    +--------------------+   +--------------------+   +--------------------+