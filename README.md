# CSS Insight

CSS Insight is a Visual Studio Code extension that provides a hover feature to display the CSS styles associated with Bootstrap, Tailwind, and custom classes and IDs directly in your HTML files. It also includes a completion provider that suggests CSS classes as you type.

## Features

- **Hover to View CSS**: Hover over any class or ID in your HTML files to see the associated CSS styles.
- **CSS Class Suggestions**: Get suggestions for Bootstrap, Tailwind, and custom CSS classes as you type.
- **Custom CSS Support**: Configure the extension to include your custom CSS file for hover and completion features.

## Installation

1. Install the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/vscode).
2. Open your HTML file and start using the hover and completion features.

## Configuration

You can configure the extension to include your custom CSS file by adding the following setting in your VS Code settings:

```json
"cssInsight.customCSSPath": "path/to/your/custom.css"
```

## Usage

- **Hover to View CSS**: Simply hover over any class or ID in your HTML file to see the associated CSS styles.
- **CSS Class Suggestions**: Start typing a class name in your HTML file, and the extension will suggest matching CSS classes.

## Commands

- **Hello World**: A sample command to demonstrate the extension's functionality.

## Development

To contribute to the development of this extension, follow these steps:

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Open the project in Visual Studio Code.
4. Press `F5` to start debugging the extension.

## Building and Packaging

To build and package the extension, follow these steps:

1. **Ensure Dependencies are Installed**:
   ```sh
   npm install
   ```

2. **Install VSCE (Visual Studio Code Extension Manager)**:
   ```sh
   npm install -g vsce
   ```

3. **Package the Extension**:
   ```sh
   vsce package
   ```

4. **Publish the Extension**:
   - **Login to VSCE**:
     ```sh
     vsce login <publisher-name>
     ```
   - **Publish the Extension**:
     ```sh
     vsce publish
     ```

## License

This extension is licensed under the [MIT License](LICENSE).

## Contact

For any questions or feedback, please contact [abdussamadarefi@gmail.com](mailto:abdussamadarefi@gmail.com).
