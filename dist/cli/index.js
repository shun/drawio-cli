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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCli = createCli;
const commander_1 = require("commander");
const dependency_1 = require("./dependency");
function createCli() {
    const program = new commander_1.Command();
    program
        .name('drawio-cli')
        .description('CLI tool to export and edit drawio files using local drawio core')
        .version('1.0.0')
        .hook('preAction', () => {
        if (!(0, dependency_1.checkDrawioCoreExists)()) {
            console.error('Error: drawio core code not found in bundled dist/drawio.');
            process.exit(1);
        }
    });
    program
        .command('export')
        .description('Export a drawio file to SVG')
        .argument('<input>', 'input file path')
        .option('-o, --output <output>', 'output file path')
        .action((input, options) => __awaiter(this, void 0, void 0, function* () {
        const { exportToSvg } = yield Promise.resolve().then(() => __importStar(require('../exporter/index')));
        try {
            const outputPath = options.output || input.replace(/\.[^/.]+$/, "") + '.drawio.svg';
            yield exportToSvg(input, outputPath);
            console.log(`Successfully exported to ${outputPath}`);
        }
        catch (err) {
            console.error(err instanceof Error ? err.message : String(err));
            process.exit(1);
        }
    }));
    program
        .command('edit')
        .description('Edit a drawio.svg file in the browser')
        .argument('<input>', 'input drawio.svg file path')
        .action((input) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { EditorServer } = yield Promise.resolve().then(() => __importStar(require('../server/index')));
            const open = (yield Promise.resolve().then(() => __importStar(require('open')))).default;
            const server = new EditorServer(input);
            server.validateFile();
            const listener = yield server.start(0);
            const address = listener.address();
            const url = `http://localhost:${address.port}`;
            console.log(`Server running at ${url}`);
            yield open(url);
        }
        catch (err) {
            console.error(err instanceof Error ? err.message : String(err));
            process.exit(1);
        }
    }));
    return program;
}
