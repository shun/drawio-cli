# drawio-cli

A command-line tool for exporting and managing draw.io (`.drawio`) diagrams. It allows you to convert draw.io XML files to SVG, PNG, and other formats using a headless browser, making it perfect for CI/CD pipelines and automated documentation workflows.

## Installation

You can install this tool globally directly from the GitHub repository. By fetching the pre-built `dist/` directory, the installation is fast and does not require compiling the draw.io source locally.

```bash
npm install -g github:geekudo/drawio-cli
```

Once installed, you can use the command anywhere:

```bash
drawio-cli export hoge.drawio -o hoge.svg
```

### Run directly with `npx` (No installation)

If you prefer not to install it globally, you can execute it instantly using `npx`:

```bash
npx github:geekudo/drawio-cli export hoge.drawio -o hoge.svg
```

## Setup for Development

If you wish to develop or modify the tool:

1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Use `node dist/index.js` or `npm link` to test your changes.

### Maintenance: Updating the draw.io Core

This CLI packages a minimal core of the draw.io rendering engine to keep the installation small (~3MB). If you need to update the embedded draw.io engine to the latest official version, run the following command in the project root:

```bash
npm run update-drawio
```

This will:
1. Remove the cached local draw.io repository (`tmp/drawio`).
2. Shallow-clone the latest `main` branch from `jgraph/drawio`.
3. Extract and compress only the essential rendering objects into the `dist/drawio` directory.

After verifying the update (run `npm test`), you should commit the updated `dist/` directory.
