/* jshint esversion: 6 */

const bluebird  = require('bluebird');
const download  = require('download');
const zipFolder = bluebird.promisify(require('zip-folder'));

async function getChapterLinks(page, selector, pattern, currentChapter) {
    return page.$$eval(selector, (anchors, pattern, currentChapter) => {
        return anchors.reduce((accumulator, currentValue) => {
            const href = currentValue.href;
            const match = href.match(pattern);
            if (match) {
                const chapter = Number.parseInt(match[1]);
                if (chapter > currentChapter) {
                    accumulator.push({ chapter: chapter, href: href });
                }
            }
            return accumulator;
        }, []).sort((a, b) => a.chapter - b.chapter);
    }, pattern, currentChapter);
}

async function zip(directory, outfile) {
    return zipFolder(directory, outfile);
}

module.exports.download = async function(url, dest, filename) { return await download(url, dest, filename) };
module.exports.getChapterLinks = getChapterLinks;
module.exports.zip = zip;
