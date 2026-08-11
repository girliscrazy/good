import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();import fs from 'node:fs';
import path from 'node:path';

// Configuration
const targetDir = path.join(process.cwd(), 'downloads');
const outputFile = path.join(targetDir, 'index.html');

function generateIndex() {
    // Ensure the downloads directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    // Scan directory and handle errors gracefully
    let files;
    try {
        files = fs.readdirSync(targetDir).sort();
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return;
    }

    // Build list items for files matching <a href="./filename">filename</a>
    const listItems = [];
    for (const file of files) {
        if (file === 'index.html' || file.startsWith('.')) {
            continue;
        }
        listItems.push(`<li><a href="./${file}">${file}</a></li>`);
    }

    // Modern HTML/CSS Template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Downloads Directory</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --accent-color: #38bdf8;
            --accent-hover: #0ea5e9;
            --border-color: #334155;
        }
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            width: 100%;
            max-width: 550px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }
        h1 {
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 10px 0;
        }
        a {
            display: block;
            background-color: rgba(56, 189, 248, 0.05);
            padding: 12px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            text-decoration: none;
            border: 1px solid transparent;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
        }
        a:hover {
            background-color: rgba(56, 189, 248, 0.1);
            border-color: var(--accent-color);
            color: var(--accent-hover);
            transform: translateX(4px);
        }
        .empty {
            color: var(--text-muted);
            text-align: center;
            padding: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📥 Available Downloads</h1>
        <ul>
            ${listItems.length > 0 ? listItems.join('') : '<li class="empty">No files found in directory.</li>'}
        </ul>
    </div>
</body>
</html>`;

    // Output the HTML file
    try {
        fs.writeFileSync(outputFile, htmlContent, 'utf-8');
        console.log(`Successfully generated ${outputFile}`);
    } catch (error) {
        console.error(`Error writing file: ${error.message}`);
    }
}

generateIndex();
