import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkDrawioCoreExists } from '../src/cli/dependency';
import path from 'path';
import fs from 'fs';

describe('Dependency Check', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true if drawio core exists', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    expect(checkDrawioCoreExists('/mock/root')).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/mock/root', 'tmp', 'drawio', 'src', 'main', 'webapp'));
  });

  it('should return false if drawio core does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    expect(checkDrawioCoreExists('/mock/root')).toBe(false);
  });
});
