import express from 'express';
import fs from 'fs';
import path from 'path';
import { Server } from 'http';

export class EditorServer {
  private filePath: string;
  private app: express.Express;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.app = express();
    this.setupRoutes();
  }

  validateFile() {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }
    const content = fs.readFileSync(this.filePath, 'utf-8');
    // Basic check for content attribute which holds drawio metadata in drawio.svg
    if (!content.includes('content="')) {
      throw new Error(`File ${this.filePath} does not contain drawio metadata. It might be a pure image.`);
    }
  }

  private setupRoutes() {
    this.app.use(express.json({ limit: '50mb' }));

    // Serve the bridge page at root
    this.app.get('/', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>drawio-cli Edit Mode</title>
    <style>
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
        iframe { border: none; width: 100%; height: 100%; }
    </style>
</head>
<body>
    <iframe id="drawio" src="/drawio/index.html?embed=1&spin=1&modify=1&proto=json"></iframe>
    <script>
        const iframe = document.getElementById('drawio');
        
        async function fetchInitialData() {
            const res = await fetch('/api/file');
            if (res.ok) {
                const data = await res.json();
                return data.xml;
            }
            return null;
        }

        async function saveFile(xml) {
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xml })
            });
            return res.ok;
        }

        window.addEventListener('message', async (e) => {
            if (!e.data) return;
            let msg;
            try {
                msg = JSON.parse(e.data);
            } catch (err) {
                return;
            }

            if (msg.event === 'init') {
                const xml = await fetchInitialData();
                if (xml) {
                    iframe.contentWindow.postMessage(JSON.stringify({ action: 'load', xml }), '*');
                }
            } else if (msg.event === 'save') {
                const success = await saveFile(msg.xml);
                if (success) {
                    iframe.contentWindow.postMessage(JSON.stringify({ action: 'status', message: 'Saved', messageKey: '' }), '*');
                } else {
                    iframe.contentWindow.postMessage(JSON.stringify({ action: 'status', message: 'Save Failed', messageKey: '' }), '*');
                }
            } else if (msg.event === 'exit') {
                window.close();
            }
        });
    </script>
</body>
</html>
      `);
    });

    // Serve drawio static files
    const drawioPath = path.join(__dirname, '..', 'drawio');
    this.app.use('/drawio', express.static(drawioPath));

    // API to get current file metadata
    this.app.get('/api/file', (req, res) => {
      try {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const match = content.match(/content="([^"]*)"/);
        if (match && match[1]) {
          res.json({ xml: match[1] });
        } else {
          res.status(400).json({ error: 'No drawio metadata found in file' });
        }
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    });

    // API to save updated metadata
    this.app.post('/api/save', async (req, res) => {
      try {
        const newXml = req.body.xml;
        if (!newXml) {
          res.status(400).json({ error: 'No XML data provided' });
          return;
        }

        const { exportXmlToSvg } = await import('../exporter/index');
        const svgContent = await exportXmlToSvg(newXml);
        fs.writeFileSync(this.filePath, svgContent, 'utf-8');
        
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    });
  }

  start(port: number): Promise<Server> {
    return new Promise((resolve) => {
      const server = this.app.listen(port, () => {
        resolve(server);
      });
    });
  }
}
