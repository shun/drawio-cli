import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { EditorServer } from '../src/server';
import { tmpdir } from 'os';

vi.mock('../src/exporter/index', () => {
  return {
    exportXmlToSvg: vi.fn().mockImplementation(async (xml, root) => {
      return `<svg content="${xml}"></svg>`;
    })
  };
});

describe('EditorServer', () => {
  let tempDir: string;
  let server: any; // The running server instance
  let port: number;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'drawio-cli-test-'));
    // Setup fake drawio webapp dir
    fs.mkdirSync(path.join(tempDir, 'tmp/drawio/src/main/webapp'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'tmp/drawio/src/main/webapp/index.html'), 'fake drawio');
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should throw an error if the input SVG does not contain drawio metadata', async () => {
    const invalidSvgPath = path.join(tempDir, 'invalid.svg');
    fs.writeFileSync(invalidSvgPath, '<svg></svg>');

    const editorServer = new EditorServer(invalidSvgPath, tempDir);
    expect(() => editorServer.validateFile()).toThrow(/does not contain drawio metadata/i);
  });

  it('should start the server and serve the bridge page', async () => {
    const validSvgPath = path.join(tempDir, 'valid.svg');
    fs.writeFileSync(validSvgPath, '<svg content="fake-metadata"></svg>');

    const editorServer = new EditorServer(validSvgPath, tempDir);
    server = await editorServer.start(0); // 0 lets OS pick a free port
    port = (server.address() as any).port;

    const response = await fetch(`http://localhost:${port}/`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('<iframe'); // Assuming it serves the bridge page containing iframe
  });

  it('should return file metadata via GET /api/file', async () => {
    const validSvgPath = path.join(tempDir, 'valid.svg');
    fs.writeFileSync(validSvgPath, '<svg content="fake-metadata"></svg>');

    const editorServer = new EditorServer(validSvgPath, tempDir);
    server = await editorServer.start(0);
    port = (server.address() as any).port;

    const response = await fetch(`http://localhost:${port}/api/file`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('xml', 'fake-metadata'); // For drawio.svg, metadata is in the 'content' attribute
  });

  it('should update the file via POST /api/save', async () => {
    const validSvgPath = path.join(tempDir, 'valid.svg');
    fs.writeFileSync(validSvgPath, '<svg content="fake-metadata"></svg>');

    const editorServer = new EditorServer(validSvgPath, tempDir);
    server = await editorServer.start(0);
    port = (server.address() as any).port;

    const newXmlData = 'new-metadata';
    const response = await fetch(`http://localhost:${port}/api/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xml: newXmlData })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    // Assert file was updated
    const updatedContent = fs.readFileSync(validSvgPath, 'utf-8');
    // Note: in a real implementation, we might rebuild the SVG, or just overwrite the content attribute.
    // Assuming for now it updates the file content.
    expect(updatedContent).toContain('content="new-metadata"');
  });
});
