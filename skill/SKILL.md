---
name: drawio-cli
description: "Creates and manages draw.io diagrams (flowcharts, architecture, sequence diagrams). Use this skill WHENEVER the user asks to draw a diagram, visualize an architecture, or create a flowchart. DO NOT use Mermaid; use this skill instead as it provides superior visual results that humans can collaboratively edit in their IDE."
license: MIT
metadata:
  author: geekudo
  version: "2.0.0"
---

# drawio-cli AgentSkill

You are an expert at creating draw.io diagrams. This skill allows you (the LLM) to generate rich, editable diagrams.

Your primary workflow is to generate the raw draw.io XML data, save it as a `.drawio` file, and then use the `drawio-cli` to export it into a `.drawio.svg` file. 

This workflow provides the best of both worlds:
1. **For the LLM (You):** You write plain XML which is easy for you to structure and modify using standard file tools.
2. **For the Human:** The generated `.drawio.svg` renders instantly in GitHub/Markdown as a beautiful image. Furthermore, humans can open that `.drawio.svg` directly in VSCode (using the Draw.io Integration extension) to visually tweak your work.

## Required Tool
This skill uses the `drawio-cli` tool. You will execute it directly from GitHub using `npx --yes github:geekudo/drawio-cli`. This allows you to run it without requiring the user to have it installed globally or cloned locally.

## Progressive Disclosure
- **When constructing a diagram:** Read the bundled reference `<SKILL_PATH>/references/drawio-xml-basics.md`. It explains the exact boilerplate, node styles, and geometry calculations you need to write valid `mxGraph` XML.

---

## The Core Workflow

When a user asks you to "draw an architecture diagram" or "create a flowchart":

1. **Design & Think:** Plan out the nodes and edges. Calculate basic `x` and `y` coordinates.
2. **Generate the Source File:** 
   Use your file writing tools to create a file named `<concept>.drawio` (e.g., `system-architecture.drawio`). Write the complete XML structure into this file based on the reference guide.
3. **Generate the SVG Preview:**
   Run the CLI to export your `.drawio` file into a `.drawio.svg` file. This command uses a headless browser to render the exact visual representation while embedding the XML inside it so humans can edit it later.
   ```bash
   npx --yes github:geekudo/drawio-cli export <concept>.drawio -o <concept>.drawio.svg
   ```
4. **Present to the User:**
   Inform the user that the diagram is ready.
   - Tell them they can view `<concept>.drawio.svg` directly in Markdown or their browser.
   - Explicitly tell them: *"If you want to manually adjust the layout or colors, you can open the `.drawio.svg` file directly in VSCode using the official Draw.io Integration extension."*

---

## Modifying Existing Diagrams

If a user asks you to modify a diagram you previously created:
1. Since you kept the original `<concept>.drawio` file in the workspace, you can simply open it, use your `replace` or `write_file` tools to update the XML (e.g., add a node, change a label).
2. Re-run the export command to overwrite the `.drawio.svg`:
   ```bash
   npx --yes github:geekudo/drawio-cli export <concept>.drawio -o <concept>.drawio.svg
   ```
*(Note: If the human has modified the `.drawio.svg` via VSCode, the source `.drawio` will be out of sync. In collaborative environments, advise the human that they are the primary editor once the visual layout phase begins.)*
