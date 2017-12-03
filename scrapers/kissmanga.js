/* jshint esversion: 6 */

const utils = require('../utils.js');

async function getChapterLinks(browser, title, currentChapter, url, outDir) {
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector('table.listing');

    const selector = 'table.listing a';
    const pattern = `${url}/.*?(\\d+).*`;
    const chapterLinks = await utils.getChapterLinks(page, selector, pattern, currentChapter);

    await page.close();

    return chapterLinks;
}

async function downloadChapter(browser, title, chapter, url, outDir) {
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector('#selectReadType');
    await page.select('#selectReadType', '1'); // All pages
    await page.waitForSelector('#divImage');

    const imageLinks = await page.$$eval('#divImage img', images => images.map(image => image.src));
    const destination = `${outDir}\\${title}\\${title} ${chapter}`;

    await page.close();

    for (let i = 0; i < imageLinks.length; i++) {
        await utils.download(imageLinks[i], destination, { filename: `${i}.png` });
    }

    await utils.zip(destination, `${destination}.zip`).catch(console.error);
}

module.exports.getChapterLinks = getChapterLinks;
module.exports.downloadChapter = downloadChapter;
