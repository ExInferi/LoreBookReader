import * as a1lib from 'alt1';
import LoreBookReader from './lorebook';
import { Book } from './lorebook';

// Webpack imports for dist files
import './index.html';
import './appconfig.json';
import './icon.png';

// Initialize the LoreBookReader
const loreReader = new LoreBookReader();

/**
* The main reading function.
* 
* Could set this to an interval to read the lore book automatically,
* but keep in mind that it will consume more resources and would require
* checks to avoid transcribing the same pages multiple times.
*/
function readLore(): void {
    let book: Book;
    let image: a1lib.ImgRef = a1lib.captureHoldFullRs();
    // Attempt to find the lore book in the captured image
    const findResult = loreReader.find(image);

    if (findResult) {
        // If the lore book is found, set its position and read its content
        loreReader.pos = findResult;
        console.debug('Lore book position set', findResult);
        book = loreReader.read();
        if (book) {
            // DEBUG: Lore book found and read
            console.debug('Lore book read', book);
            // Now that we have the book, write its content to the page
            writeLore(book);
        }
    } else {
        // DEBUG: No lore book found
        console.debug('Lore book not found');
    }
}
// Function to write the lore book content to the page
function writeLore(book: Book): void {
    if (!book) {
        // DEBUG: No lore book found
        console.debug('Lore book not found');
        return;
    }
    // Formats the book's content for display, handling special cases like paragraph breaks.
    const page: HTMLElement = document.querySelector('main');
    // HACK: title can't be captured yet
    const title = book.title?.toLocaleUpperCase() ?? '';
    const lines: string = book.lines
        .map((e: string) => {
            // Add line break after sentence
            if (/[\.\!\?]$/.test(e)) return e + '<br>';
            // Add paragraph break
            if (e === '') return '<br> <br>';
            // Skip horizontal rule
            if (e === '---') return '';
            return e;
        })
        .join(' ');
    // Replace multiple line breaks with double line break
    const text: string = lines.replace(/(<br\s*\/?>\s*){3,}/g, '<br> <br>\n');
    // Format pagenumbers
    const pageNumbers = book.pageLeft && book.pageRight ? `${book.pageLeft} - ${book.pageRight}` : book.pageLeft ?? book.pageRight ?? '';
    // Will always display it can't read the title, because it's not part of the class yet
    page.innerHTML += `<h2>${title ? title : 'Couldn\'t read title'}</h2> 
                       <h3>Page(s): ${pageNumbers}</h3>
                       <p>${text}</p>`
}


// Setup UI interactions for triggering the reading
const captureLore = document.querySelector('#captureLore') as HTMLButtonElement;
captureLore.onclick = readLore;

// Setup Alt1 hotkey for triggering the reading
a1lib.on('alt1pressed', readLore);

// Detect if the app is opened in the Alt1 browser to show 'Add app' button
if (window.alt1) {
    alt1.identifyAppUrl('./appconfig.json');
} else {
    document.querySelector('main').innerHTML = 'This app is meant to be run in Alt1 Toolkit. <a href="alt1://addapp/https://exinferi.github.io/LoreBookReader/appconfig.json">Click here to add the app.</a>';
}