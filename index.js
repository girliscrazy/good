import puppeteer from 'puppeteer';
import { input, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility for paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

const foundVideos = new Map(); // Use Map to automatically deduplicate by URL

async function run() {
    console.log(chalk.bold.magenta('\n🎥 Universal Video Scraper & Downloader CLI\n'));

    // 1. Prompt User for Target URL
    const targetUrl = await input({
        message: 'Enter the URL of the web page to scrape:',
        validate: (value) => value.startsWith('http') ? true : 'Please enter a valid URL (starting with http/https)'
    });

    const spinner = ora('Launching stealth browser...').start();

    // 2. Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Stealth Mode: Bypass basic bot detection
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // 3. Network Interception (Catches streams, background fetches, iframes)
    spinner.text = 'Intercepting network traffic & searching page...';
    
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
        } catch (err) { /* ignore detached frames */ }
    });

    try {
        // 4. Navigate & auto-scroll to trigger lazy loading
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
        
        // Wait briefly for post-scroll scripts to fire
        await new Promise(r => setTimeout(r, 2000));

        // 5. DOM Inspection (Catches tags, Shadow DOMs, Download Buttons)
        spinner.text = 'Parsing DOM elements and buttons...';
        const domVideos = await page.evaluate(() => {
            const results = [];
            const videoExts = /\.(mp4|webm|m3u8|mpd|mkv|mov|avi|flv)(\?.*)?$/i;

            function traverse(root) {
                if (!root) return;
                
                // standard video and source tags
                root.querySelectorAll('video').forEach(v => {
                    if (v.src && !v.src.startsWith('blob:') && !v.src.startsWith('data:')) results.push({ url: v.src, type: '<video> tag' });
                    if (v.currentSrc && !v.currentSrc.startsWith('blob:')) results.push({ url: v.currentSrc, type: 'Video currentSrc' });
                    v.querySelectorAll('source').forEach(s => {
                        if (s.src) results.push({ url: s.src, type: '<source> tag' });
                    });
                });

                // links and download buttons
                root.querySelectorAll('a, button, [role="button"]').forEach(el => {
                    const href = el.href || el.getAttribute('href') || '';
                    const hasDownload = el.hasAttribute('download');
                    const text = (el.innerText || '').toLowerCase();
                    const isDownloadButton = text.includes('download') || text.includes('1080p') || text.includes('720p');

                    if (href && (videoExts.test(href) || (hasDownload && isDownloadButton))) {
                        results.push({ url: href, type: hasDownload ? 'Download Button' : 'Hyperlink' });
                    }
                    
                    // check data-attributes for hidden URLs
                    for (const attr of el.attributes) {
                        if (attr.value && attr.value.startsWith('http') && videoExts.test(attr.value)) {
                            results.push({ url: attr.value, type: 'Data Attribute' });
                        }
                    }
                });

                // recursively search shadow DOMs for custom video players
                root.querySelectorAll('*').forEach(el => {
                    if (el.shadowRoot) traverse(el.shadowRoot);
                });
            }
            
            traverse(document);
            return results;
        });

        // Add DOM results to our Map
        domVideos.forEach(v => {
            if (!foundVideos.has(v.url)) foundVideos.set(v.url, v);
        });

        // Extract cookies to pass to Axios later (prevents 403 Forbidden errors)
        const cookies = await page.cookies();
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        spinner.succeed(`Scraping complete. Found ${foundVideos.size} media links.`);
        await browser.close();

        if (foundVideos.size === 0) {
            console.log(chalk.yellow('\nNo videos found on this page.'));
            return;
        }

        // 6. Interactive Selection
        const choices = Array.from(foundVideos.values()).map(v => {
            const shortUrl = v.url.length > 80 ? v.url.substring(0, 77) + '...' : v.url;
            return { name: chalk.cyan(`[${v.type}] `) + shortUrl, value: v.url };
        });

        const selectedUrls = await checkbox({
            message: 'Select the videos you want to download (Space to select, Enter to confirm):',
            choices: choices
        });

        if (selectedUrls.length === 0) {
            console.log(chalk.yellow('No videos selected. Exiting...'));
            return;
        }

        // 7. Download Loop
        for (const url of selectedUrls) {
            await downloadFile(url, cookieString, targetUrl, userAgent);
        }

        console.log(chalk.bold.green('\n🎉 All tasks complete!\n'));

    } catch (err) {
        spinner.fail('An error occurred during scraping.');
        console.error(err);
        await browser.close();
    }
}

async function downloadFile(url, cookies, referer, userAgent) {
    const fileName = url.split('/').pop().split('?')[0] || `video_${Date.now()}.mp4`;
    const destPath = path.join(DOWNLOAD_DIR, fileName);

    // Note: HLS/DASH streams are playlists, not single files. 
    // Best handled by yt-dlp or ffmpeg CLI instead of raw Node streams.
    if (url.includes('.m3u8') || url.includes('.mpd')) {
        console.log(chalk.bold.yellow(`\n[!] Stream Detected: ${fileName}`));
        console.log(chalk.white(`This is a streaming playlist. To download it properly, install yt-dlp and run:`));
        console.log(chalk.cyan(`yt-dlp "${url}"`));
        return;
    }

    console.log(chalk.bold.blue(`\nStarting download: ${fileName}`));

    try {
        const { data, headers } = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': userAgent,
                'Referer': referer,
                'Cookie': cookies
            }
        });

        const totalLength = parseInt(headers['content-length'], 10);
        
        const progressBar = new cliProgress.SingleBar({
            format: 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Bytes',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });

        if (totalLength) {
            progressBar.start(totalLength, 0);
        } else {
            console.log(chalk.yellow('Unknown file size. Downloading in the background...'));
        }

        const writer = fs.createWriteStream(destPath);
        let downloaded = 0;

        data.on('data', (chunk) => {
            downloaded += chunk.length;
            if (totalLength) progressBar.update(downloaded);
        });

        data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        if (totalLength) progressBar.stop();
        console.log(chalk.green(`\u2714 Saved successfully to ${destPath}`));

    } catch (error) {
        console.error(chalk.red(`\u2716 Failed to download ${fileName}: ${error.message}`));
    }
}

// Start CLI
run();