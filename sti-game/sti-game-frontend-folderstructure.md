sketch-to-impress-frontend/
├── .env.local                    # Local environment variables (NEXT_PUBLIC_WS_URL, etc.)
├── .gitignore                    # Build and dependency ignore targets
├── next.config.mjs               # Next.js configuration engine
├── package.json                  # Frontend architecture dependency registry
├── tailwind.config.ts            # Theme definitions (Neon neon palettes, arcade aesthetics)
├── tsconfig.json                 # Enforced strict type compiler parameters
├── README.md                     # Frontend deployment and setup documentation
│
├── public/                       # Zero-overhead static assets
│   └── assets/
│       ├── audio/                # Sound effects (timer ticking, voting tap, podium fanfares)
│       └── fonts/                # Custom arcade/retro display typography
│
└── src/
    ├── app/                      # NEXT.JS 14 APP ROUTER
    │   ├── layout.tsx            # HTML/Body shell, global font provisioning, Zustand provider
    │   ├── page.tsx              # VIEWPORT 1: MAIN LANDING MENU (Tracks Guest/Host entry points)
    │   │
    │   └── room/
    │       └── [roomId]/         # Dynamic parallel segment matching backend UUIDs
    │           ├── page.tsx      # Core Client-Side Router (Orchestrates Viewports 2-5 based on state)
    │           └── layout.tsx    # Persistent WebSockets connection manager & recovery anchor
    │
    ├── components/               # UI Component Architecture
    │   ├── shared/               # Reusable atomic design elements
    │   │   ├── ArcadeButton.tsx  # Framer Motion animated, heavy-tactile click buttons
    │   │   ├── TextInput.tsx     # Alphanumeric schema-enforced input for name/room codes
    │   │   └── NeonSlider.tsx    # Range component styled for high-visibility UI tracking
    │   │
    │   ├── landing/              # VIEWPORT 1: MAIN LANDING MENU
    │   │   ├── CreateLobbyCard.tsx # Triggers server REST call, generates lobby codes & credentials
    │   │   └── JoinLobbyForm.tsx # Client validation for Guest tracks (Enforces Name and Code formats)
    │   │
    │   ├── lobby/                # VIEWPORT 2: SYNCHRONIZED LOBBY ROOMS
    │   │   ├── PlayerRoster.tsx  # Dynamic list rendering connected players with Host badges
    │   │   ├── HostControls.tsx  # Editable configuration interface (Timer, Rounds, Theme dropdowns)
    │   │   └── GuestSettingsView.tsx # Immutable, locked-down live sync layout for standard users
    │   │
    │   ├── studio/               # VIEWPORT 3: THE STUDIO WORKSPACE
    │   │   ├── PromptHeader.tsx  # Displays critical metadata (Timer, Active Theme, Prompt word)
    │   │   ├── ColorPalette.tsx  # Grid selection mapping hexadecimal system color options
    │   │   ├── ToolTray.tsx      # Action triggers for brush configurations, fill bucket, and eraser
    │   │   ├── DrawingCanvas.tsx # Native HTML5 Canvas capture engine (Tracks pointer vector arrays)
    │   │   └── HistoryControls.tsx # Local state history managers mapping [Undo] and [Redo] keystrokes
    │   │
    │   ├── gallery/              # VIEWPORT 4: THE GALLERY EXHIBITION
    │   │   ├── GalleryHeader.tsx # Displays entry count indices (e.g., "Entry 2 of 5") and voting timer
    │   │   ├── ShowcaseCanvas.tsx # Read-only native canvas scaling and redrawing anonymous vector arrays
    │   │   ├── StarRatingBar.tsx # Ingestion track displaying 10 rating nodes (1-10 scale checks)
    │   │   └── IdentityStatus.tsx # Lock status display panel (e.g., "YOUR DRAWING - VOTING LOCKED")
    │   │
    │   └── podium/               # VIEWPORT 5: THE GRAND FINALE PODIUMS
    │       ├── PodiumDisplay.tsx # Framer Motion columns rising vertically relative to point weights
    │       ├── RankMedal.tsx     # Vector placement graphics for 1st, 2nd, and 3rd rank signifiers
    │       └── LeaderboardList.tsx # Scrollable table charting 4th+ placement runners-up & score sums
    │
    ├── hooks/                    # React Lifecycle Extenders
    │   ├── useCanvasEngine.ts    # Tracks client pointer, aggregates coordinates, and feeds history buffers
    │   └── useSocketSync.ts      # Attaches WebSocket listener routing arrays cleanly to stores
    │
    ├── services/                 # Network Pipeline Singletons
    │   ├── http.ts               # Fetch pipeline targeting REST gatekeeper schemas
    │   └── socketClient.ts       # Persistent socket.io-client connection instance wrapper
    │
    └── store/                    # ZUSTAND STATE HUB
        ├── gameStore.ts          # Live coordinator mapping RoomStatus enums, roster data, and phase steps
        ├── drawingStore.ts       # Active layout paint paths, brush sizing tracking, and history stacks
        └── types.ts              # State type definitions and mutation signatures

How this Architecture Drives Your Layouts
Viewport 1 Integration (src/app/page.tsx): Splits users immediately. The CreateLobbyCard invokes your REST gateway to initialize a lobby. The JoinLobbyForm enforces alphanumeric checks locally before firing a room-verification request.

Viewport 2 Conditional Access (src/components/lobby/): Based on user validation roles derived from your token, the main lobby system renders either HostControls (binding real-time socket patch events as sliders change) or GuestSettingsView (locking interaction structures while listening for incoming state updates).

Viewport 3 Absolute Isolation (src/components/studio/): Dedicated components completely ignore chat modules or standard game frames, fulfilling your specific requirement for an isolated, high-concentration design focus. Everything runs within local view frames to ensure ultra-low processing overhead.

Viewport 4 Anonymized Pipeline (src/components/gallery/): The ShowcaseCanvas accepts pure, stringified vector coordinate data from your Zustand store and paints it dynamically onto a read-only context wrapper. The StarRatingBar translates tactile click coordinates into numerical values ranging from 1 to 10.

Viewport 5 Spatial Execution (src/components/podium/): Leverages Framer Motion physics maps embedded right inside PodiumDisplay.tsx to read total calculated ratings from your backend and execute sequential staggered animations for first, second, and third-place winners.