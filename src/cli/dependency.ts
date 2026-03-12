import fs from 'fs';
import path from 'path';

export function checkDrawioCoreExists(): boolean {
  const drawioPath = path.join(__dirname, '..', 'drawio');
  return fs.existsSync(drawioPath);
}
