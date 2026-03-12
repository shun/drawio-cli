"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const cli_1 = require("./cli");
const projectRoot = path_1.default.resolve(__dirname, '..');
const cli = (0, cli_1.createCli)(projectRoot);
cli.parse(process.argv);
//# sourceMappingURL=index.js.map