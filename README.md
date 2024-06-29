# LoreBookReader

The [`LoreBookReader`](lorebook.ts) is a TypeScript class designed to interact with the Alt1 library for reading and interpreting lore books within RuneScape. It is based on the old Alt1 library's [`lorebook.js`](https://runeapps.org//imagelibs/lorebook.js.) This class provides methods to find lore books in images, read lines of text from these books, and compile the content into a structured format.

## Installation

Before using the `LoreBookReader`, ensure you have the Alt1 library installed and your project is set up to use TypeScript.

1. Install the Alt1 library in your project (assuming npm is used for package management):

   ```shell
   npm i -D alt1
   ```

2. Download `lorebook.ts` and `assets/index.ts` from the [latest release](https://github.com/ExInferi/LoreBookReader/releases/latest) and place them inside your app folder.

That's pretty much it. Check out the [Alt1 example app](https://github.com/skillbert/alt1minimal) for more info on how to create an app for Alt1.

## Usage

To use the `LoreBookReader`, follow these steps:

1. **Import the class** into your script:

   ```typescript
   import LoreBookReader from './path/to/lorebook';
   ```

2. **Instantiate the class**:

   ```typescript
   const reader = new LoreBookReader();
   ```

3. **Find a lore book on screen** (optional):
   If you already have a capture and want to find the lore book within it, use the `find` method. If you don't provide an image, the method will attempt to capture the entire RS window.

   ```typescript
   const imgRef = a1lib.captureHoldFullRs();
   const position = reader.find(imgRef);
   if (position) {
     console.log('Lore book found at:', position);
   } else {
     console.log('Lore book not found.');
   }
   ```

4. **Read the content of the lore book**:
   Once the lore book's position is identified, you can read its content.

   ```typescript
   try {
     const bookContent = reader.read();
     console.log('Lore book content:', bookContent);
   } catch (error) {
     console.error('Error reading lore book:', error);
   }
   ```

## Main Methods

- **`find(img?: ImgRef):`** Finds the lore book in the provided image or captures a new image if none is provided. Returns the position of the lore book or `null` if not found.

- **`readLines(imageBuffer: ImageData, x: number, y: number):`** Reads a line of text from the provided image buffer starting at the specified coordinates. Returns the text of the line if found, otherwise an empty string.

- **`read():`** Reads the content of the lore book and returns an object containing the title, page numbers, and lines of text. Throws an error if no lore book is found.

## Example app

There is a simple Alt1 example app available to have a deeper dive into using the `LoreBookReader`.  
The source can be viewed in the branch [`example-app`](https://github.com/ExInferi/LoreBookReader/tree/example-app). The app is hosted [here](https://exinferi.github.io/LoreBookReader/) with GitHub pages. Or copy and paste the following into your browser to add the app to Alt1 Toolkit:  
`alt1://addapp/https://exinferi.github.io/LoreBookReader/appconfig.json`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[@ExInferi](https://github.com/ExInferi):** For the development and maintenance of the LoreBookReader project.
- **[@skillbert](https://github.com/skillbert):** For providing the original lore book reader.

For more information on how to use the LoreBookReader and contribute to the project, please visit the project's GitHub page.
