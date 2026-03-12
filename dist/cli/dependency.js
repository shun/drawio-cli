"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDrawioCoreExists = checkDrawioCoreExists;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function checkDrawioCoreExists() {
    const drawioPath = path_1.default.join(__dirname, '..', 'drawio');
    return fs_1.default.existsSync(drawioPath);
}
