"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorServer = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EditorServer {
    constructor(filePath) {
        this.filePath = filePath;
        this.app = (0, express_1.default)();
        this.setupRoutes();
    }
    validateFile() {
        if (!fs_1.default.existsSync(this.filePath)) {
            throw new Error(`File not found: ${this.filePath}`);
        }
        const content = fs_1.default.readFileSync(this.filePath, 'utf-8');
        // Basic check for content attribute which holds drawio metadata in drawio.svg
        if (!content.includes('content="')) {
            throw new Error(`File ${this.filePath} does not contain drawio metadata. It might be a pure image.`);
        }
    }
    setupRoutes() {
        this.app.use(express_1.default.json({ limit: '50mb' }));
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
        const drawioPath = path_1.default.join(__dirname, '..', 'drawio');
        this.app.use('/drawio', express_1.default.static(drawioPath));
        // API to get current file metadata
        this.app.get('/api/file', (req, res) => {
            try {
                const content = fs_1.default.readFileSync(this.filePath, 'utf-8');
                const match = content.match(/content="([^"]*)"/);
                if (match && match[1]) {
                    res.json({ xml: match[1] });
                }
                else {
                    res.status(400).json({ error: 'No drawio metadata found in file' });
                }
            }
            catch (err) {
                res.status(500).json({ error: String(err) });
            }
        });
        // API to save updated metadata
        this.app.post('/api/save', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newXml = req.body.xml;
                if (!newXml) {
                    res.status(400).json({ error: 'No XML data provided' });
                    return;
                }
                const { exportXmlToSvg } = yield Promise.resolve().then(() => __importStar(require('../exporter/index')));
                const svgContent = yield exportXmlToSvg(newXml);
                fs_1.default.writeFileSync(this.filePath, svgContent, 'utf-8');
                res.json({ success: true });
            }
            catch (err) {
                res.status(500).json({ error: String(err) });
            }
        }));
    }
    start(port) {
        return new Promise((resolve) => {
            const server = this.app.listen(port, () => {
                resolve(server);
            });
        });
    }
}
exports.EditorServer = EditorServer;
