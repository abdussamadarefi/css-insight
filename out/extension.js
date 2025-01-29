"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
let cachedCSS = {};
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("Extension activated");
    let hoverProvider = vscode.languages.registerHoverProvider('html', {
        provideHover(document, position) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Hover provider triggered");
                const range = document.getWordRangeAtPosition(position, /class="([^"]+)"|id="([^"]+)"/);
                if (!range)
                    return;
                const text = document.getText(range);
                const classNames = text.match(/class="([^"]+)"/) ? text.match(/class="([^"]+)"/)[1].split(/\s+/) : [];
                const idNames = text.match(/id="([^"]+)"/) ? [text.match(/id="([^"]+)"/)[1]] : [];
                let hoverContent = "";
                for (let name of [...classNames, ...idNames]) {
                    let cssData = yield fetchCSS(name, document);
                    if (cssData) {
                        hoverContent += `**${name.startsWith('#') ? name : '.' + name}**\n\`\`\`css\n${cssData}\n\`\`\`\n`;
                    }
                }
                if (hoverContent) {
                    return new vscode.Hover(new vscode.MarkdownString(hoverContent));
                }
            });
        }
    });
    let completionProvider = vscode.languages.registerCompletionItemProvider('html', {
        provideCompletionItems(document, position) {
            return __awaiter(this, void 0, void 0, function* () {
                const text = document.getText();
                const linkedCSS = yield fetchLinkedCSS(document);
                const bootstrapDefinitions = yield fetchBootstrapDefinitions();
                const tailwindDefinitions = yield fetchTailwindDefinitions();
                const customDefinitions = yield fetchCustomDefinitions();
                const allClasses = Object.assign(Object.assign(Object.assign(Object.assign({}, bootstrapDefinitions), tailwindDefinitions), customDefinitions), linkedCSS);
                const completionItems = Object.keys(allClasses).map(className => {
                    const item = new vscode.CompletionItem(className, vscode.CompletionItemKind.Class);
                    item.detail = allClasses[className];
                    return item;
                });
                return completionItems;
            });
        }
    }, '"');
    context.subscriptions.push(hoverProvider, completionProvider);
    console.log("Hover and completion providers registered");
}
/**
 * @param {string} name
 * @param {vscode.TextDocument} document
 */
function fetchCSS(name, document) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cachedCSS[name]) {
            return cachedCSS[name];
        }
        try {
            const bootstrapDefinitions = yield fetchBootstrapDefinitions();
            const tailwindDefinitions = yield fetchTailwindDefinitions();
            const customDefinitions = yield fetchCustomDefinitions();
            const linkedCSS = yield fetchLinkedCSS(document);
            const cssData = bootstrapDefinitions[name] || tailwindDefinitions[name] || customDefinitions[name] || linkedCSS[name] || `/* No styles found for ${name} */`;
            cachedCSS[name] = cssData;
            return cssData;
        }
        catch (error) {
            console.error("Failed to read CSS definitions", error);
            return null;
        }
    });
}
function fetchBootstrapDefinitions() {
    return __awaiter(this, void 0, void 0, function* () {
        const bootstrapPath = path.join(__dirname, 'bootstrap-classes.json');
        return JSON.parse(fs.readFileSync(bootstrapPath, 'utf8'));
    });
}
function fetchTailwindDefinitions() {
    return __awaiter(this, void 0, void 0, function* () {
        const tailwindPath = path.join(__dirname, 'tailwind-classes.json');
        return JSON.parse(fs.readFileSync(tailwindPath, 'utf8'));
    });
}
function fetchCustomDefinitions() {
    return __awaiter(this, void 0, void 0, function* () {
        const customPath = path.join(__dirname, 'custom-classes.json');
        if (fs.existsSync(customPath)) {
            return JSON.parse(fs.readFileSync(customPath, 'utf8'));
        }
        return {};
    });
}
/**
 * @param {vscode.TextDocument} document
 */
function fetchLinkedCSS(document) {
    return __awaiter(this, void 0, void 0, function* () {
        const linkedCSS = {};
        const linkRegex = /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g;
        const text = document.getText();
        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            const url = match[1];
            if (cachedCSS[url]) {
                Object.assign(linkedCSS, cachedCSS[url]);
                continue;
            }
            try {
                const response = yield axios.get(url);
                const cssText = response.data;
                const classRegex = /\.([a-zA-Z0-9_-]+)\s*{[^}]+}/g;
                const idRegex = /#([a-zA-Z0-9_-]+)\s*{[^}]+}/g;
                let cssMatch;
                while ((cssMatch = classRegex.exec(cssText)) !== null) {
                    const className = cssMatch[1];
                    const classDefinition = cssMatch[0];
                    linkedCSS[className] = classDefinition;
                }
                while ((cssMatch = idRegex.exec(cssText)) !== null) {
                    const idName = cssMatch[1];
                    const idDefinition = cssMatch[0];
                    linkedCSS[`#${idName}`] = idDefinition;
                }
                cachedCSS[url] = linkedCSS;
            }
            catch (error) {
                console.error(`Failed to fetch CSS from ${url}`, error);
            }
        }
        return linkedCSS;
    });
}
function deactivate() { }
module.exports = {
    activate,
    deactivate
};
//# sourceMappingURL=extension.js.map