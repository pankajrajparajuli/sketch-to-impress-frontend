sketch-to-impress-backend/
├── .env                          # Local environment variables configuration (Git ignored)
├── .gitignore                    # Local build and environment ignore targets
├── docker-compose.yml            # Isolate 100% volatile RAM Redis infrastructure config
├── nest-cli.json                 # NestJS framework compiler instructions
├── package.json                  # System architecture dependency registry
├── tsconfig.json                 # Enforced strict type compiler parameters
├── tsconfig.build.json           # Distribution build exclusions matrix
├── README.md                     # System landscape overview documentation
│
├── src/
│   ├── main.ts                   # Bootstrapper engine, CORS rules, and global pipes
│   ├── app.module.ts             # Global module assembler
│   │
│   ├── common/                   # Cross-cutting architectural foundations
│   │   ├── config/
│   │   │   └── redis.config.ts   # Configuration factory parsing environment vectors
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts # Immutable REST JSON error transformer
│   │   │   └── ws-exception.filter.ts   # Thread-safe client WebSocket error handler
│   │   ├── guards/
│   │   │   └── gateway.guard.ts  # Host administrative socket operation validator
│   │   ├── logging/
│   │   │   └── json-logger.service.ts   # Vector-stroke-stripped structural JSON logging pipe
│   │   └── services/
│   │       └── cleanup.service.ts # Dedicated resource cleanup (Round/Match/Room)
│   │
│   ├── redis/                    # Ephemeral Memory Layer (Zero-Disk Persistent Pipeline)
│   │   ├── redis.module.ts       # Global encapsulation driver registration
│   │   ├── redis.service.ts      # Atomic interaction wrappers with sti:v1: prefix logic
│   │   └── redis.keys.ts         # Centralized, immutable, versioned key schema matrix
│   │
│   ├── rooms/                    # STAGE 1: REST Entry Gatekeeper (Lobby Provisioning)
│   │   ├── rooms.module.ts       # Service, controller, and Redis linkage module
│   │   ├── rooms.controller.ts   # Public route definitions for create and join actions
│   │   ├── rooms.service.ts      # Token generation and 8-player capacity checks
│   │   ├── dto/
│   │   │   ├── create-room.dto.ts # Extensible game initialization parameters
│   │   │   └── join-room.dto.ts   # Input schemas enforcing alphanumeric usernames
│   │   ├── interfaces/
│   │   │   └── room.interface.ts  # Immutable runtime domain contract shapes
│   │   └── enums/
│   │       └── room-status.enum.ts # LOBBY, DRAWING, GALLERY, ROUND_RESULTS, FINAL_RESULTS
│   │
│   └── game/                     # STAGES 2–6: Real-Time WebSockets Engine
│       ├── game.module.ts        # Assembly for loops, gateway hubs, and state managers
│       ├── game.gateway.ts       # Event routing layer with v1: versioning and host migration
│       ├── game.service.ts       # Core state engine, stroke carousels, and vote idempotency
│       ├── constants/
│       │   ├── prompts.ts        # Categorized theme word decks (Anime, Cartoon, Gaming)
│       │   └── game.constants.ts # Centralized magic numbers (TTL, Security, Timers)
│       ├── interfaces/           # Typed WebSocket payload contracts (v1: prefix)
│       │   ├── v1-game-round-started.interface.ts
│       │   ├── v1-gallery-next-canvas.interface.ts
│       │   ├── v1-room-settings.interface.ts
│       │   ├── v1-reconnect-state.interface.ts
│       │   └── v1-final-podium.interface.ts
│       └── dto/
│           ├── update-settings.dto.ts # Parameter caps (60s/90s/120s and round constraints)
│           ├── submit-drawing.dto.ts  # Vector stroke array validation schemas
│           └── cast-vote.dto.ts       # Ingestion scale checks restricted from 1 to 10
│
│   └── recovery/                 # Temporary Disconnect Recovery Layer
│       ├── recovery.module.ts
│       └── recovery.service.ts   # 30-second grace window and signed token validation
│
└── test/                         # Quality Assurance Automation Suites
    ├── app.e2e-spec.ts           # End-to-end integration flows
    └── jest-e2e.json             # Integration testing harness drivers