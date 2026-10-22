# Wiring Bench: design

Replaces the Wiring Simulator at `/simulator`. Approved in chat on 2026-10-22.

## Goal

A practice bench where students solder wires between realistic parts of an FPV drone, are told exactly what is wrong and why, and can keep practising in saved workspaces. Scope is the wiring practice bench only. A parts planner (pick parts, compatibility, price) is a separate, later project.

## Experience

- **Two modes.** *Lessons* load a fixed set of parts, tick off goals live and offer hints. *Free build* lets the student place any part.
- **Screen.** Left: lesson panel (goals, hints, progress) or parts tray. Centre: pan-and-zoom bench. Bottom of the bench: the check report. Top: workspace name, saved state, New, Open, Duplicate, Rename, Delete, Share, Reset.
- **Checking.** "Power up" runs the checks. Failures name the part and explain why in plain words, with smoke on the part that would burn. Success spins the propellers in the direction the wiring gives.
- **Touch.** Parts can be dragged from the tray or tapped to add to the bench.

## Parts

Each part is a detailed top-view SVG drawn from common standard layouts (30.5 mm stack boards, XT60, 2306 motor). Pad names follow Betaflight conventions. They are labelled "standard layout", not any brand's exact pinout.

| Part | Pads and leads |
|---|---|
| 4-in-1 ESC | BAT+, BAT-, CAP+, CAP-, motor pads M1 to M4 (3 each), 8-pin signal row (BAT, G, CUR, TLM, M1 to M4) |
| F405 flight controller | ESC row (8), UART1 and UART3 groups (5V, G, T, R), VTX group (VTX, G, 9V), CAM group (CAM, G, 5V) |
| 2306 motor | 3 tinned leads |
| LiPo 4S with XT60 lead | red and black tinned leads |
| Capacitor 35 V 1000 uF | long (+) and short (-) leads, stripe on the negative side |
| ELRS receiver | 5V, G, TX, RX leads |
| Analog VTX | power, G, video-in leads |
| FPV camera | power, G, video leads |
| GPS | 5V, G, TX, RX leads |

Leads are part of the art and end in a tinned tip the student drags to a pad. Wires are curved, drawn in the gauge of the lead, and get a solder blob at each end.

## Architecture

```
src/pages/Simulator/
  index.jsx              page: workspace state, React Flow, panels
  Simulator.module.css   layout and chrome (design tokens)
  bench/
    catalog.js           part definitions: size, pads (position, role, group), leads, internal connections
    netlist.js           wires -> electrical nets (union-find over terminals)
    checks.js            nets -> report (critical, warning, ok) and motor spin directions
    lessons.js           lessons: parts, prewired wires, goals, hints
    workspaces.js        localStorage workspaces and progress, share-link encode and decode
    PartNode.jsx         React Flow node: SVG art plus a Handle over every pad and lead
    WireEdge.jsx         React Flow edge: gauge, sag, shine, solder blobs
    parts/*.jsx          one SVG art component per part
    *.test.mjs           node:test unit tests for netlist, checks, workspaces
```

`catalog.js`, `netlist.js`, `checks.js`, `lessons.js` and `workspaces.js` are plain JS with no React so they can be tested with `node --test`. React Flow stays for pan, zoom, drag and connect (`ConnectionMode.Loose`, so any pad can join any pad).

## Data flow

1. Terminals are `nodeId:padId`. Each wire joins two terminals. A part's `internal` list joins pads that are the same copper on the real board (for example ESC BAT+, CAP+ and the BAT signal pin).
2. `netlist` unions terminals into nets. Each pad has a `role` (`bat+`, `bat-`, `vbat`, `gnd`, `5v`, `9v`, `uart-tx:1`, `uart-rx:1`, `motor:M1`, `video-in` ...).
3. `checks` reads the roles present in each net and reports:
   - short (two rails in one net), reversed battery, capacitor the wrong way round
   - supply voltage on a pad that cannot take it (battery voltage on VTX or receiver)
   - each motor: all three leads on three different pads of one ESC motor group; spin direction from the permutation parity of lead to pad order, compared with the expected direction as a warning (fixable in software)
   - flight controller to ESC: BAT, G, M1 to M4
   - UART devices: power, ground, and TX to the flight controller RX of the same UART and RX to its TX
   - camera and VTX: power, ground, video path to the flight controller CAM pad or the VTX video-in
4. A lesson is complete when every check id in its `goals` passes with no critical failure. Progress (attempts, best time, stars) is stored per lesson.

## Workspaces

Autosaved in `localStorage` (versioned keys, every access in try/catch so private windows still work). Free build keeps many named workspaces. Share encodes the build as compact JSON in base64url in the URL hash (`/simulator#b=...`); opening such a link makes a new workspace. No server and no login.

## Error handling

- Storage unavailable: the bench works and says changes are not saved.
- Share link malformed or too old: ignored with a short message, empty workspace opens.
- A saved workspace that references an unknown part or pad is loaded without that part or wire.

## Testing

- Unit tests (`node --test`) for the netlist and every check: a correct build passes, and each classic mistake is detected (reversed battery, short, reversed capacitor, TX to TX, camera power on battery voltage, a motor wire missing, a motor spread over two groups).
- Workspace tests: save, load, version mismatch, share round trip.
- Browser: render each part, add and wire parts by script, run the checks, and screenshot at desktop and phone width.

## Out of scope

Parts planner, short links stored on a server, student accounts, part rotation, brand-specific pinouts.
