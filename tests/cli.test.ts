import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCli } from '../src/cli/index';
import * as dependency from '../src/cli/dependency';
import * as exporter from '../src/exporter/index';
import { EditorServer } from '../src/server/index';
import open from 'open';

vi.mock('../src/cli/dependency');
vi.mock('../src/exporter/index');
vi.mock('../src/server/index');
vi.mock('open', () => ({
  default: vi.fn()
}));

describe('CLI Commands', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have export command', () => {
    const cli = createCli();
    const cmd = cli.commands.find((c) => c.name() === 'export');
    expect(cmd).toBeDefined();
  });

  it('should have edit command', () => {
    const cli = createCli();
    const cmd = cli.commands.find((c) => c.name() === 'edit');
    expect(cmd).toBeDefined();
  });

  it('should exit if drawio core does not exist', async () => {
    vi.mocked(dependency.checkDrawioCoreExists).mockReturnValue(false);
    const cli = createCli();
    
    cli.exitOverride(); 
    
    try {
      await cli.parseAsync(['node', 'test', 'export', 'test.xml']);
    } catch(e) {}
    
    expect(console.error).toHaveBeenCalledWith('Error: drawio core code not found in bundled dist/drawio.');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should call exportToSvg when export command is executed', async () => {
    vi.mocked(dependency.checkDrawioCoreExists).mockReturnValue(true);
    vi.mocked(exporter.exportToSvg).mockResolvedValue(undefined);
    
    const cli = createCli();
    cli.exitOverride();
    
    await cli.parseAsync(['node', 'test', 'export', 'test.drawio', '-o', 'out.svg']);
    
    expect(exporter.exportToSvg).toHaveBeenCalledWith('test.drawio', 'out.svg');
  });
  
  it('should exit with 1 if exportToSvg throws an error', async () => {
    vi.mocked(dependency.checkDrawioCoreExists).mockReturnValue(true);
    vi.mocked(exporter.exportToSvg).mockRejectedValue(new Error('Mock Error'));
    
    const cli = createCli();
    cli.exitOverride();
    
    await cli.parseAsync(['node', 'test', 'export', 'test.drawio']);
    
    expect(console.error).toHaveBeenCalledWith('Mock Error');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should start EditorServer and open browser when edit command is executed', async () => {
    vi.mocked(dependency.checkDrawioCoreExists).mockReturnValue(true);
    
    const mockValidateFile = vi.fn();
    const mockStart = vi.fn().mockResolvedValue({
      address: () => ({ port: 3000 })
    });
    
    vi.mocked(EditorServer).mockImplementation(function() {
      return {
        validateFile: mockValidateFile,
        start: mockStart
      } as any;
    } as any);

    const cli = createCli();
    cli.exitOverride();

    await cli.parseAsync(['node', 'test', 'edit', 'test.drawio.svg']);

    expect(EditorServer).toHaveBeenCalledWith('test.drawio.svg');
    expect(mockValidateFile).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalledWith(0);
    expect(open).toHaveBeenCalledWith('http://localhost:3000');
  });

  it('should exit with 1 if EditorServer throws an error', async () => {
    vi.mocked(dependency.checkDrawioCoreExists).mockReturnValue(true);
    vi.mocked(EditorServer).mockImplementation(function() {
      return {
        validateFile: vi.fn().mockImplementation(() => {
          throw new Error('Invalid file');
        }),
        start: vi.fn()
      } as any;
    } as any);

    const cli = createCli();
    cli.exitOverride();

    await cli.parseAsync(['node', 'test', 'edit', 'test.drawio.svg']);

    expect(console.error).toHaveBeenCalledWith('Invalid file');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
