# Wiring Bench: implementation plan

Spec: `docs/superpowers/specs/2026-10-22-wiring-bench-design.md`

- [ ] 1. `catalog.js`: part definitions (size, pads, leads, internal joins, roles). Test: every pad id is unique per part, every internal pair and every role exists.
- [ ] 2. `netlist.js` and tests: union of terminals through wires and internal joins.
- [ ] 3. `checks.js` and tests: one test for a fully correct build and one for each classic mistake.
- [ ] 4. `lessons.js`: lessons with parts, prewired wires and goals; a test that every lesson's solution passes its goals and its starting state does not.
- [ ] 5. `workspaces.js` and tests: storage, versioning, share round trip.
- [ ] 6. SVG art for the nine parts (`parts/*.jsx`), rendered in a gallery to check each by eye.
- [ ] 7. `PartNode.jsx` and `WireEdge.jsx`.
- [ ] 8. Page: workspaces bar, lesson panel, parts tray, bench, report, power-up effects.
- [ ] 9. Browser verification at desktop and phone width; design check; build.
- [ ] 10. Commit. Push only when asked.
