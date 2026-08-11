import puppeteer from 'puppeteer';
import { input, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

const foundVideos = new Map();
let currentChunkCallback = null;
let progressBar = null;

async function run() {
    console.log(chalk.bold.magenta('\n🎥 Universal Stealth Video Scraper & Downloader CLI\n'));

    const targetUrl = await input({
        message: 'Enter the URL of the web page to scrape:',
        validate: (value) => value.startsWith('http') ? true : 'Please enter a valid URL (starting with http/https)'
    });

    const spinner = ora('Launching stealth browser...').start();

    const launchOptions = {
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security', 
            '--disable-features=IsolateOrigins,site-per-process,BlinkFeatures=AutomationControlled'
        ]
    };

    if (fs.existsSync('/usr/bin/google-chrome')) {
        launchOptions.executablePath = '/usr/bin/google-chrome';
    } else if (fs.existsSync('/usr/bin/chromium')) {
        launchOptions.executablePath = '/usr/bin/chromium';
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.exposeFunction('__nodeSaveChunk', (chunkBase64) => {
        if (currentChunkCallback) currentChunkCallback(chunkBase64);
    });

    await page.exposeFunction('__nodeInitProgress', (totalSize, fileName) => {
        if (totalSize > 0) {
            progressBar = new cliProgress.SingleBar({
                format: chalk.blue(fileName) + ' |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Bytes',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true
            });
            progressBar.start(totalSize, 0);
        } else {
            console.log(chalk.yellow(`Unknown file size for ${fileName}. Downloading...`));
        }
    });

    spinner.text = 'Intercepting network traffic...';

    page.on('response', async (response) => {
        try {
            const url = response.url();
            if (url.startsWith('data:') || url.startsWith('blob:')) return;

            const type = response.request().resourceType();
            const contentType = response.headers()['content-type'] || '';
            
            const isMedia = type === 'media';
            const isVideoMime = contentType.includes('video/') || contentType.includes('mpegurl') || contentType.includes('dash+xml');
            const isVideoExt = /\.(mp4|webm|m3u8|mpd|mkv|mov|avi|flv)(\?.*)?$/i.test(url);
            
            if (isMedia || isVideoMime || isVideoExt) {
                if (!foundVideos.has(url)) {
                    let sourceInfo = isVideoMime && contentType.includes('mpegurl') ? 'HLS Stream (.m3u8)' : 'Network Intercept';
                    foundVideos.set(url, { url, type: sourceInfo });
                }
            }
        } catch (err) { }
    });

    try {
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });
        
        spinner.text = 'Scrolling page to trigger lazy-loaded videos...';
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 300;
                const timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= document.body.scrollHeight - window.innerHeight || totalHeight > 10000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });
        
        await new Promise(r => setTimeout(r, 2000));

        spinner.text = 'Parsing DOM elements and buttons...';
        const domVideos = await page.evaluate(() => {
            const results = [];
            const videoExts = /\.(mp4|webm|m3u8|mpd|mkv|mov|avi|flv)(\?.*)?$/i;

            function traverse(root) {
                if (!root) return;
                
                root.querySelectorAll('video').forEach(v => {
                    if (v.src && !v.src.startsWith('blob:') && !v.src.startsWith('data:')) results.push({ url: v.src, type: '<video> tag' });
                    if (v.currentSrc && !v.currentSrc.startsWith('blob:')) results.push({ url: v.currentSrc, type: 'Video currentSrc' });
                });

                root.querySelectorAll('a, button, [role="button"]').forEach(el => {
                    const href = el.href || el.getAttribute('href') || '';
                    if (href && videoExts.test(href)) {
                        results.push({ url: href, type: 'Hyperlink' });
                    }
                });

                root.querySelectorAll('*').forEach(el => {
                    if (el.shadowRoot) traverse(el.shadowRoot);
                });
            }
            
            traverse(document);
            return results;
        });

        domVideos.forEach(v => {
            if (!foundVideos.has(v.url)) foundVideos.set(v.url, v);
        });

        spinner.succeed(`Scraping complete. Found ${foundVideos.size} media links.`);

        if (foundVideos.size === 0) {
            console.log(chalk.yellow('\nNo videos found on this page.'));
            await browser.close();
            return;
        }

        const choices = Array.from(foundVideos.values()).map(v => {
            const shortUrl = v.url.length > 80 ? v.url.substring(0, 77) + '...' : v.url;
            return { 
                name: chalk.cyan(`[${v.type}] `) + shortUrl, 
                value: v.url,
                checked: false 
            };
        });

        const selectedUrls = await checkbox({
            message: 'Select videos to download (Space = Select, Enter = Confirm):',
            choices: choices,
            validate: (answer) => answer.length < 1 ? 'Select at least one video using Spacebar!' : true
        });

        for (const url of selectedUrls) {
            await downloadFileInBrowser(page, url);
        }

        console.log(chalk.bold.green('\n🎉 All tasks complete!\n'));
        await browser.close();

    } catch (err) {
        spinner.fail('An error occurred during operation.');
        console.error(err);
        await browser.close();
    }
}

async function downloadFileInBrowser(page, url) {
    let rawName = url.split('/').pop().split('?')[0];
    if (!rawName || !rawName.includes('.')) rawName = 'video.mp4';
    const fileName = `${Date.now()}_${rawName}`; 
    const destPath = path.join(DOWNLOAD_DIR, fileName);

    // ==========================================
    // NEW: Logging the full URL so you can inspect it
    // ==========================================
    console.log(chalk.bold.blue(`\nStarting download engine...`));
    console.log(chalk.dim(`🔗 Full URL: ${url}`));

    if (url.includes('.m3u8') || url.includes('.mpd')) {
        console.log(chalk.bold.yellow(`\n[!] Stream Playlist Detected: ${fileName}`));
        console.log(chalk.white(`Run yt-dlp to download this stream:`));
        console.log(chalk.cyan(`yt-dlp "${url}"\n`));
        return;
    }

    const writer = fs.createWriteStream(destPath);
    let downloaded = 0;

    currentChunkCallback = (chunkBase64) => {
        const buffer = Buffer.from(chunkBase64, 'base64');
        downloaded += buffer.length;
        writer.write(buffer);
        if (progressBar) progressBar.update(downloaded);
    };

    const result = await page.evaluate(async (fileUrl, outFileName) => {
        try {
            // Added explicit headers to mimic a media player more closely
            const response = await fetch(fileUrl, { 
                credentials: 'include',
                headers: {
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) return { error: `HTTP ${response.status} ${response.statusText}` };

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            
            await window.__nodeInitProgress(total, outFileName);

            const reader = response.body.getReader();

            function uint8ToBase64(uint8) {
                let binary = '';
                const CHUNK_SIZE = 0x8000;
                for (let i = 0; i < uint8.length; i += CHUNK_SIZE) {
                    binary += String.fromCharCode.apply(null, uint8.subarray(i, i + CHUNK_SIZE));
                }
                return btoa(binary);
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const base64 = uint8ToBase64(value);
                await window.__nodeSaveChunk(base64);
            }

            return { success: true, total };
        } catch (err) {
            return { error: err.message };
        }
    }, url, fileName);

    writer.end();
    currentChunkCallback = null;

    if (progressBar) {
        progressBar.stop();
        progressBar = null;
    }

    if (result.error) {
        console.error(chalk.red(`✖ Download failed: ${result.error}`));
        console.log(chalk.yellow(`💡 Tip: Copy the "Full URL" above and paste it into your browser. If it says "Access Denied" or "Expired", the website uses temporary anti-scraping links.`));
    } else {
        console.log(chalk.green(`✔ Saved successfully to ${destPath}`));
    }
}

run();