const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios').default;

let cachedCSS = {};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("CSS Insight extension activated");

    let hoverProvider = vscode.languages.registerHoverProvider(
        ['html', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
        {
            /**
             * @param {vscode.TextDocument} document
             * @param {vscode.Position} position
             * @returns {Promise<vscode.Hover | undefined>}
             */
            async provideHover(document, position) {
                console.log("Hover provider triggered");
                const range = document.getWordRangeAtPosition(position, /className="([^"]+)"|class="([^"]+)"|id="([^"]+)"/);
                if (!range) return;

                const text = document.getText(range);
                const classNames = text.match(/class(Name)?="([^"]+)"/) ? text.match(/class(Name)?="([^"]+)"/)[2].split(/\s+/) : [];
                const idNames = text.match(/id="([^"]+)"/) ? [text.match(/id="([^"]+)"/)[1]] : [];

                let hoverContent = "";
                for (let name of [...classNames, ...idNames]) {
                    let cssData = await fetchCSS(name, document);
                    if (cssData) {
                        hoverContent += `**${name.startsWith('#') ? name : '.' + name}**\n\`\`\`css\n${cssData}\n\`\`\`\n`;
                    }
                }

                if (hoverContent) {
                    return new vscode.Hover(new vscode.MarkdownString(hoverContent));
                }
            }
        }
    );

    let completionProvider = vscode.languages.registerCompletionItemProvider(
        ['html', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
        {
            /**
             * @param {vscode.TextDocument} document
             * @param {vscode.Position} position
             * @returns {Promise<vscode.CompletionItem[]>}
             */
            async provideCompletionItems(document, position) {
                const text = document.getText();
                const linkedCSS = await fetchLinkedCSS(document);
                const bootstrapDefinitions = await fetchBootstrapDefinitions();
                const tailwindDefinitions = await fetchTailwindDefinitions();
                const customDefinitions = await fetchCustomDefinitions();

                const allClasses = { ...bootstrapDefinitions, ...tailwindDefinitions, ...customDefinitions, ...linkedCSS };
                const completionItems = Object.keys(allClasses).map(className => {
                    const item = new vscode.CompletionItem(className, vscode.CompletionItemKind.Class);
                    item.detail = allClasses[className];
                    return item;
                });

                return completionItems;
            }
        },
        '"'
    );

    context.subscriptions.push(hoverProvider, completionProvider);
    console.log("Hover and completion providers registered");
}

/**
 * @param {string} name
 * @param {vscode.TextDocument} document
 * @returns {Promise<string | null>}
 */
async function fetchCSS(name, document) {
    if (cachedCSS[name]) {
        return cachedCSS[name];
    }

    try {
        const bootstrapDefinitions = await fetchBootstrapDefinitions();
        const tailwindDefinitions = await fetchTailwindDefinitions();
        const customDefinitions = await fetchCustomDefinitions();
        const linkedCSS = await fetchLinkedCSS(document);

        const cssData = bootstrapDefinitions[name] || tailwindDefinitions[name] || customDefinitions[name] || linkedCSS[name] || `/* No styles found for ${name} */`;
        cachedCSS[name] = cssData;
        return cssData;
    } catch (error) {
        console.error("Failed to read CSS definitions", error);
        return null;
    }
}

/**
 * @returns {Promise<Object<string, string>>}
 */
async function fetchBootstrapDefinitions() {
    const bootstrapPath = path.join(__dirname, 'bootstrap-classes.json');
    const data = await fs.readFile(bootstrapPath, 'utf8');
    return JSON.parse(data);
}

/**
 * @returns {Promise<Object<string, string>>}
 */
async function fetchTailwindDefinitions() {
    const tailwindPath = path.join(__dirname, 'tailwind-classes.json');
    const data = await fs.readFile(tailwindPath, 'utf8');
    return JSON.parse(data);
}

/**
 * @returns {Promise<Object<string, string>>}
 */
async function fetchCustomDefinitions() {
    const customPath = path.join(__dirname, 'custom-classes.json');
    if (await fs.access(customPath).then(() => true).catch(() => false)) {
        const data = await fs.readFile(customPath, 'utf8');
        return JSON.parse(data);
    }
    return {};
}

/**
 * @param {vscode.TextDocument} document
 * @returns {Promise<Object<string, string>>}
 */
async function fetchLinkedCSS(document) {
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
            const response = await axios.get(url);
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
        } catch (error) {
            console.error(`Failed to fetch CSS from ${url}`, error);
        }
    }

    return linkedCSS;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
