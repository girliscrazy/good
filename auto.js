import puppeteer from 'puppeteer';
import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

const foundVideos = new Map();
let currentChunkCallback = null;
let progressBar = null;

async function run() {
    console.log(chalk.bold.magenta('\n🤖 Fully Automated Precision-Target Downloader\n'));

    // 1. Fetch the Target URL from your Worker API
    let targetUrl = '';
    const fetchSpinner = ora('Fetching target URL from API...').start();
    try {
        const response = await fetch('https://hi.settoforget.workers.dev/url');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const textData = await response.text();
        
        try {
            const jsonData = JSON.parse(textData);
            targetUrl = jsonData.url || jsonData.targetUrl || textData;
        } catch {
            targetUrl = textData.trim();
        }

        if (!targetUrl.startsWith('http')) {
            throw new Error(`API returned an invalid URL: ${targetUrl}`);
        }
        
        fetchSpinner.succeed(`Fetched URL: ${chalk.cyan(targetUrl)}`);
    } catch (err) {
        fetchSpinner.fail(`Failed to fetch URL from API: ${err.message}`);
        process.exit(1);
    }

    // 2. Automatically derive the clean file name from the URL path
    let customName = 'video';
    try {
        const parsedUrl = new URL(targetUrl);
        const segments = parsedUrl.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
            let lastSegment = segments[segments.length - 1];
            customName = lastSegment.replace(/\.[^/.]+$/, '');
        } else {
            customName = parsedUrl.hostname.replace(/[^a-zA-Z0-9]/g, '_');
        }
    } catch {
        customName = 'video';
    }
    
    customName = customName.replace(/[^a-zA-Z0-9-_]/g, '_');
    if (!customName) customName = 'video';

    console.log(chalk.blue(`📁 Auto-assigned file name: ${chalk.bold(customName + '.mp4')}`));

    const spinner = ora('Launching stealth browser...').start();

    // 3. Launch Browser
    const launchOptions = {
        headless: "new",
        args: [
            '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
            '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process,BlinkFeatures=AutomationControlled'
        ]
    };

    if (fs.existsSync('/usr/bin/google-chrome')) launchOptions.executablePath = '/usr/bin/google-chrome';
    else if (fs.existsSync('/usr/bin/chromium')) launchOptions.executablePath = '/usr/bin/chromium';

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });

    // 4. Setup Node Bridge for Downloading
    await page.exposeFunction('__nodeSaveChunk', (chunkBase64) => {
        if (currentChunkCallback) currentChunkCallback(chunkBase64);
    });

    await page.exposeFunction('__nodeInitProgress', (totalSize, fileName) => {
        if (totalSize > 0) {
            progressBar = new cliProgress.SingleBar({
                format: chalk.blue(fileName) + ' |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Bytes',
                barCompleteChar: '\u2588', barIncompleteChar: '\u2591', hideCursor: true
            });
            progressBar.start(totalSize, 0);
        }
    });

    spinner.text = 'Intercepting network traffic & scanning page...';

    page.on('response', async (response) => {
        try {
            const url = response.url();
            if (url.startsWith('data:') || url.startsWith('blob:')) return;
            const type = response.request().resourceType();
            const contentType = response.headers()['content-type'] || '';
            
            // Ignore standard webpage layout/document requests (like html.php, index.php pages)
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.includes('html.php') || lowerUrl.includes('index.php')) {
                return;
            }

            // Capture media, php endpoints with queries, or video formats
            if (type === 'media' || contentType.includes('video/') || lowerUrl.includes('remote_control.php') || /\.(mp4|webm|m3u8)(\?.*)?$/i.test(url)) {
                if (!foundVideos.has(url)) foundVideos.set(url, { url });
            }
        } catch (err) { }
    });

    try {
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });
        
        // Auto-scroll to trigger lazy-loads
        spinner.text = 'Scrolling page...';
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0; const distance = 300;
                const timer = setInterval(() => {
                    window.scrollBy(0, distance); totalHeight += distance;
                    if (totalHeight >= document.body.scrollHeight - window.innerHeight || totalHeight > 10000) {
                        clearInterval(timer); resolve();
                    }
                }, 200);
            });
        });
        await new Promise(r => setTimeout(r, 2000));

        // Trigger play elements to force remote_control.php requests to fire
        spinner.text = 'Triggering player interactions to capture stream endpoint...';
        await page.evaluate(async () => {
            const interactives = document.querySelectorAll('video, .play-btn, [class*="play"], [id*="play"], button, .jw-icon-playback, iframe');
            interactives.forEach(el => {
                try { el.click(); } catch (e) {}
            });
        });
        
        // Give network requests time to register after clicking play
        await new Promise(r => setTimeout(r, 5000));

        spinner.succeed(`Scraping complete. Found ${foundVideos.size} relevant network endpoints.`);

        if (foundVideos.size === 0) {
            console.log(chalk.red(`\n✖ No video endpoints intercepted.`));
            await browser.close();
            return process.exit(1);
        }

        // 5. STRICT PRIORITY MATCHING LOGIC
        let matchedUrl = null;
        
        // Pass 1: Look strictly for remote_control.php
        for (const [url] of foundVideos.entries()) {
            if (url.toLowerCase().includes('remote_control.php')) {
                matchedUrl = url;
                break;
            }
        }

        // Pass 2: Look for any PHP script that contains query parameters (excluding html.php)
        if (!matchedUrl) {
            for (const [url] of foundVideos.entries()) {
                const lowerUrl = url.toLowerCase();
                if (lowerUrl.includes('.php') && lowerUrl.includes('?')) {
                    matchedUrl = url;
                    break;
                }
            }
        }

        // Pass 3: Fallback to direct video extensions (.mp4, .webm)
        if (!matchedUrl) {
            for (const [url] of foundVideos.entries()) {
                if (/\.(mp4|webm)(\?.*)?$/i.test(url)) {
                    matchedUrl = url;
                    break;
                }
            }
        }

        if (!matchedUrl) {
            matchedUrl = foundVideos.keys().next().value;
        }

        console.log(chalk.green(`\n✔ Selected target endpoint: ${matchedUrl}`));

        // 6. Download and Save
        await downloadFileInBrowser(page, matchedUrl, customName);

        console.log(chalk.bold.green('\n🎉 Auto-download complete!\n'));
        await browser.close();
        process.exit(0);

    } catch (err) {
        spinner.fail('An error occurred.');
        console.error(err);
        await browser.close();
        process.exit(1);
    }
}

async function downloadFileInBrowser(page, url, customName) {
    const fileName = `${customName}.mp4`; 
    const destPath = path.join(DOWNLOAD_DIR, fileName);

    console.log(chalk.bold.blue(`\nStarting download engine...`));

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
            const response = await fetch(fileUrl, { 
                credentials: 'include',
                headers: { 'Accept': '*/*', 'Cache-Control': 'no-cache' }
            });
            
            if (!response.ok) return { error: `HTTP ${response.status} ${response.statusText}` };

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            
            await window.__nodeInitProgress(total, outFileName);

            const reader = response.body.getReader();

            function uint8ToBase64(uint8) {
                let binary = ''; const CHUNK_SIZE = 0x8000;
                for (let i = 0; i < uint8.length; i += CHUNK_SIZE) {
                    binary += String.fromCharCode.apply(null, uint8.subarray(i, i + CHUNK_SIZE));
                }
                return btoa(binary);
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                await window.__nodeSaveChunk(uint8ToBase64(value));
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
    } else {
        console.log(chalk.green(`✔ Saved successfully to ${destPath}`));
    }
}

run();