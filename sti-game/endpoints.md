🎮 Real-Time Vector Drawing Engine: WebSocket API Documentation
This document contains the complete production specification for your real-time WebSocket communication layer (namespace: /game), synchronized with your database schemas, server validation rules, and transactional room states.

🗂️ Core Data Structures (Shared DTOs)
PointDto
Represents a single coordinate pair on the canvas plane.

JSON
{
  "x": 10,
  "y": 20
}
StrokeDto
A vector collection representing an individual continuous drawing line path.

Enforces validation constraints: @IsHexColor(), @Min(1) for brushSize, and a maximum array limit of 5,000 points.

JSON
{
  "color": "#ff0000",
  "brushSize": 5,
  "points": [
    { "x": 10, "y": 20 },
    { "x": 30, "y": 40 }
  ]
}
StandingEntry
An entity displaying a user's chronological match footprint across active evaluation rounds.

JSON
{
  "playerId": "usr_jl0cmau",
  "username": "Playewo",
  "score": 16,
  "rank": 1
}
📥 1. Client-to-Server Inbound Channels (Takes JSON)
1. Submit Canvas Artwork
Event String: v1:canvas:submit_drawing

Handler Context: Dispatched by players to upload vector paths before a round's drawing window closes.

Automated Payload Format (SubmitDrawingDto): Enforces a maximum payload capacity of 1,000 continuous path lines per canvas submission.

JSON
{
  "strokes": [
    {
      "color": "#ff0000",
      "brushSize": 5,
      "points": [
        { "x": 10, "y": 20 },
        { "x": 30, "y": 40 }
      ]
    }
  ]
}
Immediate Response Acknowledgement (Sent directly back to Sender Socket):

JSON
{
  "success": true,
  "playerId": "usr_28a7c",
  "strokeCount": 1
}
2. Cast Evaluation Stars
Event String: v1:vote:cast_stars

Handler Context: Fired by evaluating users during sequential anonymous gallery carousels. Enforces rating checks between 1 and 10 stars via CastVoteDto.

Automated Payload Format (CastVoteDto):

JSON
{
  "stars": 8
}
Immediate Response Acknowledgement:

JSON
{
  "success": true
}
3. Update Room Configurations (Host Only)
Event String: v1:host:update_settings

Security Validation: Guarded by GatewayGuard to verify that the message sender's socket matches the active host identity.

Automated Payload Format (UpdateSettingsDto): Restricts parameters to set options: timerDuration (5, 60, 90, 120), totalRounds (1, 3, 5), and uppercase enum choices for the theme ('ANIME', 'CARTOON', 'GAMING', 'RANDOM').

JSON
{
  "timerDuration": 90,
  "totalRounds": 3,
  "theme": "CARTOON"
}
Immediate Response Acknowledgement:

JSON
{
  "success": true
}
4. Trigger Play Again (Host Only)
Event String: v1:host:trigger_play_again

Security Validation: Guarded by GatewayGuard. Clears operational Redis keys and resets room variables to return the space cleanly to a lobby state.

Automated Payload Format (PlayAgainDto):

JSON
{
  "confirm": true
}
Immediate Response Acknowledgement:

JSON
{
  "success": true
}
📤 2. Server-to-Client Outbound Channels (Emits Broadcasts)
1. Game Status Phase Change
Broadcast Channel: v1:game:phase_changed

Workflow Engine Sequence: Notifies all connected subscribers when the room progresses through game phases:

LOBBY ➔ DRAWING ➔ GALLERY ➔ ROUND_RESULTS ➔ FINAL_RESULTS
Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "status": "GALLERY"
}
2. Draw Round Initialization
Broadcast Channel: v1:game:round_started

Workflow Engine Sequence: Broadcasted globally at the beginning of the drawing sequence to distribute the chosen theme word prompt and sync countdown clock timers.

Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "round": 3,
  "prompt": "PIZZA",
  "roundEndTimestamp": 1781449691773,
  "serverTime": 1781449691789
}
3. Gallery Carousel Item Distribution
Broadcast Channel: v1:gallery:next_canvas

Workflow Engine Sequence: Distributes successive anonymous drawings to all connected players for evaluation during the gallery review cycle.

Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "round": 3,
  "position": 1,
  "total": 2,
  "drawing": {
    "drawingId": "2497e7d5-268f-4d51-8736-a7a621bd00d0",
    "strokes": [
      {
        "color": "#ff0000",
        "brushSize": 5,
        "points": [
          { "x": 10, "y": 20 },
          { "x": 30, "y": 40 }
        ]
      }
    ]
  },
  "votingSeconds": 1200,
  "galleryEndTimestamp": 1781450951235,
  "serverTime": 1781449751236
}
4. Round Completion Summary
Broadcast Channels: Emitted across v1:game:round_complete and v1:game:round_results_started.

Workflow Engine Sequence: Shares updated score metrics and total points when an evaluation stage finishes.

Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "round": 3,
  "standings": [
    {
      "playerId": "usr_gpb4pl4",
      "username": "Player2",
      "score": 25,
      "rank": 1
    },
    {
      "playerId": "usr_jl0cmau",
      "username": "Playewo",
      "score": 24,
      "rank": 2
    }
  ],
  "endsAt": 1781449787515,
  "serverTime": 1781449777515
}
5. Match Concluded / Final Podium
Broadcast Channels: Dispatched simultaneously over v1:game:match_over and v1:game:final_results_started.

Workflow Engine Sequence: Resolves the dynamic match cycle by establishing final rankings and presenting the match winners.

Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "podium": [
    {
      "playerId": "usr_gpb4pl4",
      "username": "Player2",
      "score": 25,
      "rank": 1
    },
    {
      "playerId": "usr_jl0cmau",
      "username": "Playewo",
      "score": 24,
      "rank": 2
    }
  ],
  "standings": [
    {
      "playerId": "usr_gpb4pl4",
      "username": "Player2",
      "score": 25,
      "rank": 1
    },
    {
      "playerId": "usr_jl0cmau",
      "username": "Playewo",
      "score": 24,
      "rank": 2
    }
  ],
  "serverTime": 1781449787528
}
6. Synchronize Room Roster
Broadcast Channels: v1:room:player_joined and v1:room:roster_updated

Workflow Engine Sequence: Updates connected clients when list memberships change due to player entries or sudden disconnects.

Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "players": [
    {
      "playerId": "usr_jl0cmau",
      "username": "Playewo",
      "isHost": true,
      "connected": true
    }
  ]
}
7. Delegate Admin Status
Broadcast Channel: v1:room:host_changed

Workflow Engine Sequence: Notifies the room when host changes occur due to host dropouts or automated migration handovers.

Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "hostId": "usr_jl0cmau",
  "username": "Playewo"
}
⚡ 3. System Exceptions and Reconnection States
1. Server Exception Gateway Channel
Event Target String: error:exception

Context: Emitted directly back to the source socket loop whenever auth validation checks or state rule requests fail.

Payload Structure:

JSON
{
  "success": false,
  "code": "ROOM_NOT_FOUND",
  "message": "Room 6KQQLK not found."
}
Application Error Code Dictionary:

MISSING_TOKEN / INVALID_TOKEN: Token handshake authentication failures.

ROOM_NOT_FOUND: Target room code is invalid or has expired from Redis.

LOCK_ACQUISITION_FAILED / MIGRATION_ERROR: Concurrency exception errors during state switches.

2. User Reconnection Handshake State
Event Target String: v1:player:reconnected

Context: Pushed directly back to a client returning from a brief connection drop to restore game context, active themes, canvas history items, and running round clocks.

Payload Structure:

JSON
{
  "roomCode": "6KQQLK",
  "status": "DRAWING",
  "round": 3,
  "prompt": "PIZZA",
  "roundEndTimestamp": 1781449691773,
  "serverTime": 1781449691789