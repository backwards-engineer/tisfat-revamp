# TISFAT Reimagined

A reimagining of the classic TISFAT Delphi animation editor for your local browser. Requires Node.js 18 or later; no packages or account required.

Run `npm start` from this directory, then open http://127.0.0.1:4173. The server binds only to your computer. Stop with Ctrl+C. On Windows, double-click `start.bat` to launch.

Pose figures by dragging joints; the orange root moves the figure. Select a new timeline frame and edit to create a keyframe automatically. Add custom limbs by selecting an existing joint with the Add limb tool and clicking to place its child. Use layers for figures, lines, rectangles, ellipses, text, and imported images. Properties and joint coordinates tween between keyframes; choose linear, smooth, or hold interpolation. Includes onion skins, layer visibility/order, undo/redo, playback, project downloads/import, local autosave, PNG frame export, and WebM animation export.

The example opens on first launch. Projects use versioned `.tisfat.json` files, not Delphi `.fat` files. Download a project backup before clearing browser data. WebM export runs in real time; keep the tab active while exporting. PNG/WebM exports exclude grid, onion skins, and editing handles. Imported animated images render as browser images rather than timeline-synchronized media.

This remake follows the layers/keyframes/tweening concepts in `main.pas`, `movieobject.pas`, and `stickjoint.pas`. It is a new implementation, not a full source translation. Legacy FAT import, physics/Create-A-Scene, sound, video tracing, curved figures, bitmap limb attachments, and GIF/AVI/Flash output are not implemented.

Run `npm test` for animation model checks.

## Fills, limb locking, and selection

Select a rectangle, ellipse, or figure to enable Solid fill and choose a separate Fill color in Object Properties (figures fill the head). Fill color, opacity, and outline color tween between keyframes and appear in PNG/WebM exports.

Lock limb lengths is enabled by default for each figure. Posing rotates a joint and its descendants about its parent, preserving all segment lengths. Locked tweening interpolates angles to prevent limbs shrinking between poses. Turn the lock off to stretch intentionally; lengths deliberately stored in different keyframes still interpolate. Existing projects retain their poses and receive the new controls on load.

The selected object has a blue dashed outline and visible handles, even behind other objects. The active joint has an amber ring and a name. In Add limb mode, click a numbered joint to choose the parent, then follow the dashed preview and click to attach. The new endpoint becomes the parent for the next limb. Press Escape to clear the parent. New limbs are added across all keyframes to keep the skeleton topology consistent.

The default/example project is Kung fu · Tiger & Crane: two figures exchanging punches, blocks, kicks, and reactive head punches and body kicks over a seamless 192-frame loop at 24 FPS. Use Load kung fu fight to reload it. New still starts an empty scene; saved browser projects continue to reopen automatically.
