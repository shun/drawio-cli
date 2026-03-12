import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToSvg } from '../src/exporter/index';
import fs from 'fs';
import { chromium } from 'playwright';

vi.mock('fs');
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(),
  },
}));

describe('Exporter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input Validation', () => {
    it('should throw an error if the input file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      await expect(exportToSvg('missing.drawio', 'output.svg')).rejects.toThrow('Input file does not exist: missing.drawio');
    });

    it('should throw an error if the input file has an invalid extension', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      await expect(exportToSvg('invalid.txt', 'output.svg')).rejects.toThrow('Invalid input file format. Expected .drawio, .xml, or .svg');
    });
  });

  describe('Playwright Export', () => {
    it('should extract SVG using Playwright and save it', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('<xml>mock drawio content</xml>');
      
      const mockPage = {
        goto: vi.fn().mockResolvedValue(null),
        evaluate: vi.fn().mockResolvedValue('<svg>mock svg</svg>'),
        waitForFunction: vi.fn().mockResolvedValue(null),
        on: vi.fn(),
      };
      
      const mockBrowser = {
        newPage: vi.fn().mockResolvedValue(mockPage),
        close: vi.fn().mockResolvedValue(null),
      };
      
      vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as any);

      await exportToSvg('input.drawio', 'output.svg');

      expect(chromium.launch).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith(expect.stringContaining('export3.html'));
      expect(fs.writeFileSync).toHaveBeenCalledWith('output.svg', '<svg>mock svg</svg>', 'utf-8');
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
