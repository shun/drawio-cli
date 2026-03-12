# drawio-cli

A command-line tool for exporting and managing draw.io (`.drawio`) diagrams. It allows you to convert draw.io XML files to SVG, PNG, and other formats using a headless browser, making it perfect for CI/CD pipelines and automated documentation workflows.

## Installation

You can install this tool globally directly from the GitHub repository. By fetching the pre-built `dist/` directory, the installation is fast and does not require compiling the draw.io source locally.

```bash
npm install -g github:shun/drawio-cli
```

Once installed, you can use the command anywhere:

```bash
drawio-cli export hoge.drawio -o hoge.svg
```

### Run directly with `npx` (No installation)

If you prefer not to install it globally, you can execute it instantly using `npx`:

```bash
npx github:shun/drawio-cli export hoge.drawio -o hoge.svg
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
\n## Uninstallation\n\nIf you installed the CLI globally via `npm install -g`, you can remove it with:\n\n```bash\nnpm uninstall -g drawio-cli.gemini\n```\n\nIf you only used `npx github:shun/drawio-cli`, there is no global installation to remove. `npx` temporarily downloads and caches the package. If you wish to clear the `npx` cache to force a fresh download next time, you can clear the npm cache:\n\n```bash\nnpm cache clean --force\n```\n\n*Note: Clearing the npm cache will affect all cached npm packages, not just this CLI.*\n
