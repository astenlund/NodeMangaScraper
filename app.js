/* jshint esversion: 6 */

const nconf     = require('nconf');
const puppeteer = require('puppeteer');
const scrapers  = {
    'kissmanga.com': require('./scrapers/kissmanga.js')
};

nconf.argv().file('config', './config.json').file('progress', './progress.json');
nconf.required(['progress']);
nconf.defaults({
    'headless': true,
    'outdir': 'output'
});

const headless = nconf.get('headless');
const progress = nconf.get('progress');
const outDir   = nconf.get('outdir');

async function main() {
    const browser = await puppeteer.launch({ headless: headless });

    for (let manga of progress) {
        const chapter = manga['chapter'];
        const title   = manga['title'];
        const url     = manga['url'];
        const domain  = getDomain(url);
        const scraper = scrapers[domain];

        console.log(`Downloading manga: ${url} (currently at chapter ${chapter})`);

        if (scraper === undefined) {
            console.error(`ERROR: There is no scraper defined for this website: ${domain}\n`);
            continue;
        }

        const chapterLinks = await scraper.getChapterLinks(browser, title, chapter, url, outDir);

        if (chapterLinks.length === 0) {
            console.log('There are no new chapters for this manga');
        }

        for (const link of chapterLinks) {
            console.log(`Downloading chapter ${link.chapter}`);
            await scraper.downloadChapter(browser, title, link.chapter, link.href, outDir).catch(console.error);
        }

        console.log();
    }

    await browser.close();
}

function getDomain(url) {
    const match = url.match(/(http(s){0,1}:\/\/){0,1}([^/]*\.)*([^/]+?\..+?)\/.+/);
    return match ? match[4] : undefined;
}

main();
