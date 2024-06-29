import * as a1lib from 'alt1/base';
import { ImgRef } from 'alt1/base';
import * as OCR from 'alt1/ocr';
import { font, sourceimg } from './assets';


// Lorebook detection settings
/** The x-coordinate offset for the lore book detection. */
const OFFSET_X: number = 192;
/** The y-coordinate offset for the lore book detection. */
const OFFSET_Y: number = 290;
/** The width of the lore book detection area. */
const WIDTH: number = 450;
/** The height of the lore book detection area. */
const HEIGHT: number = 320;
/** The y-coordinate (base) position of the page numbers. */
const PAGE_NUM_POS: number = 309;
/** The x-coordinate position of the left page number. */
const PAGE_LEFT: number = 12;
/** The x-coordinate position of the right page number. */
const PAGE_RIGHT: number = 424;


/**
 * Represents a lore book with its title, page numbers, and lines of text.
 */
export type Book = {
  /** The title of the book. (Not implemented yet) */
  title: string;
  /** The left page number. */
  pageLeft: string;
  /** The right page number. */
  pageRight: string;
  /** An array of lines of text in a book. */
  lines: string[];
  /** The hash value of the book's title for unique identification. */
  titleHash: number;
};

/**
 * Rework of the lore book reader to use the latest Alt1 library.
 * 
 * @class LoreBookReader
 * 
 * Based on the original lore book reader at https://runeapps.org//imagelibs/lorebook.js
 */
export default class LoreBookReader {
  pos: a1lib.RectLike | null = null;
  bookimg: ImageData = sourceimg;

  /**
   * Finds the lore book in the provided image.
   * @param {ImgRef} img - The image to search for the lore book. If not provided, a screenshot will be captured.
   * @returns The position of the lore book if found, otherwise null.
   */
  find(img?: ImgRef) {
    // If no image is provided, capture the full RuneScape screen
    if (!img) { img = a1lib.captureHoldFullRs(); }

    // Search for the lore book image within the provided/captured image
    const pos = img.findSubimage(this.bookimg);
    // If no matches are found, return null indicating the lore book is not present
    if (pos.length === 0) { return null; }
    // Warn if more than one match is found, which could indicate multiple lore books or false positives
    if (pos.length > 1) { console.warn('More than one possible lore book found'); }

    // Adjust the found position by predefined offsets to pinpoint the exact location of the lore book
    // and set the dimensions (width and height) of the detected area
    this.pos = { x: pos[0].x - OFFSET_X, y: pos[0].y - OFFSET_Y, width: WIDTH, height: HEIGHT };
    // Return the adjusted position of the lore book
    return this.pos;
  }

  /**
   * Reads a line of text from the provided image buffer.
   * @param {ImageData} imageBuffer - alt1.capture ImageData based on position to read from.
   * @param {number} x - The x-coordinate of the starting pixel.
   * @param {number} y - The y-coordinate of the starting pixel.
   * @returns The text of the line if found, otherwise an empty string.
   */
  readLines(imageBuffer: ImageData, x: number, y: number) {
      let detectedColor: any = null;
      // Define the acceptable ranges for each color component
      const colorRanges = [
        [169, 248], // Red range
        [117, 224], // Green range
        [62, 177]   // Blue range
      ];

      // Loop through a set of pixels horizontally to find a color match
      for (let pixelOffset = 0; pixelOffset < 40; pixelOffset++) {
        // Calculate the index for the current pixel in the image data array
        const pixelIndex = (x + pixelOffset) * 4 + (y - 2) * 4 * imageBuffer.width;
        // Extract the color components (R, G, B) of the current pixel
        const colorComponents = [
          imageBuffer.data[pixelIndex],    // Red component
          imageBuffer.data[pixelIndex + 1],// Green component
          imageBuffer.data[pixelIndex + 2] // Blue component
        ];
        // Check if any color component is out of its acceptable range
        const isOutOfRange = colorComponents.some((component, index) => {
          const range = colorRanges[index];
          return component < range[0] || component > range[1];
        });
        // If a color component is out of range, store the color and exit the loop
        if (isOutOfRange) {
          detectedColor = colorComponents;
          break;
        }
      }
      // If no color within the specified ranges was detected, return an empty string
      if (!detectedColor) {
        return '';
      }
      // Use OCR to read the line at the detected color's position, returning the text if found
      const line = OCR.readLine(imageBuffer, font, detectedColor, x, y, true, false);
      return line ? line.text : '';
    }

  /**
   * Reads the content of the lore book.
   * @returns {Book} An object containing the title, page numbers, and lines of text from the lore book.
   * @throws An error if no lore book is found.
   */
  read(): Book {
    if (!this.pos) {
      throw new Error('No lore book found');
    }
    const imageBuffer: ImageData = a1lib.capture(this.pos);
    // DEBUG: Show overlay of the captured image
    // imageBuffer.show();
    if (!imageBuffer) {
      throw new Error('Failed to capture lore book image');
    }
    // Compares the captured image (imageBuffer) with a partial book image (sourceimg)
    // at specified offsets (OFFSET_X, OFFSET_Y) to ensure the correct match.
    const comparison: number = a1lib.simpleCompare(imageBuffer, sourceimg, OFFSET_X, OFFSET_Y);
    if (comparison !== 0) {
      if (comparison === Infinity) { // No match found
        return;
      }
      console.warn('The lore book match is not accurate. Please check if the lore book is fully visible or adjust the image capture settings.');
      // DEBUG: Show the difference between the captured image and the lore book image
      // console.debug(a1lib.simpleCompare(imageBuffer, sourceimg, OFFSET_X, OFFSET_Y));
      // sourceimg.show();
    }
    // Initializes an object to store text data extracted from the lore book.
    const textData: Book = {
      title: '',
      pageLeft: '',
      pageRight: '',
      lines: [],
      titleHash: 0
    };
    // Calculates a hash for the title area of the image to uniquely identify it.
    textData.titleHash = imageBuffer.getPixelHash(new a1lib.Rect(110, 8, 200, 8));

    /* // CANTFIX: Not able to read the title, as the font for titles hasn't been implemented into the Alt1 API yet (I think?) 
    alt1.addOCRFont('heavy', heavy);
    const img = a1lib.captureHold(this.pos.x, this.pos.y, WIDTH, HEIGHT)
    textData.title = alt1.bindReadColorString(img.handle, 'heavy', a1lib.mixColor(255, 211, 63), 220, 18) || '';
     */

    // Reads the page numbers from the lore book image.
    // The last two booleans in the function calls indicate reading direction.
    // First: forward (left to right), Second: backward (right to left).
    const leftPage = OCR.readLine(imageBuffer, font, [0, 0, 0], PAGE_LEFT, PAGE_NUM_POS, true, false);
    const rightPage = OCR.readLine(imageBuffer, font, [0, 0, 0], PAGE_RIGHT, PAGE_NUM_POS, false, true);

    textData.pageLeft = leftPage.text ?? '?';
    textData.pageRight = rightPage.text ?? '?';

    textData.lines = [];
    for (let lineIndex = 0; lineIndex < 15; lineIndex++) {
      textData.lines.push(this.readLines(imageBuffer, 0, 58 + 16 * lineIndex));
    }
    for (let lineIndex = 0; lineIndex < 15; lineIndex++) {
      textData.lines.push(this.readLines(imageBuffer, 238, 58 + 16 * lineIndex));
    }
    // DEBUG: Log the content of the lore book
    //console.debug('Lore book content:', textData)
    return textData;
  }
}
