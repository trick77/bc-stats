#!/usr/bin/env node
/**
 * Run 'npm install' first.
 */

const io = require('socket.io-client');
const table = require('easy-table');
const program = require('commander');
const colors = require('colors');


program
    .version('0.1.1')
    .usage('-n 149.28.158.92 -a 0xf296ae51b4cb7c6028edf2fb99d5f754167f01e3')
    .option('-n, --hostname <hostname>', 'Hostname with a running bcnode')
    .option('-a, --miner <miner>', 'Miner address')
    .option('-m, --maxblocks [maxblocks]', 'Maximum number of blocks to query')
    .option('-r, --ranking', 'Show miner ranking table (off by default)')
    .parse(process.argv);

let maxBlocks = 1024;
if (program.maxblocks) {
    if (program.maxblocks > 0) {
        maxBlocks = program.maxblocks;
    }
}

let showRanking = false;
if (program.ranking) {
  showRanking = true;
}

console.info('Requesting a maximum of ' + maxBlocks + ' blocks');

const hostname = program.hostname;
const miner = program.miner;
const port = 3000;

client = io.connect('ws://' + hostname + ':' + port, {
    path: '/ws',
    transports: ['websocket'],
    timeout: 60000
});

client.on('connect', () => {
    clearTimeout(client._connectTimer);
    console.info(colors.green('Connected to ' + hostname + ':' + port + '\n'));
    client.emit('blocks.get', {"id": "latest", "count": maxBlocks});
});

client._connectTimer = setTimeout(function () {
    client.close();
}, 5000);

client.on('connect_error', (error) => {
    clearTimeout(client._connectTimer);
    client.close();
    console.error(colors.red('Unable to connect :-('));
});

client.on('blocks.set', (blocks) => {
    client.close();
    console.info('Total blocks found: ' + colors.yellow(blocks.length) + ' (out of a requested ' + maxBlocks + ')');
    if (blocks.length > 0) {
        let oldestTime = new Date(0);
        oldestTime.setUTCSeconds(blocks[0].timestamp);
        console.info('Latest block found: ' + colors.yellow(blocks[0].height) + ' @ ' + colors.yellow(oldestTime.toLocaleTimeString()));

        let latestTime = new Date(0);
        latestTime.setUTCSeconds(blocks[blocks.length - 1].timestamp);
        console.info('Oldest block found: ' + colors.yellow(blocks[blocks.length - 1].height) + ' @ ' + colors.yellow(latestTime.toLocaleTimeString()));

        if (oldestTime < latestTime) {
            console.info(colors.red('*** Possible timestamp attack going on!'))
        }

        let missingBlocks = blocks[0].height - blocks[blocks.length - 1].height - blocks.length + 1;
        console.info('Missing blocks: ' + colors.yellow(missingBlocks));
    }
    let minedBlocks = [];
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].miner == miner) {
            minedBlocks.push(blocks[i]);
        }
    }

    if (minedBlocks.length > 0) {
        console.info('\nMined blocks in found blocks:');
        console.info(colors.grey('-----------------------------'));
        displayMinedBlocksTable(minedBlocks);
    }
    else {
        console.info('No mined blocks for miner ' + miner + '\n');
    }

    if (showRanking && blocks.length > 0) {
        console.info('Miner ranking for found blocks:');
        console.info(colors.grey('-------------------------------'));
        const counts = Object.create(null);
        blocks.forEach(block => {
            counts[block.miner] = counts[block.miner] ? counts[block.miner] + 1 : 1;
        });
        displayStatsTable(counts);
    }

});

function displayStatsTable(obj) {
    const entries = Object.entries(obj);
    entries.sort((a, b) => b[1] - a[1]);
    const t = new table();
    let i = 1;
    entries.forEach(row => {
        if (miner == row[0]) {
            t.cell('Rank', colors.green(i));
            t.cell('Miner', colors.green(row[0]));
            t.cell('Count', colors.green(row[1]));
        } else {
            t.cell('Rank', i);
            t.cell('Miner', row[0]);
            t.cell('Count', row[1]);
        }
        t.newRow();
        i++;
    });
    console.info(t.toString());
}

function displayMinedBlocksTable(obj) {
    let i = 1;
    const t = new table();
    Object.values(obj).forEach(row => {
        let time = new Date(0);
        time.setUTCSeconds(row.timestamp);
        t.cell('#', i);
        t.cell('Height', row.height);
        t.cell('Time', time.toLocaleTimeString());
        t.cell('Difficulty', row.difficulty);
        t.cell('Distance', row.distance);
        let delta = row.distance - row.difficulty;
        if (delta >= 0) {
            t.cell('Diffy-Dist Δ', delta);
        } else {
            t.cell('Diffi-Dist Δ', colors.red(delta + ' (invalid)'));
        }
        t.newRow();
        i++;
    });
    console.info(t.toString());
}
