import { Command } from 'commander';
import { checkDrawioCoreExists } from './dependency';

export function createCli() {
  const program = new Command();

  program
    .name('drawio-cli')
    .description('CLI tool to export and edit drawio files using local drawio core')
    .version('1.0.0')
    .hook('preAction', () => {
      if (!checkDrawioCoreExists()) {
        console.error('Error: drawio core code not found in bundled dist/drawio.');
        process.exit(1);
      }
    });

  program
    .command('export')
    .description('Export a drawio file to SVG')
    .argument('<input>', 'input file path')
    .option('-o, --output <output>', 'output file path')
    .action(async (input, options) => {
      const { exportToSvg } = await import('../exporter/index');
      try {
        const outputPath = options.output || input.replace(/\.[^/.]+$/, "") + '.drawio.svg';
        await exportToSvg(input, outputPath);
        console.log(`Successfully exported to ${outputPath}`);
      } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });

  program
    .command('edit')
    .description('Edit a drawio.svg file in the browser')
    .argument('<input>', 'input drawio.svg file path')
    .action(async (input) => {
      try {
        const { EditorServer } = await import('../server/index');
        const open = (await import('open')).default;
        
        const server = new EditorServer(input);
        server.validateFile();
        
        const listener = await server.start(0);
        const address = listener.address() as any;
        const url = `http://localhost:${address.port}`;
        console.log(`Server running at ${url}`);
        await open(url);
      } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });

  return program;
}
