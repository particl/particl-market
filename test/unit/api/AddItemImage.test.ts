import { ImageProcessing, MEDIUM_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE } from '../../../src/core/helpers/ImageProcessing';
import { ImageTriplet } from '../../../src/core/helpers/ImageTriplet';

import sharp = require('sharp');
import piexif = require('piexifjs');

describe('ShippingCountries', () => {
    test('Test data should have metadata before processing', async () => {
        expect.assertions(0);
        const rawImage = ImageProcessing.PIEXIF_JPEG_START_STR + ImageProcessing.milkcatSmall;
        try {
            const processedImage: ImageTriplet = piexif.remove(rawImage);
        } catch ( ex ) {
            console.log('ex = ' + ex);
            expect(ex).not.toBe('Exif not found.');
            expect(false).toBe(true);
        }
    });

    test('prepareImageForSaving() should complain of invalid format', async () => {
        expect.assertions(1);
        try {
            const processedImage: ImageTriplet = await ImageProcessing.prepareImageForSaving(ImageProcessing.milkcatBroken);
        } catch ( ex ) {
            expect(ex.toString()).toBe('Error: Image data was an unknown format. Supports: JPEG, PNG, GIF.');
        }
    });

    test('prepareImageForSaving() should remove metadata', async () => {
        expect.assertions(2);
        const processedImage: ImageTriplet = await ImageProcessing.prepareImageForSaving(ImageProcessing.milkcatSmall);
        expect(processedImage.big).not.toBe(null);

        const rawImage = ImageProcessing.PIEXIF_JPEG_START_STR + processedImage.big;
        try {
            const retval = piexif.remove(rawImage);
        } catch ( ex ) {
            expect(ex).toBe('Exif not found.');
        }
    });

    test('prepareImageForSaving() should resize tall(er than wide, by the ratio in the static bounds) image to reach MAX height', async () => {
        expect.assertions(9);
        const rawImage = ImageProcessing.milkcatTall;
        let processedImage: ImageTriplet;
        try {
            processedImage = await ImageProcessing.prepareImageForSaving(rawImage);
        } catch ( ex ) {
            console.log('resizeTallTest(): 000' + ex);
            return;
        }

        /*
         * NOTE: This is a template for future tests
         */
        try {
            expect(processedImage.big).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.big, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const dataBufferOriginal = Buffer.from(rawImage, 'base64');
            const imageBufferOriginal = sharp(dataBufferOriginal);

            const newInfo = await imageBuffer.metadata();
            const originalInfo = await imageBufferOriginal.metadata();

            expect(newInfo.height).toBe(originalInfo.height;
            expect(newInfo.width).toBe(originalInfo.width;
        } catch ( ex ) {
            console.log('resizeTallTest(): 100: ' + ex);
        }

        try {
            expect(processedImage.medium).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.medium, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const newInfo = await imageBuffer.metadata();

            expect(newInfo.height).toBe(MEDIUM_IMAGE_SIZE.height);
            expect(newInfo.width).toBeLessThanOrEqual(MEDIUM_IMAGE_SIZE.width);
        } catch ( ex ) {
            console.log('resizeTallTest(): 200: ' + ex);
        }
        try {
            expect(processedImage.thumbnail).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.thumbnail, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const newInfo = await imageBuffer.metadata();

            expect(newInfo.height).toBe(THUMBNAIL_IMAGE_SIZE.height);
            expect(newInfo.width).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.width);
        } catch ( ex ) {
            console.log('resizeTallTest(): 300: ' + ex);
        }
    });

    test('prepareImageForSaving() should resize wide(er than tall, by the ratio in the static bounds) image to reach MAX width', async () => {
        expect.assertions(9);
        const rawImage = ImageProcessing.milkcatWide;
        let processedImage: ImageTriplet;
        try {
            processedImage = await ImageProcessing.prepareImageForSaving(rawImage);
        } catch ( ex ) {
            console.log('resizeWideTest(): 000' + ex);
            return;
        }

        try {
            expect(processedImage.big).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.big, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const dataBufferOriginal = Buffer.from(rawImage, 'base64');
            const imageBufferOriginal = sharp(dataBufferOriginal);

            const newInfo = await imageBuffer.metadata();
            const originalInfo = await imageBufferOriginal.metadata();

            expect(newInfo.width).toBe(originalInfo.width;
            expect(newInfo.height).toBe(originalInfo.height;
        } catch ( ex ) {
            console.log('resizeWideTest(): 100: ' + ex);
        }

        try {
            expect(processedImage.medium).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.medium, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const newInfo = await imageBuffer.metadata();

            expect(newInfo.width).toBe(MEDIUM_IMAGE_SIZE.width);
            expect(newInfo.height).toBeLessThanOrEqual(MEDIUM_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideTest(): 200: ' + ex);
        }
        try {
            expect(processedImage.thumbnail).not.toEqual(null);
            const dataBuffer = Buffer.from(processedImage.thumbnail, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const newInfo = await imageBuffer.metadata();

            expect(newInfo.width).toBe(THUMBNAIL_IMAGE_SIZE.width);
            expect(newInfo.height).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideTest(): 300: ' + ex);
        }
    });


    test('prepareImageForSaving() should resize tall(er than wide, by the ratio in the static bounds) image to thumbnail size', async () => {
        expect.assertions(3);
        const rawImage = ImageProcessing.milkcatTall;
        let resizedImage: string;
        try {
            resizedImage = await ImageProcessing.resizeImage(rawImage, THUMBNAIL_IMAGE_SIZE.width, THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeTallToThumb(): 000' + ex);
            return;
        }

        try {
            expect(resizedImage).not.toEqual(null);
            const dataBuffer = Buffer.from(resizedImage, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const newInfo = await imageBuffer.metadata();

            expect(newInfo.height).toBe(THUMBNAIL_IMAGE_SIZE.height);
            expect(newInfo.width).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.width);
        } catch ( ex ) {
            console.log('resizeTallToThumb(): 100: ' + ex);
        }
    });


    test('prepareImageForSaving() should resize wide(er than tall, by the ratio in the static bounds) image to thumbnail size', async () => {
        expect.assertions(3);
        const rawImage = ImageProcessing.milkcatWide;
        let resizedImage: string;
        try {
            resizedImage = await ImageProcessing.resizeImage(rawImage, THUMBNAIL_IMAGE_SIZE.width, THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideToThumb(): 000' + ex);
            return;
        }

        try {
            expect(resizedImage).not.toEqual(null);
            const dataBuffer = Buffer.from(resizedImage, 'base64');
            const imageBuffer = sharp(dataBuffer);

            const newInfo = await imageBuffer.metadata();

            expect(newInfo.width).toBe(THUMBNAIL_IMAGE_SIZE.width);
            expect(newInfo.height).toBeLessThanOrEqual(THUMBNAIL_IMAGE_SIZE.height);
        } catch ( ex ) {
            console.log('resizeWideToThumb(): 100: ' + ex);
        }
    });
});
