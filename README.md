# drawio-cli

A command-line tool for exporting and managing draw.io (`.drawio`)
diagrams. It lets you convert draw.io XML files to SVG, PNG, and other
formats using a headless browser, which makes it useful for CI/CD
pipelines and automated documentation workflows.

## Installation

You can install this tool globally directly from the GitHub repository.
The repository includes the prebuilt `dist/` directory and the bundled
`dist/drawio` runtime assets, so installation does not need to clone or
build the upstream draw.io source.

```bash
npm install -g github:shun/drawio-cli
```

Once installed, you can use the command anywhere:

```bash
drawio-cli export hoge.drawio -o hoge.svg
```

### Run directly with `npx` (No installation)

If you prefer not to install it globally, you can execute it instantly
using `npx`:

```bash
npx github:shun/drawio-cli export hoge.drawio -o hoge.svg
```

## Setup for Development

If you wish to develop or modify the tool:

1. Clone the repository.
2. Run `npm install`.
3. Run `npm run build`.
4. Use `node dist/index.js` or `npm link` to test your changes.

### Maintenance: Updating the draw.io Core

This CLI packages a minimal core of the draw.io rendering engine to keep
the installation small. If you need to update the embedded draw.io
engine to the latest official version, run the following command in the
project root:

```bash
npm run update-drawio
```

This will:

1. Remove the cached local draw.io repository (`tmp/drawio`).
2. Shallow-clone the latest `main` branch from `jgraph/drawio`.
3. Extract the essential runtime files into `dist/drawio`.

After you verify the update with `npm test`, commit the updated `dist/`
directory so GitHub-based installs use the prebuilt runtime files.

## Uninstallation

If you installed the CLI globally, remove it with this command:

```bash
npm uninstall -g drawio-cli
```

If you only used `npx github:shun/drawio-cli`, there is no global
installation to remove. `npx` temporarily downloads and caches the
package. If you want a fresh download the next time you run it, clear
the npm cache:

```bash
npm cache clean --force
```

> Note: Clearing the npm cache affects all cached npm packages, not just
> this CLI.
