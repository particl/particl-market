import { ImageProcessing, MEDIUM_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE } from '../../../src/core/helpers/ImageProcessing';
import { ImageTriplet } from '../../../src/core/helpers/ImageTriplet';

import images = require('images');
import piexif = require('piexifjs');

describe('ShippingCountries', () => {
    test('Test data should have metadata before processing', () => {
        expect.assertions(0);
        const rawImage = ImageProcessing.PIEXIF_JPEG_START_STR + this.initialJpeg;
        try {
            const processedImage: ImageTriplet = piexif.remove(rawImage);
        } catch ( ex ) {
            console.log('ex = ' + ex);
            expect(ex).not.toBe('Exif not found.');
            expect(false).toBe(true);
        }
    });

    test('prepareImageForSaving() should complain of invalid format', () => {
        expect.assertions(1);
        try {
            const processedImage: ImageTriplet = ImageProcessing.prepareImageForSaving(this.brokenJpeg);
        } catch ( ex ) {
            expect(ex.toString()).toBe('Error: Image data was an unknown format. Supports: JPEG, PNG, GIF.');
        }
    });

    test('prepareImageForSaving() should remove metadata', () => {
        expect.assertions(2);
        const processedImage: ImageTriplet = ImageProcessing.prepareImageForSaving(this.initialJpeg);
        expect(processedImage.big).not.toBe(null);

        const rawImage = ImageProcessing.PIEXIF_JPEG_START_STR + processedImage.big;
        try {
            const retval = piexif.remove(rawImage);
        } catch ( ex ) {
            expect(ex).toBe('Exif not found.');
        }
    });

    test('prepareImageForSaving() should resize tall(er than wide, by the ratio in the static bounds) image to reach MAX height', () => {
        expect.assertions(9);
        const rawImage = this.milkcatTall;
        let processedImage: ImageTriplet;
        try {
            processedImage = ImageProcessing.prepareImageForSaving(rawImage);
        } catch ( ex ) {
            console.log('resizeTallTest(): 000' + ex);
            return;
        }

        try {
            expect(processedImage.big).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.big, 'base64');
            const imageBuffer = images(dataBuffer);

            const dataBufferOriginal = Buffer.from(rawImage, 'base64');
            const imageBufferOriginal = images(dataBufferOriginal);

            expect(imageBuffer.height()).toBe(imageBufferOriginal.height());
            expect(imageBuffer.width()).toBe(imageBufferOriginal.width());
        } catch ( ex ) {
            console.log('resizeTallTest(): 100: ' + ex);
        }

        try {
            expect(processedImage.medium).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.medium, 'base64');
            const imageBuffer = images(dataBuffer);
            expect(imageBuffer.height()).toBe(MEDIUM_IMAGE_SIZE.height);
            expect(imageBuffer.width()).toBeLessThanOrEqual(MEDIUM_IMAGE_SIZE.width);
        } catch ( ex ) {
            console.log('resizeTallTest(): 200: ' + ex);
        }
        try {
            expect(processedImage.thumbnail).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.thumbnail, 'base64');
            const imageBuffer = images(dataBuffer);
            expect(imageBuffer.height()).toBe(THUMBNAIL_IMAGE_SIZE.height);
            expect(imageBuffer.width()).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.width);
        } catch ( ex ) {
            console.log('resizeTallTest(): 300: ' + ex);
        }
    });

    test('prepareImageForSaving() should resize wide(er than tall, by the ratio in the static bounds) image to reach MAX width', () => {
        expect.assertions(9);
        const rawImage = this.milkcatWide;
        let processedImage: ImageTriplet;
        try {
            processedImage = ImageProcessing.prepareImageForSaving(rawImage);
        } catch ( ex ) {
            console.log('resizeWideTest(): 000' + ex);
            return;
        }

        try {
            expect(processedImage.big).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.big, 'base64');
            const imageBuffer = images(dataBuffer);

            const dataBufferOriginal = Buffer.from(rawImage, 'base64');
            const imageBufferOriginal = images(dataBufferOriginal);

            expect(imageBuffer.width()).toBe(imageBufferOriginal.width());
            expect(imageBuffer.height()).toBe(imageBufferOriginal.height());
        } catch ( ex ) {
            console.log('resizeWideTest(): 100: ' + ex);
        }

        try {
            expect(processedImage.medium).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.medium, 'base64');
            const imageBuffer = images(dataBuffer);
            expect(imageBuffer.width()).toBe(MEDIUM_IMAGE_SIZE.width);
            expect(imageBuffer.height()).toBeLessThanOrEqual(MEDIUM_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideTest(): 200: ' + ex);
        }
        try {
            expect(processedImage.thumbnail).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.thumbnail, 'base64');
            const imageBuffer = images(dataBuffer);
            expect(imageBuffer.width()).toBe(THUMBNAIL_IMAGE_SIZE.width);
            expect(imageBuffer.height()).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideTest(): 300: ' + ex);
        }
    });


    test('prepareImageForSaving() should resize tall(er than wide, by the ratio in the static bounds) image to thumbnail size', () => {
        expect.assertions(3);
        const rawImage = this.milkcatTall;
        let resizedImage: string;
        try {
            resizedImage = ImageProcessing.resizeImage(rawImage, THUMBNAIL_IMAGE_SIZE.width, THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeTallToThumb(): 000' + ex);
            return;
        }

        try {
            expect(resizedImage).not.toEqual(null);
            const dataBuffer = Buffer.from(resizedImage, 'base64');
            const imageBuffer = images(dataBuffer);
            expect(imageBuffer.height()).toBe(THUMBNAIL_IMAGE_SIZE.height);
            expect(imageBuffer.width()).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.width);
        } catch ( ex ) {
            console.log('resizeTallToThumb(): 100: ' + ex);
        }
    });


    test('prepareImageForSaving() should resize wide(er than tall, by the ratio in the static bounds) image to thumbnail size', () => {
        expect.assertions(3);
        const rawImage = this.milkcatWide;
        let resizedImage: string;
        try {
            resizedImage = ImageProcessing.resizeImage(rawImage, THUMBNAIL_IMAGE_SIZE.width, THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideToThumb(): 000' + ex);
            return;
        }

        try {
            expect(resizedImage).not.toEqual(null);
            const dataBuffer = Buffer.from(resizedImage, 'base64');
            const imageBuffer = images(dataBuffer);
            expect(imageBuffer.width()).toBe(THUMBNAIL_IMAGE_SIZE.width);
            expect(imageBuffer.height()).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideToThumb(): 100: ' + ex);
        }
    });
});

// Image that is supposed to show up as invalid
this.brokenJpeg = '/9j/4AAQSkZJRgABAQEAoACgAAD/4RDpRXhpZgAAASDASSASAAAAAAAAAAAA';
// A shrunken picture of a Japanese cat with a milk carton on his head, converted to base64 using the *NIX command `base64`
this.initialJpeg =   '/9j/4AAQSkZJRgABAQEAoACgAAD/4RDpRXhpZgAASUkqAAgAAAAMAA4BAgAgAAAAngAAAA8BAgAYAAAAvgAAABABAgAQAAAA1gAA'
                   + 'ABIBAwABAAAAAQAAABoBBQABAAAA5gAAABsBBQABAAAA7gAAACgBAwABAAAAAgAAADEBAgAMAAAA9gAAADIBAgAUAAAAAgEAABMC'
                   + 'AwABAAAAAgAAAGmHBAABAAAAOAMAAKXEBwAiAgAAFgEAAMINAABPTFlNUFVTIERJR0lUQUwgQ0FNRVJBICAgICAgICAgAE9MWU1Q'
                   + 'VVMgSU1BR0lORyBDT1JQLiAgAEZFMzEwLFg4NDAsQzUzMACgAAAAAQAAAKAAAAABAAAAR0lNUCAyLjguMTYAMjAxODowMToxNSAy'
                   + 'MDo1NzoyMABQcmludElNADAzMDAAACUAAQAUABQAAgABAAAAAwDuAAAABwAAAAAACAAAAAAACQAAAAAACgAAAAAACwA2AQAADAAA'
                   + 'AAAADQAAAAAADgBOAQAAEAByAQAAIADGAQAAAAEDAAAAAQH/AAAAAgGDAAAAAwGDAAAABAGDAAAABQGDAAAABgGDAAAABwGAgIAA'
                   + 'EAGAAAAAAAIAAAAABwIAAAAACAIAAAAACQIAAAAACgIAAAAACwLoAQAADQIAAAAAIAIAAgAAAAMDAAAAAQP/AAAAAgODAAAAAwOD'
                   + 'AAAABgODAAAAEAOAAAAAAAQAAAAACREAABAnAAALDwAAECcAAJcFAAAQJwAAsAgAABAnAAABHAAAECcAAF4CAAAQJwAAiwAAABAn'
                   + 'AADLAwAAECcAAOUbAAAQJwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAABQUFAAAAQECAgMDA//8AAEBAgIDAwP//AABAQICAwMD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQAA'
                   + 'AEBAgIDAwP//AABAQICAwMD//wAAQECAgMDA//8fAJqCBQABAAAAsgQAAJ2CBQABAAAAugQAACKIAwABAAAABQAAACeIAwABAAAA'
                   + 'UAAAAACQBwAEAAAAMDIyMQOQAgAUAAAAwgQAAASQAgAUAAAA1gQAAAGRBwAEAAAAAQIDAASSCgABAAAA6gQAAAWSBQABAAAA8gQA'
                   + 'AAeSAwABAAAAAgAAAAiSAwABAAAAAAAAAAmSAwABAAAAGAAAAAqSBQABAAAA+gQAAHySBwAcCAAAAgUAAIaSBwB9AAAAHg0AAACg'
                   + 'BwAEAAAAMDEwMAGgAwABAAAAAQAAAAKgBAABAAAAMgAAAAOgBAABAAAAJgAAAAWgBAABAAAApA0AAACjBwABAAAAAwAAAAGkAwAB'
                   + 'AAAAAAAAAAKkAwABAAAAAAAAAAOkAwABAAAAAAAAAASkBQABAAAAnA0AAAakAwABAAAAAAAAAAekAwABAAAAAQAAAAikAwABAAAA'
                   + 'AAAAAAmkAwABAAAAAAAAAAqkAwABAAAAAAAAAAAAAAABAAAAPAAAACEAAAAKAAAAMjAwOTowNjoxNCAxNjo0OToxOQAyMDA5OjA2'
                   + 'OjE0IDE2OjQ5OjE5AAAAAAAKAAAAKQEAAGQAAABsAgAAZAAAAE9MWU1QAAEAGQAEAQIABgAAADgGAAAAAgQAAwAAAD4GAAACAgMA'
                   + 'AQAAAAAAAAADAgMAAQAAAAAAAAAEAgUAAQAAAEoGAAAFAgUAAQAAAFIGAAAGAggABgAAAFoGAAAHAgIABgAAAGYGAAAJAgcAIAAA'
                   + 'AGwGAAAKAgQAAgAAAIwGAAALAgUAAQAAAJQGAAABBAMAAQAAAAEAAAACBAQAAQAAAAEQAAIDBAMAAQAAAAEAAAAABQMAAQAAAAAA'
                   + 'AAAgIAcANgAAAJwGAAAAIQcAuAAAANIGAAAAIgcAGgEAAIoHAAAAIwcA9gAAAKQIAAAAJAcAHgAAAJoJAAAAJQcAHgAAALgJAAAA'
                   + 'JgcA6gAAANYJAAAAJwcAQgAAAMAKAAAAKAcACgIAAAILAAAAKQcAEgAAAAwNAAAxLjAwMwAAAAAAAAAAAAAAAABkAAAAZAAAAEcc'
                   + 'AADoAwAASf/F/mD+Tf/N/m/+RDQzNjgAT0xZTVBVUyBESUdJVEFMIENBTUVSQSAgICAgICAgIAAAAAAAAAAAAAgAAAABAAAABAAA'
                   + 'AAcABAAAADAxMDAAAQQAAQAAAAAAAAABAQQAAQAAAAAAAAACAQQAAQAAAAAAAAAAAAAADgAAAQIACgAAAJgHAAABAQIAAwAAAE9L'
                   + 'AAACAQIAAwAAAE9LAAADAQIAAwAAAE9LAAAEAQIAAwAAAE9LAAARAQIAAwAAAE9LAAAGAQIAAwAAAE9LAAAIAQIAAwAAAE9LAAAP'
                   + 'AQIAAwAAAE9LAAAJAQMAAQAAAPYAAAAQAQMAAQAAAD4AAAAKAQMAAQAAAHMNAAAOAQMAAQAAAKIAAAASAQMAAQAAAO4CAAAAAAAA'
                   + 'MS4wMDMAhwEgEBcAAAIEAAEAAACtKAEAAQIEAAEAAAD0LAAAAgIBAAEAAAAAAAAAAwIDAAEAAAAdAAAABAIBAAEAAAABAAAABgIE'
                   + 'AAEAAAC+IgEABwIEAAEAAAByOgAACAIBAAEAAAAAAAAACQIDAAEAAAAcAQAACgIBAAEAAAAAAAAADAIDAAEAAABiAAAADQIDAAEA'
                   + 'AACBAAAADgIDAAEAAABkAAAADwIDAAEAAAB4AAAAFAIDAAEAAAAGAAAAFQIDAAEAAACAAAAAFwIDAAEAAACBAAAAGAIDAAEAAAAA'
                   + 'AAAAGQIDAAEAAABmAAAAGgIDAAEAAABwAAAAHwIBAAEAAAAAAAAAIgIBAAEAAAAAAAAAJQIDAAEAAACQAAAAAAAAABQAAAMBAAEA'
                   + 'AAAAAAAAAQMBAAEAAAAAAAAAAgMBAAEAAAAAAAAAAwMEAAEAAAAAAAAABAMDAAEAAACgAAAABQMDAAEAAAAFAQAACgMDAAEAAAAA'
                   + 'AAAADAMBAAEAAAAAAAAADQMBAAEAAAAAAAAADgMDAAEAAABcAAAADwMDAAEAAAAAAAAAEwMDAAEAAAAc/wAAFAMDAAEAAAAAAAAA'
                   + 'FQMDAAEAAAAAAAAAGAMDAAEAAABIQAAAIAMDAAEAAAC1DgAAIQMDAAEAAACyDgAAIgMDAAEAAAAAAAAAIwMDAAEAAABkAAAAJAMD'
                   + 'AAEAAAC8AgAAAAAAAAIAAAQBAAEAAAADAAAAAQQDAAEAAAC7DAAAAAAAAAIAAgUBAAEAAAAKAAAABAUDAAEAAAAAAAAAAAAAABMA'
                   + 'AAYEAAEAAACAreYAAQYEAAEAAADwKnwBAgYEAAEAAAAQfP8AAwYDAAEAAACHBgAABAYDAAEAAABhBgAABwYDAAEAAABWBAAACAYD'
                   + 'AAEAAACUCQAACQYDAAEAAAB5AgAACgYBAAEAAAAIAAAACwYDAAEAAAAABAAADAYDAAEAAAAABAAAEgYDAAEAAACrAQAAFAYDAAEA'
                   + 'AACfAQAAGgYDAAEAAAABAAAAHgYEAAEAAAAAAAAAHwYEAAEAAAAAAAAAIAYEAAEAAAAAAAAAKQYDAAEAAAAMCAAAKgYDAAEAAACb'
                   + 'BQAAAAAAAAUAAAcIAAEAAAAmAAAAAQcIAAEAAAD//gAAAgcIAAEAAADN/gAAAwcIAAEAAAABAAAABAcBAAEAAAACAAAAAAAAABcA'
                   + 'AQgBAAEAAAAAAAAAAggBAAEAAAAAAAAABAgDAAEAAAACAAAABQgJAAEAAAA6BQAABggIAAEAAAAoAAAABwgDAAEAAAAHAAAACwgI'
                   + 'AAEAAAAXBQAADAgIAAEAAACIBQAADQgDAAEAAAAGAAAADggEAAEAAAAKAAAADwgIAAEAAAA6BQAAEAgDAAEAAAC1AAAAEQgDAAEA'
                   + 'AACHAQAAEggDAAEAAABkAAAAFAgDAAEAAAA7BQAAFQgDAAEAAADPMwAAFggDAAEAAABMBAAAFwgDAAEAAAC+AAAAGAgDAAEAAAB4'
                   + 'AAAAIQgDAHgAAAA0DAAAHwgBAAEAAAABAAAAJwgIAAEAAAAnBQAAKAgIAAEAAACWYAAAAAAAADoNtA92ESIVuhlULs8zGii0GQAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQkB'
                   + 'AAEAAAAAAAAAAAAAAEFTQ0lJAAAAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgAGQAAABkAAAAAgAB'
                   + 'AAIABAAAAFI5OAACAAcABAAAADAxMDAAAAAABgADAQMAAQAAAAYAAAAaAQUAAQAAABAOAAAbAQUAAQAAABgOAAAoAQMAAQAAAAIA'
                   + 'AAABAgQAAQAAACAOAAACAgQAAQAAAMECAAAAAAAASAAAAAEAAABIAAAAAQAAAP/Y/+AAEEpGSUYAAQEAAAEAAQAA/9sAQwBQNzxG'
                   + 'PDJQRkFGWlVQX3jIgnhubnj1r7mRyP///////////////////////////////////////////////////9sAQwFVWlp4aXjrgoLr'
                   + '/////////////////////////////////////////////////////////////////////////8AAEQgAHAAmAwEiAAIRAQMRAf/E'
                   + 'AB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGh'
                   + 'CCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqS'
                   + 'k5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEB'
                   + 'AQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1Lw'
                   + 'FWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZ'
                   + 'mqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8AiKADG7FI'
                   + 'VBwA1O2nsR+VKFAx65pAWlG0YGKqzKWkPzcZqx5ikjGaiPJpsCEJk5zRUmB6UUAJSgE01acPWgBxJC8jBpuaOppO1AC5opDRQB//'
                   + '2f/hDDxodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVT'
                   + 'ek5UY3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nPgo8cmRmOlJERiB4bWxuczpyZGY9J2h0dHA6'
                   + 'Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMnPgoKIDxyZGY6RGVzY3JpcHRpb24geG1sbnM6ZXhpZj0naHR0'
                   + 'cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8nPgogIDxleGlmOkltYWdlRGVzY3JpcHRpb24+T0xZTVBVUyBESUdJVEFMIENBTUVS'
                   + 'QSAgICAgICAgIDwvZXhpZjpJbWFnZURlc2NyaXB0aW9uPgogIDxleGlmOk1ha2U+T0xZTVBVUyBJTUFHSU5HIENPUlAuICA8L2V4'
                   + 'aWY6TWFrZT4KICA8ZXhpZjpNb2RlbD5GRTMxMCxYODQwLEM1MzA8L2V4aWY6TW9kZWw+CiAgPGV4aWY6T3JpZW50YXRpb24+VG9w'
                   + 'LWxlZnQ8L2V4aWY6T3JpZW50YXRpb24+CiAgPGV4aWY6WFJlc29sdXRpb24+MTYwPC9leGlmOlhSZXNvbHV0aW9uPgogIDxleGlm'
                   + 'OllSZXNvbHV0aW9uPjE2MDwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5JbmNoPC9leGlmOlJlc29s'
                   + 'dXRpb25Vbml0PgogIDxleGlmOlNvZnR3YXJlPjEuMCAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2V4aWY6U29mdHdhcmU+'
                   + 'CiAgPGV4aWY6RGF0ZVRpbWU+MjAwOTowNjoxNCAxNjo0OToxOTwvZXhpZjpEYXRlVGltZT4KICA8ZXhpZjpZQ2JDclBvc2l0aW9u'
                   + 'aW5nPkNvLXNpdGVkPC9leGlmOllDYkNyUG9zaXRpb25pbmc+CiAgPGV4aWY6UHJpbnRJbWFnZU1hdGNoaW5nPjU0NiBieXRlcyB1'
                   + 'bmRlZmluZWQgZGF0YTwvZXhpZjpQcmludEltYWdlTWF0Y2hpbmc+CiAgPGV4aWY6Q29tcHJlc3Npb24+SlBFRyBjb21wcmVzc2lv'
                   + 'bjwvZXhpZjpDb21wcmVzc2lvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj43MjwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVz'
                   + 'b2x1dGlvbj43MjwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5JbmNoPC9leGlmOlJlc29sdXRpb25V'
                   + 'bml0PgogIDxleGlmOkV4cG9zdXJlVGltZT4xLzYwIHNlYy48L2V4aWY6RXhwb3N1cmVUaW1lPgogIDxleGlmOkZOdW1iZXI+Zi8z'
                   + 'LjM8L2V4aWY6Rk51bWJlcj4KICA8ZXhpZjpFeHBvc3VyZVByb2dyYW0+Q3JlYXRpdmUgcHJvZ3JhbW1lIChiaWFzZWQgdG93YXJk'
                   + 'cyBkZXB0aCBvZiBmaWVsZCk8L2V4aWY6RXhwb3N1cmVQcm9ncmFtPgogIDxleGlmOklTT1NwZWVkUmF0aW5ncz4KICAgPHJkZjpT'
                   + 'ZXE+CiAgICA8cmRmOmxpPjgwPC9yZGY6bGk+CiAgIDwvcmRmOlNlcT4KICA8L2V4aWY6SVNPU3BlZWRSYXRpbmdzPgogIDxleGlm'
                   + 'OkV4aWZWZXJzaW9uPkV4aWYgVmVyc2lvbiAyLjIxPC9leGlmOkV4aWZWZXJzaW9uPgogIDxleGlmOkRhdGVUaW1lT3JpZ2luYWw+'
                   + 'MjAwOTowNjoxNCAxNjo0OToxOTwvZXhpZjpEYXRlVGltZU9yaWdpbmFsPgogIDxleGlmOkRhdGVUaW1lRGlnaXRpemVkPjIwMDk6'
                   + 'MDY6MTQgMTY6NDk6MTk8L2V4aWY6RGF0ZVRpbWVEaWdpdGl6ZWQ+CiAgPGV4aWY6Q29tcG9uZW50c0NvbmZpZ3VyYXRpb24+CiAg'
                   + 'IDxyZGY6U2VxPgogICAgPHJkZjpsaT5ZIENiIENyIC08L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvZXhpZjpDb21wb25lbnRz'
                   + 'Q29uZmlndXJhdGlvbj4KICA8ZXhpZjpFeHBvc3VyZUJpYXNWYWx1ZT4wLjAwIEVWPC9leGlmOkV4cG9zdXJlQmlhc1ZhbHVlPgog'
                   + 'IDxleGlmOk1heEFwZXJ0dXJlVmFsdWU+Mi45NyBFViAoZi8yLjgpPC9leGlmOk1heEFwZXJ0dXJlVmFsdWU+CiAgPGV4aWY6TWV0'
                   + 'ZXJpbmdNb2RlPkNlbnRyZS13ZWlnaHRlZCBhdmVyYWdlPC9leGlmOk1ldGVyaW5nTW9kZT4KICA8ZXhpZjpMaWdodFNvdXJjZT5V'
                   + 'bmtub3duPC9leGlmOkxpZ2h0U291cmNlPgogIDxleGlmOkZsYXNoIHJkZjpwYXJzZVR5cGU9J1Jlc291cmNlJz4KICA8L2V4aWY6'
                   + 'Rmxhc2g+CiAgPGV4aWY6Rm9jYWxMZW5ndGg+Ni4yIG1tPC9leGlmOkZvY2FsTGVuZ3RoPgogIDxleGlmOk1ha2VyTm90ZT4yMDc2'
                   + 'IGJ5dGVzIHVuZGVmaW5lZCBkYXRhPC9leGlmOk1ha2VyTm90ZT4KICA8ZXhpZjpVc2VyQ29tbWVudD4gICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgICA8L2V4aWY6VXNlckNvbW1lbnQ+CiAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPkZsYXNo'
                   + 'UGl4IFZlcnNpb24gMS4wPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICA8ZXhpZjpDb2xvclNwYWNlPnNSR0I8L2V4aWY6Q29sb3JT'
                   + 'cGFjZT4KICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTI4MDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgPGV4aWY6UGl4ZWxZRGlt'
                   + 'ZW5zaW9uPjk2MDwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgPGV4aWY6RmlsZVNvdXJjZT5EU0M8L2V4aWY6RmlsZVNvdXJjZT4K'
                   + 'ICA8ZXhpZjpDdXN0b21SZW5kZXJlZD5Ob3JtYWwgcHJvY2VzczwvZXhpZjpDdXN0b21SZW5kZXJlZD4KICA8ZXhpZjpFeHBvc3Vy'
                   + 'ZU1vZGU+QXV0byBleHBvc3VyZTwvZXhpZjpFeHBvc3VyZU1vZGU+CiAgPGV4aWY6V2hpdGVCYWxhbmNlPkF1dG8gd2hpdGUgYmFs'
                   + 'YW5jZTwvZXhpZjpXaGl0ZUJhbGFuY2U+CiAgPGV4aWY6RGlnaXRhbFpvb21SYXRpbz4xLjAwPC9leGlmOkRpZ2l0YWxab29tUmF0'
                   + 'aW8+CiAgPGV4aWY6U2NlbmVDYXB0dXJlVHlwZT5TdGFuZGFyZDwvZXhpZjpTY2VuZUNhcHR1cmVUeXBlPgogIDxleGlmOkdhaW5D'
                   + 'b250cm9sPkxvdyBnYWluIHVwPC9leGlmOkdhaW5Db250cm9sPgogIDxleGlmOkNvbnRyYXN0Pk5vcm1hbDwvZXhpZjpDb250cmFz'
                   + 'dD4KICA8ZXhpZjpTYXR1cmF0aW9uPk5vcm1hbDwvZXhpZjpTYXR1cmF0aW9uPgogIDxleGlmOlNoYXJwbmVzcz5Ob3JtYWw8L2V4'
                   + 'aWY6U2hhcnBuZXNzPgogIDxleGlmOkludGVyb3BlcmFiaWxpdHlJbmRleD5SOTg8L2V4aWY6SW50ZXJvcGVyYWJpbGl0eUluZGV4'
                   + 'PgogIDxleGlmOkludGVyb3BlcmFiaWxpdHlWZXJzaW9uPjAxMDA8L2V4aWY6SW50ZXJvcGVyYWJpbGl0eVZlcnNpb24+CiA8L3Jk'
                   + 'ZjpEZXNjcmlwdGlvbj4KCjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3InPz4K/9sAQwBQNzxGPDJQRkFG'
                   + 'WlVQX3jIgnhubnj1r7mRyP///////////////////////////////////////////////////9sAQwFVWlp4aXjrgoLr////////'
                   + '/////////////////////////////////////////////////////////////////8IAEQgAJgAyAwEhAAIRAQMRAf/EABcAAQEB'
                   + 'AQAAAAAAAAAAAAAAAAABAgP/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEAMQAAABwi9rOOVIo3uucKAaMgILYigzSwsA'
                   + '/8QAGRAAAgMBAAAAAAAAAAAAAAAAARACESBA/9oACAEBAAEFAqQCOY9X/8QAFBEBAAAAAAAAAAAAAAAAAAAAQP/aAAgBAwEBPwEn'
                   + '/8QAFBEBAAAAAAAAAAAAAAAAAAAAQP/aAAgBAgEBPwEn/8QAFBABAAAAAAAAAAAAAAAAAAAAUP/aAAgBAQAGPwIP/8QAHRAAAwAC'
                   + 'AgMAAAAAAAAAAAAAAAERICEQMUFhgf/aAAgBAQABPyEJP6bt8XSMjL7OzszyPbJgmV5bHlXj/9oADAMBAAIAAwAAABBrjuTACMzK'
                   + 'AMxA/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQBA/9oACAEDAQE/EJMf/8QAFxEBAAMAAAAAAAAAAAAAAAAAAQAhQP/aAAgBAgEBPxCD'
                   + 'WP8A/8QAIBABAAMAAgICAwAAAAAAAAAAAQARITFREEEggWFxof/aAAgBAQABPxAQQQrywj35ZkHOIWwbI1BXHM/ESnuDVD9zILfU'
                   + '9poe5+03v+TOiFXhGGx2GlvPx9kAJRcaFJ9S5ctg8eAChlb4Nm9z/9k=';
this.milkcatTall =   '/9j/4AAQSkZJRgABAQEAoACgAAD/4RUdRXhpZgAASUkqAAgAAAAMAA4BAgAgAAAAngAAAA8BAgAYAAAAvgAAABABAgAQAAAA1gAA'
                   + 'ABIBAwABAAAAAQAAABoBBQABAAAA5gAAABsBBQABAAAA7gAAACgBAwABAAAAAgAAADEBAgAMAAAA9gAAADIBAgAUAAAAAgEAABMC'
                   + 'AwABAAAAAgAAAGmHBAABAAAAOAMAAKXEBwAiAgAAFgEAAMINAABPTFlNUFVTIERJR0lUQUwgQ0FNRVJBICAgICAgICAgAE9MWU1Q'
                   + 'VVMgSU1BR0lORyBDT1JQLiAgAEZFMzEwLFg4NDAsQzUzMACgAAAAAQAAAKAAAAABAAAAR0lNUCAyLjguMTYAMjAxODowMToxNyAw'
                   + 'MDowMjozNQBQcmludElNADAzMDAAACUAAQAUABQAAgABAAAAAwDuAAAABwAAAAAACAAAAAAACQAAAAAACgAAAAAACwA2AQAADAAA'
                   + 'AAAADQAAAAAADgBOAQAAEAByAQAAIADGAQAAAAEDAAAAAQH/AAAAAgGDAAAAAwGDAAAABAGDAAAABQGDAAAABgGDAAAABwGAgIAA'
                   + 'EAGAAAAAAAIAAAAABwIAAAAACAIAAAAACQIAAAAACgIAAAAACwLoAQAADQIAAAAAIAIAAgAAAAMDAAAAAQP/AAAAAgODAAAAAwOD'
                   + 'AAAABgODAAAAEAOAAAAAAAQAAAAACREAABAnAAALDwAAECcAAJcFAAAQJwAAsAgAABAnAAABHAAAECcAAF4CAAAQJwAAiwAAABAn'
                   + 'AADLAwAAECcAAOUbAAAQJwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAABQUFAAAAQECAgMDA//8AAEBAgIDAwP//AABAQICAwMD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQAA'
                   + 'AEBAgIDAwP//AABAQICAwMD//wAAQECAgMDA//8fAJqCBQABAAAAsgQAAJ2CBQABAAAAugQAACKIAwABAAAABQAAACeIAwABAAAA'
                   + 'UAAAAACQBwAEAAAAMDIyMQOQAgAUAAAAwgQAAASQAgAUAAAA1gQAAAGRBwAEAAAAAQIDAASSCgABAAAA6gQAAAWSBQABAAAA8gQA'
                   + 'AAeSAwABAAAAAgAAAAiSAwABAAAAAAAAAAmSAwABAAAAGAAAAAqSBQABAAAA+gQAAHySBwAcCAAAAgUAAIaSBwB9AAAAHg0AAACg'
                   + 'BwAEAAAAMDEwMAGgAwABAAAAAQAAAAKgBAABAAAASwAAAAOgBAABAAAAZAAAAAWgBAABAAAApA0AAACjBwABAAAAAwAAAAGkAwAB'
                   + 'AAAAAAAAAAKkAwABAAAAAAAAAAOkAwABAAAAAAAAAASkBQABAAAAnA0AAAakAwABAAAAAAAAAAekAwABAAAAAQAAAAikAwABAAAA'
                   + 'AAAAAAmkAwABAAAAAAAAAAqkAwABAAAAAAAAAAAAAAABAAAAPAAAACEAAAAKAAAAMjAwOTowNjoxNCAxNjo0OToxOQAyMDA5OjA2'
                   + 'OjE0IDE2OjQ5OjE5AAAAAAAKAAAAKQEAAGQAAABsAgAAZAAAAE9MWU1QAAEAGQAEAQIABgAAADgGAAAAAgQAAwAAAD4GAAACAgMA'
                   + 'AQAAAAAAAAADAgMAAQAAAAAAAAAEAgUAAQAAAEoGAAAFAgUAAQAAAFIGAAAGAggABgAAAFoGAAAHAgIABgAAAGYGAAAJAgcAIAAA'
                   + 'AGwGAAAKAgQAAgAAAIwGAAALAgUAAQAAAJQGAAABBAMAAQAAAAEAAAACBAQAAQAAAAEQAAIDBAMAAQAAAAEAAAAABQMAAQAAAAAA'
                   + 'AAAgIAcANgAAAJwGAAAAIQcAuAAAANIGAAAAIgcAGgEAAIoHAAAAIwcA9gAAAKQIAAAAJAcAHgAAAJoJAAAAJQcAHgAAALgJAAAA'
                   + 'JgcA6gAAANYJAAAAJwcAQgAAAMAKAAAAKAcACgIAAAILAAAAKQcAEgAAAAwNAAAxLjAwMwAAAAAAAAAAAAAAAABkAAAAZAAAAEcc'
                   + 'AADoAwAASf/F/mD+Tf/N/m/+RDQzNjgAT0xZTVBVUyBESUdJVEFMIENBTUVSQSAgICAgICAgIAAAAAAAAAAAAAgAAAABAAAABAAA'
                   + 'AAcABAAAADAxMDAAAQQAAQAAAAAAAAABAQQAAQAAAAAAAAACAQQAAQAAAAAAAAAAAAAADgAAAQIACgAAAJgHAAABAQIAAwAAAE9L'
                   + 'AAACAQIAAwAAAE9LAAADAQIAAwAAAE9LAAAEAQIAAwAAAE9LAAARAQIAAwAAAE9LAAAGAQIAAwAAAE9LAAAIAQIAAwAAAE9LAAAP'
                   + 'AQIAAwAAAE9LAAAJAQMAAQAAAPYAAAAQAQMAAQAAAD4AAAAKAQMAAQAAAHMNAAAOAQMAAQAAAKIAAAASAQMAAQAAAO4CAAAAAAAA'
                   + 'MS4wMDMAhwEgEBcAAAIEAAEAAACtKAEAAQIEAAEAAAD0LAAAAgIBAAEAAAAAAAAAAwIDAAEAAAAdAAAABAIBAAEAAAABAAAABgIE'
                   + 'AAEAAAC+IgEABwIEAAEAAAByOgAACAIBAAEAAAAAAAAACQIDAAEAAAAcAQAACgIBAAEAAAAAAAAADAIDAAEAAABiAAAADQIDAAEA'
                   + 'AACBAAAADgIDAAEAAABkAAAADwIDAAEAAAB4AAAAFAIDAAEAAAAGAAAAFQIDAAEAAACAAAAAFwIDAAEAAACBAAAAGAIDAAEAAAAA'
                   + 'AAAAGQIDAAEAAABmAAAAGgIDAAEAAABwAAAAHwIBAAEAAAAAAAAAIgIBAAEAAAAAAAAAJQIDAAEAAACQAAAAAAAAABQAAAMBAAEA'
                   + 'AAAAAAAAAQMBAAEAAAAAAAAAAgMBAAEAAAAAAAAAAwMEAAEAAAAAAAAABAMDAAEAAACgAAAABQMDAAEAAAAFAQAACgMDAAEAAAAA'
                   + 'AAAADAMBAAEAAAAAAAAADQMBAAEAAAAAAAAADgMDAAEAAABcAAAADwMDAAEAAAAAAAAAEwMDAAEAAAAc/wAAFAMDAAEAAAAAAAAA'
                   + 'FQMDAAEAAAAAAAAAGAMDAAEAAABIQAAAIAMDAAEAAAC1DgAAIQMDAAEAAACyDgAAIgMDAAEAAAAAAAAAIwMDAAEAAABkAAAAJAMD'
                   + 'AAEAAAC8AgAAAAAAAAIAAAQBAAEAAAADAAAAAQQDAAEAAAC7DAAAAAAAAAIAAgUBAAEAAAAKAAAABAUDAAEAAAAAAAAAAAAAABMA'
                   + 'AAYEAAEAAACAreYAAQYEAAEAAADwKnwBAgYEAAEAAAAQfP8AAwYDAAEAAACHBgAABAYDAAEAAABhBgAABwYDAAEAAABWBAAACAYD'
                   + 'AAEAAACUCQAACQYDAAEAAAB5AgAACgYBAAEAAAAIAAAACwYDAAEAAAAABAAADAYDAAEAAAAABAAAEgYDAAEAAACrAQAAFAYDAAEA'
                   + 'AACfAQAAGgYDAAEAAAABAAAAHgYEAAEAAAAAAAAAHwYEAAEAAAAAAAAAIAYEAAEAAAAAAAAAKQYDAAEAAAAMCAAAKgYDAAEAAACb'
                   + 'BQAAAAAAAAUAAAcIAAEAAAAmAAAAAQcIAAEAAAD//gAAAgcIAAEAAADN/gAAAwcIAAEAAAABAAAABAcBAAEAAAACAAAAAAAAABcA'
                   + 'AQgBAAEAAAAAAAAAAggBAAEAAAAAAAAABAgDAAEAAAACAAAABQgJAAEAAAA6BQAABggIAAEAAAAoAAAABwgDAAEAAAAHAAAACwgI'
                   + 'AAEAAAAXBQAADAgIAAEAAACIBQAADQgDAAEAAAAGAAAADggEAAEAAAAKAAAADwgIAAEAAAA6BQAAEAgDAAEAAAC1AAAAEQgDAAEA'
                   + 'AACHAQAAEggDAAEAAABkAAAAFAgDAAEAAAA7BQAAFQgDAAEAAADPMwAAFggDAAEAAABMBAAAFwgDAAEAAAC+AAAAGAgDAAEAAAB4'
                   + 'AAAAIQgDAHgAAAA0DAAAHwgBAAEAAAABAAAAJwgIAAEAAAAnBQAAKAgIAAEAAACWYAAAAAAAADoNtA92ESIVuhlULs8zGii0GQAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQkB'
                   + 'AAEAAAAAAAAAAAAAAEFTQ0lJAAAAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgAGQAAABkAAAAAgAB'
                   + 'AAIABAAAAFI5OAACAAcABAAAADAxMDAAAAAABgADAQMAAQAAAAYAAAAaAQUAAQAAABAOAAAbAQUAAQAAABgOAAAoAQMAAQAAAAIA'
                   + 'AAABAgQAAQAAACAOAAACAgQAAQAAAPUGAAAAAAAASAAAAAEAAABIAAAAAQAAAP/Y/+AAEEpGSUYAAQEAAAEAAQAA/9sAQwAIBgYH'
                   + 'BgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0Y'
                   + 'MiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgASwA4AwEiAAIRAQMRAf/E'
                   + 'AB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGh'
                   + 'CCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqS'
                   + 'k5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEB'
                   + 'AQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1Lw'
                   + 'FWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZ'
                   + 'mqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A8osrf7Nb'
                   + 'iRmEkjynHoo/vVa0W3OtatZ20chEBfDjptTjd+Shq7K30G2itiFCyhl2ZZcEDHpUGn+HIdNjuJYSyzXW+CMHnYh++/twNv8AwKsY'
                   + 'VUy/Zs42/un1TxLKuDGk9xmPHHBbA/SvofwjYPY6fFa7y9vHO3Dtzyf/AK9eYReENLTVLFo5MOjoyLncRyOCfXvXscdiIZCGWRY+'
                   + 'W3q3f0xXZhq0EpLuceKpSbVtzM+IutXOgaG15Zws6h1jZsjKBuMj3r52l1E3us+YyKGaQFyTz1617/4601LjwlfH97JkxlIyPvHg'
                   + '9M89a8e/4QqJI1mimZZG+bYRjBHQfnWNacU1Y3o0pNXluc3cNJNqJj6QRsFbPU4oro4dCW5m+3eaI459zbCMkNnBX8DRWE3dlui2'
                   + 'asl899Ci2AZSU3+Ye1Z08N80cU012xDK21FkIIC8fqRmqsniKPTyLURyRGAFSAOHpIL2HUNSjigkaRnZSEA4Qd/61Tp9ioStuXPC'
                   + 'E963i2yhlZjC9wjhHPI46173qlw1nZ+dLJshC4Y4zycV4+UkPjDSdRitxHBBIEcg9ewJ/SvZ9UZpNJSFcbpJkG0jOeef0ranFNpM'
                   + 'zm+qOd8csIvD0caHO+Rcg+3P+FecSNcoMspwT2Oa7rxpeedJaWiIWUO7Ej8MZ/M/lXMTIUVSgYluoFTdPYdmtzAiuZ7G8YSWNxcW'
                   + 's2XMcfDI/wDeU+/eitsjcuGyD79qKYETWlnK4ae1hkGP4ogxpsNpp9o22G3igeQ5yF+bn6UkTFU35zu6/WoLiQb1DZL5DDb2GaAL'
                   + 'E0rC4aLbhuGIBxgL0Ofwrq7j4gxmWJVsbhljcSZQABuoA5PFckhaHV5pZI965VMN6HnNaot4HvLg+YwWRQQAPqP6Cs/aNMC9qeov'
                   + 'qUqToggBUnYSD1Y46CsorOR5ivsY8DuB+Ap13cLFMoiwzJGqDPqBk/zphUiNQyAEsOzHj1qobARkMUfLENuHPf1opWaMAndxkdj9'
                   + 'KKoCixLgFD/wEdqq3cTBDuG1j0z3p8Mqui7twWTujccH1pJCwVgh3jeyAHt3HP5UATi4kWz+0NsLgjPoT0x+ldFp2qJLZWcyRRpE'
                   + '4KSbuGXvkDvyP1qlDpwvoTC6BRIiFypyC3r7Z61f/sC20PRmuLu6ctBny4uiMeozz2rG15WAxJ5Y55pHjZPPdyQyqRgduD16YpI5'
                   + 'PLd2dQx6fNngfhWdbSMbgfu4ysh3HLZ/HpwOaulzFGBht24/N0B/xrVKysBPII4o3lZlTd91eeOnP060VT3PKVSMEpnBjJ+UfTii'
                   + 'mBm20omiRumxcD/aOa0kAknaKJQqO5YsRnBGeKw7H/j3gPpit3J+1wnPO8/+g0AW9G1S40rNubc3UcoH+yUxwPw6VW1CaTU7ye+u'
                   + 'ZmDM20Q5yiqP8mpicaU7D727OfwpZEXybbgfMBn34osBVgnXa0WUcDnbgjH5U3cpkDSkAnooY4HvzVi4toFmhxEvLZPFUrjlUPfm'
                   + 'gB88oj+dCpbJCnoM9se1FNjUfZ349DRQB//Z/+EVYmh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2lu'
                   + 'PSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+'
                   + 'CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpE'
                   + 'ZXNjcmlwdGlvbiB4bWxuczpleGlmPSdodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyc+CiAgPGV4aWY6SW1hZ2VEZXNjcmlw'
                   + 'dGlvbj5PTFlNUFVTIERJR0lUQUwgQ0FNRVJBICAgICAgICAgPC9leGlmOkltYWdlRGVzY3JpcHRpb24+CiAgPGV4aWY6TWFrZT5P'
                   + 'TFlNUFVTIElNQUdJTkcgQ09SUC4gIDwvZXhpZjpNYWtlPgogIDxleGlmOk1vZGVsPkZFMzEwLFg4NDAsQzUzMDwvZXhpZjpNb2Rl'
                   + 'bD4KICA8ZXhpZjpPcmllbnRhdGlvbj5Ub3AtbGVmdDwvZXhpZjpPcmllbnRhdGlvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj4xNjA8'
                   + 'L2V4aWY6WFJlc29sdXRpb24+CiAgPGV4aWY6WVJlc29sdXRpb24+MTYwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29s'
                   + 'dXRpb25Vbml0PkluY2g8L2V4aWY6UmVzb2x1dGlvblVuaXQ+CiAgPGV4aWY6U29mdHdhcmU+MS4wICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgIDwvZXhpZjpTb2Z0d2FyZT4KICA8ZXhpZjpEYXRlVGltZT4yMDA5OjA2OjE0IDE2OjQ5OjE5PC9leGlmOkRhdGVU'
                   + 'aW1lPgogIDxleGlmOllDYkNyUG9zaXRpb25pbmc+Q28tc2l0ZWQ8L2V4aWY6WUNiQ3JQb3NpdGlvbmluZz4KICA8ZXhpZjpQcmlu'
                   + 'dEltYWdlTWF0Y2hpbmc+NTQ2IGJ5dGVzIHVuZGVmaW5lZCBkYXRhPC9leGlmOlByaW50SW1hZ2VNYXRjaGluZz4KICA8ZXhpZjpD'
                   + 'b21wcmVzc2lvbj5KUEVHIGNvbXByZXNzaW9uPC9leGlmOkNvbXByZXNzaW9uPgogIDxleGlmOlhSZXNvbHV0aW9uPjcyPC9leGlm'
                   + 'OlhSZXNvbHV0aW9uPgogIDxleGlmOllSZXNvbHV0aW9uPjcyPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25V'
                   + 'bml0PkluY2g8L2V4aWY6UmVzb2x1dGlvblVuaXQ+CiAgPGV4aWY6SW1hZ2VEZXNjcmlwdGlvbj5PTFlNUFVTIERJR0lUQUwgQ0FN'
                   + 'RVJBICAgICAgICAgPC9leGlmOkltYWdlRGVzY3JpcHRpb24+CiAgPGV4aWY6TWFrZT5PTFlNUFVTIElNQUdJTkcgQ09SUC4gIDwv'
                   + 'ZXhpZjpNYWtlPgogIDxleGlmOk1vZGVsPkZFMzEwLFg4NDAsQzUzMDwvZXhpZjpNb2RlbD4KICA8ZXhpZjpPcmllbnRhdGlvbj5U'
                   + 'b3AtbGVmdDwvZXhpZjpPcmllbnRhdGlvbj4KICA8ZXhpZjpYUmVzb2x1dGlvbj4xNjA8L2V4aWY6WFJlc29sdXRpb24+CiAgPGV4'
                   + 'aWY6WVJlc29sdXRpb24+MTYwPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25Vbml0PkluY2g8L2V4aWY6UmVz'
                   + 'b2x1dGlvblVuaXQ+CiAgPGV4aWY6U29mdHdhcmU+R0lNUCAyLjguMTY8L2V4aWY6U29mdHdhcmU+CiAgPGV4aWY6RGF0ZVRpbWU+'
                   + 'MjAxODowMToxNiAyMTozMjoyNzwvZXhpZjpEYXRlVGltZT4KICA8ZXhpZjpZQ2JDclBvc2l0aW9uaW5nPkNvLXNpdGVkPC9leGlm'
                   + 'OllDYkNyUG9zaXRpb25pbmc+CiAgPGV4aWY6UHJpbnRJbWFnZU1hdGNoaW5nPjU0NiBieXRlcyB1bmRlZmluZWQgZGF0YTwvZXhp'
                   + 'ZjpQcmludEltYWdlTWF0Y2hpbmc+CiAgPGV4aWY6Q29tcHJlc3Npb24+SlBFRyBjb21wcmVzc2lvbjwvZXhpZjpDb21wcmVzc2lv'
                   + 'bj4KICA8ZXhpZjpYUmVzb2x1dGlvbj43MjwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj43MjwvZXhpZjpZ'
                   + 'UmVzb2x1dGlvbj4KICA8ZXhpZjpSZXNvbHV0aW9uVW5pdD5JbmNoPC9leGlmOlJlc29sdXRpb25Vbml0PgogIDxleGlmOkltYWdl'
                   + 'RGVzY3JpcHRpb24+T0xZTVBVUyBESUdJVEFMIENBTUVSQSAgICAgICAgIDwvZXhpZjpJbWFnZURlc2NyaXB0aW9uPgogIDxleGlm'
                   + 'Ok1ha2U+T0xZTVBVUyBJTUFHSU5HIENPUlAuICA8L2V4aWY6TWFrZT4KICA8ZXhpZjpNb2RlbD5GRTMxMCxYODQwLEM1MzA8L2V4'
                   + 'aWY6TW9kZWw+CiAgPGV4aWY6T3JpZW50YXRpb24+VG9wLWxlZnQ8L2V4aWY6T3JpZW50YXRpb24+CiAgPGV4aWY6WFJlc29sdXRp'
                   + 'b24+MTYwPC9leGlmOlhSZXNvbHV0aW9uPgogIDxleGlmOllSZXNvbHV0aW9uPjE2MDwvZXhpZjpZUmVzb2x1dGlvbj4KICA8ZXhp'
                   + 'ZjpSZXNvbHV0aW9uVW5pdD5JbmNoPC9leGlmOlJlc29sdXRpb25Vbml0PgogIDxleGlmOlNvZnR3YXJlPkdJTVAgMi44LjE2PC9l'
                   + 'eGlmOlNvZnR3YXJlPgogIDxleGlmOkRhdGVUaW1lPjIwMTg6MDE6MTYgMjI6MTc6MTc8L2V4aWY6RGF0ZVRpbWU+CiAgPGV4aWY6'
                   + 'WUNiQ3JQb3NpdGlvbmluZz5Dby1zaXRlZDwvZXhpZjpZQ2JDclBvc2l0aW9uaW5nPgogIDxleGlmOlByaW50SW1hZ2VNYXRjaGlu'
                   + 'Zz41NDYgYnl0ZXMgdW5kZWZpbmVkIGRhdGE8L2V4aWY6UHJpbnRJbWFnZU1hdGNoaW5nPgogIDxleGlmOkNvbXByZXNzaW9uPkpQ'
                   + 'RUcgY29tcHJlc3Npb248L2V4aWY6Q29tcHJlc3Npb24+CiAgPGV4aWY6WFJlc29sdXRpb24+NzI8L2V4aWY6WFJlc29sdXRpb24+'
                   + 'CiAgPGV4aWY6WVJlc29sdXRpb24+NzI8L2V4aWY6WVJlc29sdXRpb24+CiAgPGV4aWY6UmVzb2x1dGlvblVuaXQ+SW5jaDwvZXhp'
                   + 'ZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpJbWFnZURlc2NyaXB0aW9uPk9MWU1QVVMgRElHSVRBTCBDQU1FUkEgICAgICAgICA8'
                   + 'L2V4aWY6SW1hZ2VEZXNjcmlwdGlvbj4KICA8ZXhpZjpNYWtlPk9MWU1QVVMgSU1BR0lORyBDT1JQLiAgPC9leGlmOk1ha2U+CiAg'
                   + 'PGV4aWY6TW9kZWw+RkUzMTAsWDg0MCxDNTMwPC9leGlmOk1vZGVsPgogIDxleGlmOk9yaWVudGF0aW9uPlRvcC1sZWZ0PC9leGlm'
                   + 'Ok9yaWVudGF0aW9uPgogIDxleGlmOlhSZXNvbHV0aW9uPjE2MDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlv'
                   + 'bj4xNjA8L2V4aWY6WVJlc29sdXRpb24+CiAgPGV4aWY6UmVzb2x1dGlvblVuaXQ+SW5jaDwvZXhpZjpSZXNvbHV0aW9uVW5pdD4K'
                   + 'ICA8ZXhpZjpTb2Z0d2FyZT5HSU1QIDIuOC4xNjwvZXhpZjpTb2Z0d2FyZT4KICA8ZXhpZjpEYXRlVGltZT4yMDE4OjAxOjE2IDIy'
                   + 'OjIzOjUzPC9leGlmOkRhdGVUaW1lPgogIDxleGlmOllDYkNyUG9zaXRpb25pbmc+Q28tc2l0ZWQ8L2V4aWY6WUNiQ3JQb3NpdGlv'
                   + 'bmluZz4KICA8ZXhpZjpQcmludEltYWdlTWF0Y2hpbmc+NTQ2IGJ5dGVzIHVuZGVmaW5lZCBkYXRhPC9leGlmOlByaW50SW1hZ2VN'
                   + 'YXRjaGluZz4KICA8ZXhpZjpDb21wcmVzc2lvbj5KUEVHIGNvbXByZXNzaW9uPC9leGlmOkNvbXByZXNzaW9uPgogIDxleGlmOlhS'
                   + 'ZXNvbHV0aW9uPjcyPC9leGlmOlhSZXNvbHV0aW9uPgogIDxleGlmOllSZXNvbHV0aW9uPjcyPC9leGlmOllSZXNvbHV0aW9uPgog'
                   + 'IDxleGlmOlJlc29sdXRpb25Vbml0PkluY2g8L2V4aWY6UmVzb2x1dGlvblVuaXQ+CiAgPGV4aWY6RXhwb3N1cmVUaW1lPjEvNjAg'
                   + 'c2VjLjwvZXhpZjpFeHBvc3VyZVRpbWU+CiAgPGV4aWY6Rk51bWJlcj5mLzMuMzwvZXhpZjpGTnVtYmVyPgogIDxleGlmOkV4cG9z'
                   + 'dXJlUHJvZ3JhbT5DcmVhdGl2ZSBwcm9ncmFtbWUgKGJpYXNlZCB0b3dhcmRzIGRlcHRoIG9mIGZpZWxkKTwvZXhpZjpFeHBvc3Vy'
                   + 'ZVByb2dyYW0+CiAgPGV4aWY6SVNPU3BlZWRSYXRpbmdzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGk+ODA8L3JkZjpsaT4KICAg'
                   + 'PC9yZGY6U2VxPgogIDwvZXhpZjpJU09TcGVlZFJhdGluZ3M+CiAgPGV4aWY6RXhpZlZlcnNpb24+RXhpZiBWZXJzaW9uIDIuMjE8'
                   + 'L2V4aWY6RXhpZlZlcnNpb24+CiAgPGV4aWY6RGF0ZVRpbWVPcmlnaW5hbD4yMDA5OjA2OjE0IDE2OjQ5OjE5PC9leGlmOkRhdGVU'
                   + 'aW1lT3JpZ2luYWw+CiAgPGV4aWY6RGF0ZVRpbWVEaWdpdGl6ZWQ+MjAwOTowNjoxNCAxNjo0OToxOTwvZXhpZjpEYXRlVGltZURp'
                   + 'Z2l0aXplZD4KICA8ZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgPHJkZjpTZXE+CiAgICA8cmRmOmxpPlkgQ2IgQ3Ig'
                   + 'LTwvcmRmOmxpPgogICA8L3JkZjpTZXE+CiAgPC9leGlmOkNvbXBvbmVudHNDb25maWd1cmF0aW9uPgogIDxleGlmOkV4cG9zdXJl'
                   + 'Qmlhc1ZhbHVlPjAuMDAgRVY8L2V4aWY6RXhwb3N1cmVCaWFzVmFsdWU+CiAgPGV4aWY6TWF4QXBlcnR1cmVWYWx1ZT4yLjk3IEVW'
                   + 'IChmLzIuOCk8L2V4aWY6TWF4QXBlcnR1cmVWYWx1ZT4KICA8ZXhpZjpNZXRlcmluZ01vZGU+Q2VudHJlLXdlaWdodGVkIGF2ZXJh'
                   + 'Z2U8L2V4aWY6TWV0ZXJpbmdNb2RlPgogIDxleGlmOkxpZ2h0U291cmNlPlVua25vd248L2V4aWY6TGlnaHRTb3VyY2U+CiAgPGV4'
                   + 'aWY6Rmxhc2ggcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogIDwvZXhpZjpGbGFzaD4KICA8ZXhpZjpGb2NhbExlbmd0aD42LjIg'
                   + 'bW08L2V4aWY6Rm9jYWxMZW5ndGg+CiAgPGV4aWY6TWFrZXJOb3RlPjIwNzYgYnl0ZXMgdW5kZWZpbmVkIGRhdGE8L2V4aWY6TWFr'
                   + 'ZXJOb3RlPgogIDxleGlmOlVzZXJDb21tZW50PiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZXhp'
                   + 'ZjpVc2VyQ29tbWVudD4KICA8ZXhpZjpGbGFzaFBpeFZlcnNpb24+Rmxhc2hQaXggVmVyc2lvbiAxLjA8L2V4aWY6Rmxhc2hQaXhW'
                   + 'ZXJzaW9uPgogIDxleGlmOkNvbG9yU3BhY2U+c1JHQjwvZXhpZjpDb2xvclNwYWNlPgogIDxleGlmOlBpeGVsWERpbWVuc2lvbj4x'
                   + 'MDA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xMTA8L2V4aWY6UGl4ZWxZRGltZW5zaW9u'
                   + 'PgogIDxleGlmOkZpbGVTb3VyY2U+RFNDPC9leGlmOkZpbGVTb3VyY2U+CiAgPGV4aWY6Q3VzdG9tUmVuZGVyZWQ+Tm9ybWFsIHBy'
                   + 'b2Nlc3M8L2V4aWY6Q3VzdG9tUmVuZGVyZWQ+CiAgPGV4aWY6RXhwb3N1cmVNb2RlPkF1dG8gZXhwb3N1cmU8L2V4aWY6RXhwb3N1'
                   + 'cmVNb2RlPgogIDxleGlmOldoaXRlQmFsYW5jZT5BdXRvIHdoaXRlIGJhbGFuY2U8L2V4aWY6V2hpdGVCYWxhbmNlPgogIDxleGlm'
                   + 'OkRpZ2l0YWxab29tUmF0aW8+MS4wMDwvZXhpZjpEaWdpdGFsWm9vbVJhdGlvPgogIDxleGlmOlNjZW5lQ2FwdHVyZVR5cGU+U3Rh'
                   + 'bmRhcmQ8L2V4aWY6U2NlbmVDYXB0dXJlVHlwZT4KICA8ZXhpZjpHYWluQ29udHJvbD5Mb3cgZ2FpbiB1cDwvZXhpZjpHYWluQ29u'
                   + 'dHJvbD4KICA8ZXhpZjpDb250cmFzdD5Ob3JtYWw8L2V4aWY6Q29udHJhc3Q+CiAgPGV4aWY6U2F0dXJhdGlvbj5Ob3JtYWw8L2V4'
                   + 'aWY6U2F0dXJhdGlvbj4KICA8ZXhpZjpTaGFycG5lc3M+Tm9ybWFsPC9leGlmOlNoYXJwbmVzcz4KICA8ZXhpZjpJbnRlcm9wZXJh'
                   + 'YmlsaXR5SW5kZXg+Ujk4PC9leGlmOkludGVyb3BlcmFiaWxpdHlJbmRleD4KICA8ZXhpZjpJbnRlcm9wZXJhYmlsaXR5VmVyc2lv'
                   + 'bj4wMTAwPC9leGlmOkludGVyb3BlcmFiaWxpdHlWZXJzaW9uPgogPC9yZGY6RGVzY3JpcHRpb24+Cgo8L3JkZjpSREY+CjwveDp4'
                   + 'bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+Cv/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEO'
                   + 'CwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU'
                   + 'FBQUFBQUFBQUFBQUFBQUFP/CABEIAGQASwMBIQACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQMGAQIHCAD/xAAaAQEAAwEB'
                   + 'AQAAAAAAAAAAAAAAAgMEAQUG/9oADAMBAAIQAxAAAAHgbDhzTox9V9X+g8Tz5wzwvU+Iom/T1aLfVdPPWjb3fmvNnKfF+maE53WR'
                   + '8OkVrfzuud+HkFfy7kTAWgqFDCdnrAHXk5BXK7FDkr+IyYSxl6urmnLxvSm7EPVXXlumO/KzlMPGkXX0gODWNOrS6aEEYJsRaULN'
                   + 'NSSk7WkYAKCtaFpxSrUu1MOB5IGNDXSb6Sx8ABGkl4pOuTTT4m1OKu4NzwUMPhNVIvshIyI8iyIkhP/EACQQAAICAQQCAgMBAAAA'
                   + 'AAAAAAIDAQQFABESEwYiFSMhJDIU/9oACAEBAAEFAqVc9dux4MSRSWybR+N1249ACIVfK/KwBymgVnIPJTEVhlVTGE4MhiXLuOrW'
                   + 'fhamHevK1FtSRWngnz6s1maXWeiL6ZXkJqzvDhlUHU7xzFQ308gN68ddbNQ6T15YI2M43qbNFI8OQ6+QK4oMVzsNRIJ8NUa825Uy'
                   + 'nFPVZTnZJ2XNbA1bXZAvmL06C8msh9v/AFLwsri1jihfmiz2RjD4VSdFtzfqmJ5RwnV3x1NpheIHBUccugPLYHWQCtYjjRjqAScG'
                   + '8bEYnJRB7yRTpLe6E/sNcVsrFIWCDNiWUhtH4LjGlx6mX4q/c+iR1tM6jtuJQK7Dcwue3Id4sDEF/M+2hMq9mT6VV7qRx+T+7U+h'
                   + 'JKNgVzb7aX/XYQaUoWttVzKrie8KeUA1ny2HjECTpWvonQTxQTZ0CgVbopg0WctUwRs5ZC0lXSJmJTtMSpKeuqzsEWfXKe5FG9bp'
                   + 'Ez9uyRLHROYQQyBlsjs3saypG9evP0oKYS/0qcYimFVbBEBAXR71xjfX/8QAIhEAAgICAQMFAAAAAAAAAAAAAAECEQMSIRMiMgQQ'
                   + 'IDNQ/9oACAEDAQE/ASXizB9jZBO7MhrI1a5K9Qn2x4MUZLHTNWKaZkfbRBUuTeJ1IkPIyjmlx7xdOyUthQ6k6+MOyW343//EACQR'
                   + 'AAIBAwMDBQAAAAAAAAAAAAECAAMREiAhMQQQEzAyM0FR/9oACAECAQE/Abw8idYQBt9yp75UiOMpmvF43gbctKzrnzHIMVCDMCzA'
                   + 'jtURme4mDQoRvKcCEqW7sLi0VcZn46LHTV+LH90O2MNQsLaKmmppqRRtoqRePV//xAA4EAACAQIDBQQHBgcAAAAAAAABAgADERIh'
                   + 'MQQTIkFRMkJhcSMzYoGSobEQQ1JygpEFFFNjwdHw/9oACAEBAAY/AtoqVewuR/1EZOHLn+GxtNv22r9xs+FR7dTh+kVVNiCALTaa'
                   + 'FzUXFfTwmINhuNJW2FTgCHiAT1kUBe9rN2nE63u3TOLdsPhMDGy949T1gZU3qDLXUCbFsNJA9asTtdVDoq3sov5WPvlAhfR7wfWV'
                   + 'cCE3Mtg06iNWVVQui5HnlMRRtf8AMqm3CeIGdI2PP2gIpq1BgQXIlSvWqq9Ss2KoBllyUe6UMOEiu4tYac4r53Gmf/dI4NRhZl0l'
                   + '8TLuqQy7Q166y5AN8rW0lSgVFWtQa6Dm6azN6cpLSXta3m6ephSxf3iLuwrktbs5zZEv3rkHyg9nMxyuK2MpczaSv4iPcIOflKe0'
                   + 'UlK1kPC46TP+E0b+YgpI4p1U5GFqbgMrAEyozcS01z85QqKCKJLZfpMqH2ecpOyhS7NcD6ypVHfJPlnLXmZnd+GbzeGm3M2ll2m6'
                   + 'HWCj2kPabrEYC9RWBy55yscV+DQSjbEPRk5D3yyDDCai8MyyEvgaWHaGsJLFjyBlRHsuV+GVsrhNBAjbS6MMyquyr8jKpq1Hqsim'
                   + '+Kox198JtZfnFy/cXhI6Xn3fzl+YmInSEhPWLlnA65Yns0WpbUN++UrYRh3uBb/WCxy8BEBNQkHOwEOvTOZ7wn8gl1yEzisq4ugi'
                   + 'thxAZEePWLXppvArYiE1lBN2pV+PXTmJan6vsm+t4Sys5PQy6ginlivyznZPxy2o6QB6WEMGtETEQX4R+aYV9cr6dY6U6TVDiIIQ'
                   + '2tACcVTB6Tw6fKVCHDrAWHAefSWYEr/UTIDz+xT2OPsjQykbd6elHBjw/FP5gerd/wB/amA1MNYrwqJUqPTHEdYQygNbu9zyigVM'
                   + 'ZtpLOMukXsfDEU9hecAtc3NoS+LHj5TdbOL0eSvyEq1do46uQB8IbsZw1DnocMsczzJFrSpZv1mM61sAPd6RYg8bRh/clMjUAiK3'
                   + 'OwlyNJUIUA5fZ5/Z/8QAJRABAAMAAgEEAgMBAQAAAAAAAQARITFBYVFxgZGhwbHR8eHw/9oACAEBAAE/IXcDBfz7vE7lJUxX/Qhn'
                   + 'vIylyV8CJcTHk1+4VnGvcIMag85zWLAq8L/PxFPF3K5NaGAetOfcQxdd+IFa1L+vv0l9ZcqHU+f1BZ7obB3gIudwaDmFeguISQLV'
                   + '5FyLYeCp7JzBw2mUC4OHedJEGW2vjEBjK0lbNRMZ24n8V8wjw8sVr0VUPieiFyYfpxF307Kcw8eYTgDs1/UHXC5X8JxTlxSnrNiz'
                   + '3kdPWrqvEEOR7kHL5jHidjUqW9B+WEKO9wrvibk7R4pOfUfdrQelsNdYhy8/WxuDQ36k21Xj1Q6GdvzOX69VP8x8xF6dzVIr9bNz'
                   + '0V1rPxD1oFOLOOBRrNGf7BogM0aofhNbwT3Wgpp3xAOxPE/8zFt7Sm97He9rqueIGdgv4Rwh1SnC/wAXKuaeSKGP/uoCMla3f9Tj'
                   + 'IngWCRqB6cA8r2hu1cr+pS9uAPqVmo9JA+kQO7zfuaYOKMK4l47WWF9wH2txURg4XXlAVpNsrP1O0N6Kir08B/aGH2rE6Dr6x13S'
                   + '6XWfqBIsdgNkNiIPNxj9wjopF3wfkMLAC9CcXC12Pt7R3DvvtXAwew/8I7Wb0R0rRK/0K9CZ02nvtD/abLR3Dg0ha7fwCTDtWzqb'
                   + 'cK+ktr4/2DUXkr27+4ZmWKO2e8mXrlTmq/uUI/cPfg+qnDLAPt+Lh4bkcfHUCFzX4PihCvmRtN1qLMdhm88dngUOZ5GefCtcJjk8'
                   + 'OPuFxWm9dHZUldh6P2ZaR5pe81GXX7m8harMfa+PmZFGa0iyhHp0hcuHrltKTOkz+nZ8TVVC/hkTkpv7JKVdqHil8QNBD04lxB1B'
                   + 'LqC9y9k1XWeTJVg+xRRGdK/uljMGfmddiXxUqU3tANt4zivgnWkIt2kQb05jPgn/2gAMAwEAAgADAAAAEMKSIRKFsTx7eQzCNgTI'
                   + 'KIwMiKjIwoxAJEhEhMzIAEDIT//EAB4RAQEBAAIBBQAAAAAAAAAAAAEAESExYRAgQVCx/9oACAEDAQE/ELmEUR1MAOILmF4pVo4x'
                   + 'tgV0/s7DG8clgwCXbMZAju8l1XwkNeuFDxxMpc9vJHO/Tf/EAB8RAQACAgICAwAAAAAAAAAAAAEAESAhMUEQYTCRsf/aAAgBAgEB'
                   + 'PxADoYVT2Q8MUF/RDrOsotxOlspEoS6PyAJFRTCqkpBo5jzDJaJ6oDad4SODAjWtiVy4YbOBx5SlQo+MOsMOsMOsJNmAWqIUN/L/'
                   + 'AP/EACYQAQEAAgICAgICAgMAAAAAAAERACExUUFhcYGRobHhwfAQ0fH/2gAIAQEAAT8QFfsadU7Ol7ZaC8eiCx4l/MwuiN0SYeWu'
                   + 'G4j5zehepZ6znSyaT5TNHjuP4yKOPxIA655Msumpk2E0DC+cGKgQprvfHX5xyIWlsAZywX3cRodwJ6YfkCqCjk55byzogQBY7iuE'
                   + '0d/3izijwDErqdOgD+ufrBYT1jgGefbkBaO1FQ/PjExnvIIQO2OFQlJOwI9Bz9ZNRwlqQ9bzUAXmOsgW0jaBxK8z7wQe+8gvHy1w'
                   + 'bj94bi6GG0EBPNK3zj7FhsRdOWu5jkJ2q3Ro87/T3jHvoGin/duXGiUpQSEaXhzLq4yDNdDG+G7rjrAKmolGkPLhN9MDNfnZkqsg'
                   + 'gQT4XrAtd1qjz8D+rCEXiIag8Cz4DGewpKl/5YAaOuwJ/D/OC+UzIlpt0IvY684SMOWkARl8zNGbPNZJzQ7yBuXxiTy7YqkvY/FZ'
                   + 'Ee2GigevC5W0twXsz3P1k7rE2iY+xif0pBAb45TKsV40nye/4YFyeBsU9AveUppLelD3xMRgUWvLOYjwcOf+CJVrADRzvEBpJuac'
                   + 'LuRxreJowCOKWnIxDbePJ6uGSP3q1ATzXjtiSJeUk3uvMfWNtREDjTf8YQ9MSqO/GAn0IN6QcN5gsf7YldNCI/b+8O7waOq2APXn'
                   + 'xgWl9ah8Sr43nCADiCYWG621OMolAGiAkIdZdStbSTP1AVIJFdTrWEcToTgk8czxxcaoCm4k8JMY2dLXYUCeDWOEB6UMgYey703v'
                   + 'T5xsk3sht/5ms9UpaX57WEjSe17NjPkxbmy15G/F0831immtuqDB4vAkzemVGtjNJOZjBuS9CDB2xu8Ru6af94w4v4Tr8GEaM14O'
                   + 'cWg9TnoKkS7Q+Wv3g8TMtDyewr9YMH0Q3H42X6ylmg+yxp4cIbYDVkzD3o+riYTKvlL3yn3ltAdOgU+m/vIDX9MZQ4Uk5J+4/WFs'
                   + 'JHLzW+o/OLYEdiFSnaX3iYLboAdX3vyyiMVGj8No04YXDOegNdLp/BYzOcAlChdjvb1c3DargiS/NfxinlC4wrpCPdyP/dis8k1g'
                   + 'o5Neb9YIVoMW+NPjV6piUcykADXoGr4x+laZpiHzkE8C5cWS2tm08hsl531iaOisAAG/gMN0kQbLkfgeFgGicgpvU5ySi+beXZyW'
                   + '34TBBNDr+rCFqD8sFkrrzmn6xFXTtoH6BhcnM22n4g36zWVtnOg+m/1mpm6vT4wXaDkW9/q4H4NN0va7/BjnIOX0efXH1lKivRHW'
                   + 'HVRHjGVETU3Kv8GEZIi8wUw8AweWunvGZFjtzku4u2m73+cvP8B5kzetayQ8C4ZD2IM1/jBP6s//2Q==';
this.milkcatWide = '/9j/4AAQSkZJRgABAQEAoACgAAD/4RI9RXhpZgAASUkqAAgAAAAMAA4BAgAgAAAAngAAAA8BAgAYAAAAvgAAABABAgAQAAAA1gAA'
                   + 'ABIBAwABAAAAAQAAABoBBQABAAAA5gAAABsBBQABAAAA7gAAACgBAwABAAAAAgAAADEBAgAMAAAA9gAAADIBAgAUAAAAAgEAABMC'
                   + 'AwABAAAAAgAAAGmHBAABAAAAOAMAAKXEBwAiAgAAFgEAAMINAABPTFlNUFVTIERJR0lUQUwgQ0FNRVJBICAgICAgICAgAE9MWU1Q'
                   + 'VVMgSU1BR0lORyBDT1JQLiAgAEZFMzEwLFg4NDAsQzUzMACgAAAAAQAAAKAAAAABAAAAR0lNUCAyLjguMTYAMjAxODowMToxNiAy'
                   + 'MjoyODoyMQBQcmludElNADAzMDAAACUAAQAUABQAAgABAAAAAwDuAAAABwAAAAAACAAAAAAACQAAAAAACgAAAAAACwA2AQAADAAA'
                   + 'AAAADQAAAAAADgBOAQAAEAByAQAAIADGAQAAAAEDAAAAAQH/AAAAAgGDAAAAAwGDAAAABAGDAAAABQGDAAAABgGDAAAABwGAgIAA'
                   + 'EAGAAAAAAAIAAAAABwIAAAAACAIAAAAACQIAAAAACgIAAAAACwLoAQAADQIAAAAAIAIAAgAAAAMDAAAAAQP/AAAAAgODAAAAAwOD'
                   + 'AAAABgODAAAAEAOAAAAAAAQAAAAACREAABAnAAALDwAAECcAAJcFAAAQJwAAsAgAABAnAAABHAAAECcAAF4CAAAQJwAAiwAAABAn'
                   + 'AADLAwAAECcAAOUbAAAQJwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAABQUFAAAAQECAgMDA//8AAEBAgIDAwP//AABAQICAwMD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQAA'
                   + 'AEBAgIDAwP//AABAQICAwMD//wAAQECAgMDA//8fAJqCBQABAAAAsgQAAJ2CBQABAAAAugQAACKIAwABAAAABQAAACeIAwABAAAA'
                   + 'UAAAAACQBwAEAAAAMDIyMQOQAgAUAAAAwgQAAASQAgAUAAAA1gQAAAGRBwAEAAAAAQIDAASSCgABAAAA6gQAAAWSBQABAAAA8gQA'
                   + 'AAeSAwABAAAAAgAAAAiSAwABAAAAAAAAAAmSAwABAAAAGAAAAAqSBQABAAAA+gQAAHySBwAcCAAAAgUAAIaSBwB9AAAAHg0AAACg'
                   + 'BwAEAAAAMDEwMAGgAwABAAAAAQAAAAKgBAABAAAAZAAAAAOgBAABAAAASwAAAAWgBAABAAAApA0AAACjBwABAAAAAwAAAAGkAwAB'
                   + 'AAAAAAAAAAKkAwABAAAAAAAAAAOkAwABAAAAAAAAAASkBQABAAAAnA0AAAakAwABAAAAAAAAAAekAwABAAAAAQAAAAikAwABAAAA'
                   + 'AAAAAAmkAwABAAAAAAAAAAqkAwABAAAAAAAAAAAAAAABAAAAPAAAACEAAAAKAAAAMjAwOTowNjoxNCAxNjo0OToxOQAyMDA5OjA2'
                   + 'OjE0IDE2OjQ5OjE5AAAAAAAKAAAAKQEAAGQAAABsAgAAZAAAAE9MWU1QAAEAGQAEAQIABgAAADgGAAAAAgQAAwAAAD4GAAACAgMA'
                   + 'AQAAAAAAAAADAgMAAQAAAAAAAAAEAgUAAQAAAEoGAAAFAgUAAQAAAFIGAAAGAggABgAAAFoGAAAHAgIABgAAAGYGAAAJAgcAIAAA'
                   + 'AGwGAAAKAgQAAgAAAIwGAAALAgUAAQAAAJQGAAABBAMAAQAAAAEAAAACBAQAAQAAAAEQAAIDBAMAAQAAAAEAAAAABQMAAQAAAAAA'
                   + 'AAAgIAcANgAAAJwGAAAAIQcAuAAAANIGAAAAIgcAGgEAAIoHAAAAIwcA9gAAAKQIAAAAJAcAHgAAAJoJAAAAJQcAHgAAALgJAAAA'
                   + 'JgcA6gAAANYJAAAAJwcAQgAAAMAKAAAAKAcACgIAAAILAAAAKQcAEgAAAAwNAAAxLjAwMwAAAAAAAAAAAAAAAABkAAAAZAAAAEcc'
                   + 'AADoAwAASf/F/mD+Tf/N/m/+RDQzNjgAT0xZTVBVUyBESUdJVEFMIENBTUVSQSAgICAgICAgIAAAAAAAAAAAAAgAAAABAAAABAAA'
                   + 'AAcABAAAADAxMDAAAQQAAQAAAAAAAAABAQQAAQAAAAAAAAACAQQAAQAAAAAAAAAAAAAADgAAAQIACgAAAJgHAAABAQIAAwAAAE9L'
                   + 'AAACAQIAAwAAAE9LAAADAQIAAwAAAE9LAAAEAQIAAwAAAE9LAAARAQIAAwAAAE9LAAAGAQIAAwAAAE9LAAAIAQIAAwAAAE9LAAAP'
                   + 'AQIAAwAAAE9LAAAJAQMAAQAAAPYAAAAQAQMAAQAAAD4AAAAKAQMAAQAAAHMNAAAOAQMAAQAAAKIAAAASAQMAAQAAAO4CAAAAAAAA'
                   + 'MS4wMDMAhwEgEBcAAAIEAAEAAACtKAEAAQIEAAEAAAD0LAAAAgIBAAEAAAAAAAAAAwIDAAEAAAAdAAAABAIBAAEAAAABAAAABgIE'
                   + 'AAEAAAC+IgEABwIEAAEAAAByOgAACAIBAAEAAAAAAAAACQIDAAEAAAAcAQAACgIBAAEAAAAAAAAADAIDAAEAAABiAAAADQIDAAEA'
                   + 'AACBAAAADgIDAAEAAABkAAAADwIDAAEAAAB4AAAAFAIDAAEAAAAGAAAAFQIDAAEAAACAAAAAFwIDAAEAAACBAAAAGAIDAAEAAAAA'
                   + 'AAAAGQIDAAEAAABmAAAAGgIDAAEAAABwAAAAHwIBAAEAAAAAAAAAIgIBAAEAAAAAAAAAJQIDAAEAAACQAAAAAAAAABQAAAMBAAEA'
                   + 'AAAAAAAAAQMBAAEAAAAAAAAAAgMBAAEAAAAAAAAAAwMEAAEAAAAAAAAABAMDAAEAAACgAAAABQMDAAEAAAAFAQAACgMDAAEAAAAA'
                   + 'AAAADAMBAAEAAAAAAAAADQMBAAEAAAAAAAAADgMDAAEAAABcAAAADwMDAAEAAAAAAAAAEwMDAAEAAAAc/wAAFAMDAAEAAAAAAAAA'
                   + 'FQMDAAEAAAAAAAAAGAMDAAEAAABIQAAAIAMDAAEAAAC1DgAAIQMDAAEAAACyDgAAIgMDAAEAAAAAAAAAIwMDAAEAAABkAAAAJAMD'
                   + 'AAEAAAC8AgAAAAAAAAIAAAQBAAEAAAADAAAAAQQDAAEAAAC7DAAAAAAAAAIAAgUBAAEAAAAKAAAABAUDAAEAAAAAAAAAAAAAABMA'
                   + 'AAYEAAEAAACAreYAAQYEAAEAAADwKnwBAgYEAAEAAAAQfP8AAwYDAAEAAACHBgAABAYDAAEAAABhBgAABwYDAAEAAABWBAAACAYD'
                   + 'AAEAAACUCQAACQYDAAEAAAB5AgAACgYBAAEAAAAIAAAACwYDAAEAAAAABAAADAYDAAEAAAAABAAAEgYDAAEAAACrAQAAFAYDAAEA'
                   + 'AACfAQAAGgYDAAEAAAABAAAAHgYEAAEAAAAAAAAAHwYEAAEAAAAAAAAAIAYEAAEAAAAAAAAAKQYDAAEAAAAMCAAAKgYDAAEAAACb'
                   + 'BQAAAAAAAAUAAAcIAAEAAAAmAAAAAQcIAAEAAAD//gAAAgcIAAEAAADN/gAAAwcIAAEAAAABAAAABAcBAAEAAAACAAAAAAAAABcA'
                   + 'AQgBAAEAAAAAAAAAAggBAAEAAAAAAAAABAgDAAEAAAACAAAABQgJAAEAAAA6BQAABggIAAEAAAAoAAAABwgDAAEAAAAHAAAACwgI'
                   + 'AAEAAAAXBQAADAgIAAEAAACIBQAADQgDAAEAAAAGAAAADggEAAEAAAAKAAAADwgIAAEAAAA6BQAAEAgDAAEAAAC1AAAAEQgDAAEA'
                   + 'AACHAQAAEggDAAEAAABkAAAAFAgDAAEAAAA7BQAAFQgDAAEAAADPMwAAFggDAAEAAABMBAAAFwgDAAEAAAC+AAAAGAgDAAEAAAB4'
                   + 'AAAAIQgDAHgAAAA0DAAAHwgBAAEAAAABAAAAJwgIAAEAAAAnBQAAKAgIAAEAAACWYAAAAAAAADoNtA92ESIVuhlULs8zGii0GQAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQkB'
                   + 'AAEAAAAAAAAAAAAAAEFTQ0lJAAAAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgAGQAAABkAAAAAgAB'
                   + 'AAIABAAAAFI5OAACAAcABAAAADAxMDAAAAAABgADAQMAAQAAAAYAAAAaAQUAAQAAABAOAAAbAQUAAQAAABgOAAAoAQMAAQAAAAIA'
                   + 'AAABAgQAAQAAACAOAAACAgQAAQAAABUEAAAAAAAASAAAAAEAAABIAAAAAQAAAP/Y/+AAEEpGSUYAAQEAAAEAAQAA/9sAQwAoHB4j'
                   + 'HhkoIyEjLSsoMDxkQTw3Nzx7WF1JZJGAmZaPgIyKoLTmw6Cq2q2KjMj/y9ru9f///5vB////+v/m/f/4/9sAQwErLS08NTx2QUF2'
                   + '+KWMpfj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4/8AAEQgAOABLAwEiAAIRAQMRAf/E'
                   + 'AB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGh'
                   + 'CCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqS'
                   + 'k5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEB'
                   + 'AQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1Lw'
                   + 'FWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZ'
                   + 'mqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8Az0j6nBJ7'
                   + 'UMWVsEVc3Ko7Cm+YmeUJ9qm47EKDyoDIfvP8q/1NQIrNIqnucVcM4zuZeadBKssyBVAyfSmFi9BGIgygkDNWd6bOvNMwAATnPtSg'
                   + '7s/WtHK5nymZfzypKUBGzqMCs9X+cE9jWpeFWuOn3RioDsI5UflWb3LsU5M7yvQClG0DBU1YGwHDgY7Mf61IEX0U++RQFiDekeAc'
                   + '7h60vnLyVOD0qcgH3o2r12rn6UwIoVDk7gSo/WnQrsvEYLhKkB6gdqRcvkDoKQGscbST2FRRkLGpPc561Va6lOVwBTlndlIYD5RT'
                   + 'voBCfnYvjqaQr7Upz1oPTrQAzYp6gUmxf7o/Kn+9Az7UAMFHWmhuM9qd6AHNACK2H59KUYUA5x60gGXHFS+VuXA9eDSYDxgjeWGP'
                   + 'WiQ7Rx/F7UiW7Km0uAKhkbLEKScd/WhAOz60cfQU1T1PT8aXjvTAdyTQCcUzPYUYz60ARKcgZ6elSAggYFFFABjIyTzmpEeSMADG'
                   + '33oooAa5aRt75PpTcEdAaKKAFzkUHAxRRQAZyD1ph3E5DY9qKKAP/9n/4Q9IaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8'
                   + 'P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fk'
                   + 'b2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgt'
                   + 'bnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHhtbG5zOmV4aWY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvJz4KICA8ZXhp'
                   + 'ZjpJbWFnZURlc2NyaXB0aW9uPk9MWU1QVVMgRElHSVRBTCBDQU1FUkEgICAgICAgICA8L2V4aWY6SW1hZ2VEZXNjcmlwdGlvbj4K'
                   + 'ICA8ZXhpZjpNYWtlPk9MWU1QVVMgSU1BR0lORyBDT1JQLiAgPC9leGlmOk1ha2U+CiAgPGV4aWY6TW9kZWw+RkUzMTAsWDg0MCxD'
                   + 'NTMwPC9leGlmOk1vZGVsPgogIDxleGlmOk9yaWVudGF0aW9uPlRvcC1sZWZ0PC9leGlmOk9yaWVudGF0aW9uPgogIDxleGlmOlhS'
                   + 'ZXNvbHV0aW9uPjE2MDwvZXhpZjpYUmVzb2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj4xNjA8L2V4aWY6WVJlc29sdXRpb24+'
                   + 'CiAgPGV4aWY6UmVzb2x1dGlvblVuaXQ+SW5jaDwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpTb2Z0d2FyZT4xLjAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgPC9leGlmOlNvZnR3YXJlPgogIDxleGlmOkRhdGVUaW1lPjIwMDk6MDY6MTQgMTY6NDk6'
                   + 'MTk8L2V4aWY6RGF0ZVRpbWU+CiAgPGV4aWY6WUNiQ3JQb3NpdGlvbmluZz5Dby1zaXRlZDwvZXhpZjpZQ2JDclBvc2l0aW9uaW5n'
                   + 'PgogIDxleGlmOlByaW50SW1hZ2VNYXRjaGluZz41NDYgYnl0ZXMgdW5kZWZpbmVkIGRhdGE8L2V4aWY6UHJpbnRJbWFnZU1hdGNo'
                   + 'aW5nPgogIDxleGlmOkNvbXByZXNzaW9uPkpQRUcgY29tcHJlc3Npb248L2V4aWY6Q29tcHJlc3Npb24+CiAgPGV4aWY6WFJlc29s'
                   + 'dXRpb24+NzI8L2V4aWY6WFJlc29sdXRpb24+CiAgPGV4aWY6WVJlc29sdXRpb24+NzI8L2V4aWY6WVJlc29sdXRpb24+CiAgPGV4'
                   + 'aWY6UmVzb2x1dGlvblVuaXQ+SW5jaDwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpJbWFnZURlc2NyaXB0aW9uPk9MWU1Q'
                   + 'VVMgRElHSVRBTCBDQU1FUkEgICAgICAgICA8L2V4aWY6SW1hZ2VEZXNjcmlwdGlvbj4KICA8ZXhpZjpNYWtlPk9MWU1QVVMgSU1B'
                   + 'R0lORyBDT1JQLiAgPC9leGlmOk1ha2U+CiAgPGV4aWY6TW9kZWw+RkUzMTAsWDg0MCxDNTMwPC9leGlmOk1vZGVsPgogIDxleGlm'
                   + 'Ok9yaWVudGF0aW9uPlRvcC1sZWZ0PC9leGlmOk9yaWVudGF0aW9uPgogIDxleGlmOlhSZXNvbHV0aW9uPjE2MDwvZXhpZjpYUmVz'
                   + 'b2x1dGlvbj4KICA8ZXhpZjpZUmVzb2x1dGlvbj4xNjA8L2V4aWY6WVJlc29sdXRpb24+CiAgPGV4aWY6UmVzb2x1dGlvblVuaXQ+'
                   + 'SW5jaDwvZXhpZjpSZXNvbHV0aW9uVW5pdD4KICA8ZXhpZjpTb2Z0d2FyZT5HSU1QIDIuOC4xNjwvZXhpZjpTb2Z0d2FyZT4KICA8'
                   + 'ZXhpZjpEYXRlVGltZT4yMDE4OjAxOjE2IDIxOjMyOjI3PC9leGlmOkRhdGVUaW1lPgogIDxleGlmOllDYkNyUG9zaXRpb25pbmc+'
                   + 'Q28tc2l0ZWQ8L2V4aWY6WUNiQ3JQb3NpdGlvbmluZz4KICA8ZXhpZjpQcmludEltYWdlTWF0Y2hpbmc+NTQ2IGJ5dGVzIHVuZGVm'
                   + 'aW5lZCBkYXRhPC9leGlmOlByaW50SW1hZ2VNYXRjaGluZz4KICA8ZXhpZjpDb21wcmVzc2lvbj5KUEVHIGNvbXByZXNzaW9uPC9l'
                   + 'eGlmOkNvbXByZXNzaW9uPgogIDxleGlmOlhSZXNvbHV0aW9uPjcyPC9leGlmOlhSZXNvbHV0aW9uPgogIDxleGlmOllSZXNvbHV0'
                   + 'aW9uPjcyPC9leGlmOllSZXNvbHV0aW9uPgogIDxleGlmOlJlc29sdXRpb25Vbml0PkluY2g8L2V4aWY6UmVzb2x1dGlvblVuaXQ+'
                   + 'CiAgPGV4aWY6RXhwb3N1cmVUaW1lPjEvNjAgc2VjLjwvZXhpZjpFeHBvc3VyZVRpbWU+CiAgPGV4aWY6Rk51bWJlcj5mLzMuMzwv'
                   + 'ZXhpZjpGTnVtYmVyPgogIDxleGlmOkV4cG9zdXJlUHJvZ3JhbT5DcmVhdGl2ZSBwcm9ncmFtbWUgKGJpYXNlZCB0b3dhcmRzIGRl'
                   + 'cHRoIG9mIGZpZWxkKTwvZXhpZjpFeHBvc3VyZVByb2dyYW0+CiAgPGV4aWY6SVNPU3BlZWRSYXRpbmdzPgogICA8cmRmOlNlcT4K'
                   + 'ICAgIDxyZGY6bGk+ODA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvZXhpZjpJU09TcGVlZFJhdGluZ3M+CiAgPGV4aWY6RXhp'
                   + 'ZlZlcnNpb24+RXhpZiBWZXJzaW9uIDIuMjE8L2V4aWY6RXhpZlZlcnNpb24+CiAgPGV4aWY6RGF0ZVRpbWVPcmlnaW5hbD4yMDA5'
                   + 'OjA2OjE0IDE2OjQ5OjE5PC9leGlmOkRhdGVUaW1lT3JpZ2luYWw+CiAgPGV4aWY6RGF0ZVRpbWVEaWdpdGl6ZWQ+MjAwOTowNjox'
                   + 'NCAxNjo0OToxOTwvZXhpZjpEYXRlVGltZURpZ2l0aXplZD4KICA8ZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgPHJk'
                   + 'ZjpTZXE+CiAgICA8cmRmOmxpPlkgQ2IgQ3IgLTwvcmRmOmxpPgogICA8L3JkZjpTZXE+CiAgPC9leGlmOkNvbXBvbmVudHNDb25m'
                   + 'aWd1cmF0aW9uPgogIDxleGlmOkV4cG9zdXJlQmlhc1ZhbHVlPjAuMDAgRVY8L2V4aWY6RXhwb3N1cmVCaWFzVmFsdWU+CiAgPGV4'
                   + 'aWY6TWF4QXBlcnR1cmVWYWx1ZT4yLjk3IEVWIChmLzIuOCk8L2V4aWY6TWF4QXBlcnR1cmVWYWx1ZT4KICA8ZXhpZjpNZXRlcmlu'
                   + 'Z01vZGU+Q2VudHJlLXdlaWdodGVkIGF2ZXJhZ2U8L2V4aWY6TWV0ZXJpbmdNb2RlPgogIDxleGlmOkxpZ2h0U291cmNlPlVua25v'
                   + 'd248L2V4aWY6TGlnaHRTb3VyY2U+CiAgPGV4aWY6Rmxhc2ggcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogIDwvZXhpZjpGbGFz'
                   + 'aD4KICA8ZXhpZjpGb2NhbExlbmd0aD42LjIgbW08L2V4aWY6Rm9jYWxMZW5ndGg+CiAgPGV4aWY6TWFrZXJOb3RlPjIwNzYgYnl0'
                   + 'ZXMgdW5kZWZpbmVkIGRhdGE8L2V4aWY6TWFrZXJOb3RlPgogIDxleGlmOlVzZXJDb21tZW50PiAgICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'
                   + 'ICAgICAgICAgICAgICAgICAgICAgIDwvZXhpZjpVc2VyQ29tbWVudD4KICA8ZXhpZjpGbGFzaFBpeFZlcnNpb24+Rmxhc2hQaXgg'
                   + 'VmVyc2lvbiAxLjA8L2V4aWY6Rmxhc2hQaXhWZXJzaW9uPgogIDxleGlmOkNvbG9yU3BhY2U+c1JHQjwvZXhpZjpDb2xvclNwYWNl'
                   + 'PgogIDxleGlmOlBpeGVsWERpbWVuc2lvbj41MDA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogIDxleGlmOlBpeGVsWURpbWVuc2lv'
                   + 'bj4zNzU8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogIDxleGlmOkZpbGVTb3VyY2U+RFNDPC9leGlmOkZpbGVTb3VyY2U+CiAgPGV4'
                   + 'aWY6Q3VzdG9tUmVuZGVyZWQ+Tm9ybWFsIHByb2Nlc3M8L2V4aWY6Q3VzdG9tUmVuZGVyZWQ+CiAgPGV4aWY6RXhwb3N1cmVNb2Rl'
                   + 'PkF1dG8gZXhwb3N1cmU8L2V4aWY6RXhwb3N1cmVNb2RlPgogIDxleGlmOldoaXRlQmFsYW5jZT5BdXRvIHdoaXRlIGJhbGFuY2U8'
                   + 'L2V4aWY6V2hpdGVCYWxhbmNlPgogIDxleGlmOkRpZ2l0YWxab29tUmF0aW8+MS4wMDwvZXhpZjpEaWdpdGFsWm9vbVJhdGlvPgog'
                   + 'IDxleGlmOlNjZW5lQ2FwdHVyZVR5cGU+U3RhbmRhcmQ8L2V4aWY6U2NlbmVDYXB0dXJlVHlwZT4KICA8ZXhpZjpHYWluQ29udHJv'
                   + 'bD5Mb3cgZ2FpbiB1cDwvZXhpZjpHYWluQ29udHJvbD4KICA8ZXhpZjpDb250cmFzdD5Ob3JtYWw8L2V4aWY6Q29udHJhc3Q+CiAg'
                   + 'PGV4aWY6U2F0dXJhdGlvbj5Ob3JtYWw8L2V4aWY6U2F0dXJhdGlvbj4KICA8ZXhpZjpTaGFycG5lc3M+Tm9ybWFsPC9leGlmOlNo'
                   + 'YXJwbmVzcz4KICA8ZXhpZjpJbnRlcm9wZXJhYmlsaXR5SW5kZXg+Ujk4PC9leGlmOkludGVyb3BlcmFiaWxpdHlJbmRleD4KICA8'
                   + 'ZXhpZjpJbnRlcm9wZXJhYmlsaXR5VmVyc2lvbj4wMTAwPC9leGlmOkludGVyb3BlcmFiaWxpdHlWZXJzaW9uPgogPC9yZGY6RGVz'
                   + 'Y3JpcHRpb24+Cgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+Cv/bAEMAKBweIx4ZKCMhIy0rKDA8'
                   + 'ZEE8Nzc8e1hdSWSRgJmWj4CMiqC05sOgqtqtiozI/8va7vX///+bwf////r/5v3/+P/bAEMBKy0tPDU8dkFBdviljKX4+Pj4+Pj4'
                   + '+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+P/CABEIAEsAZAMBIQACEQEDEQH/xAAYAAEBAQEBAAAA'
                   + 'AAAAAAAAAAAAAQIDBP/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAwDAQACEAMQAAAB81J0k4+nU9OzzeWW5lpOyalsnoNtTjwz'
                   + 'QoomVnvsU4cxk0MQbjPtpU8xQgQtJuLa5gAglJuAipQMhC2N5IoAzQNovItqAM0ouo5q1AIM6KNQUzTNIP/EAB8QAAIBBAMBAQAA'
                   + 'AAAAAAAAAAABEQIQEiEgMDFBA//aAAgBAQABBQKL+UlC1aupptivBAqURLxRStW/RGJEGJiTw2IdqvbeEkwZElI9i8qt7y0RdVQs'
                   + 'yelcPnUmfX14kJdacDfd95f/xAAYEQACAwAAAAAAAAAAAAAAAAABEBEwUP/aAAgBAwEBPwFGiNz/xAAaEQACAgMAAAAAAAAAAAAA'
                   + 'AAAAARARIDFQ/9oACAECAQE/AYW80WPt/wD/xAAcEAACAAcAAAAAAAAAAAAAAAABECAhMDFAYGH/2gAIAQEABj8CfSgac4Rg2Ouf'
                   + '/8QAIBAAAwACAgMBAQEAAAAAAAAAAAERITEQQSBRcYFhMP/aAAgBAQABPyFUylpvfx+FP1AhkVCjNGVsUmRFozaeh5X4QywUT2Qz'
                   + 'difZ379n8syNcDo7E6OifY0GmxaHpyZFdFj0QEYThF2aWCtrB7Q2EWG18p6ELpcXoxRsnGO+uN/4FjJhoSwa8WPBYZ0ZIy6YjGrP'
                   + 'nF/hovG+FsSPcaFb/Bu5FvxWhQ+E0NxlGyLBDXh0V9COzpnQhbGJjheH/9oADAMBAAIAAwAAABADmlLGVuaxpMJEBHg8DMBkyACC'
                   + 'wIDA7wwMguDMSKxMwEAAwP/EABwRAAICAgMAAAAAAAAAAAAAAAABESAQMSFBUP/aAAgBAwEBPxDGghapA0REuCCKd3W7rx//xAAc'
                   + 'EQACAgMBAQAAAAAAAAAAAAAAARARICExMEH/2gAIAQIBAT8QmfRzZehiw2y9RUI+TUUIfMuDeT8KyYsq9P/EACIQAQACAgICAgMB'
                   + 'AAAAAAAAAAEAESExQVFhcYGREKGxwf/aAAgBAQABPxDMLg2xwcY/saMPMC96B12lnDiUoW4DYqMADV/cZXAmzFzOIXU0dcxRgoYD'
                   + 'kb8Qa3ddwQExBCqHZ34mOqrRoOpYq/mCGvB9wvonzKUUuWoLgtTxqXZVG6uHDxMqbB5nMMplZuYbuvBMs9S9RjS/cEIlzqGjRoJQ'
                   + 'VUVRK09XGXxiMKOImci2oJsPkm7dXhgKBtuKqk3iGk8uCpWHtUqO0xFlrzEMKMFeglqUct5lY6lPTKLh8yish8y4BL1iCseJqDyZ'
                   + 'SbULvc1Fcqc4i2hhmq3+4JW4VzFbzn8G78Q1/sGuFg2+pdcRe5lZm5dPXFTDxTeiHQeTOPuYr5XmXiw9TNmMT3ojtziCDM368Sre'
                   + 'fUTwxK1zDDaaHMOoV0z7oW9QtgHqXltnWI+XEdjlCstF6gO4Kj46litc+4WndYhU6ya7gWhrk6hRo0EcMfJ5iatsV2QTzC/dbuWa'
                   + 'qWrhfUC80fcWgfMyGq5ghdL9xWRvxCNDfmKrZ7ZStrB2El4tBO2bFcE7b9XFu13j9RNb0PmYkP4m/BqcfMyE4ILQ6qbDi5TKs3Db'
                   + 'MjMC7lFpxUFn/9k=';
