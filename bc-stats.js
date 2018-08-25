#!/usr/bin/env node
/**
 * Run 'npm install' first.
 */

const io = require("socket.io-client");
const table = require("easy-table");
const program = require('commander');

program
  .version('0.1.0')
  .usage('-h 149.28.158.92 -m 0xf296ae51b4cb7c6028edf2fb99d5f754167f01e3')
  .option('-n, --hostname [hostname]', 'Hostname with a running bcnode')
  .option('-m, --miner [miner]', 'Miner address')
  .parse(process.argv);

if (!program.hostname) {
  console.error('Hostname missing');
  program.outputHelp();
  process.exit(1);
}

if (!program.miner) {
  console.error('Miner address missing');
  program.outputHelp();
  process.exit(1);
}

const hostname = program.hostname;
const miner = program.miner;
const port = 3000;
const maxBlocks = 4096;

client = io.connect('ws://' + hostname + ':' + port, {
  path: '/ws',
  transports: ['websocket']
});

client.on('connect', () => {
  clearTimeout(client._connectTimer);
  console.info('Connected to ' + hostname + ':' + port + '\n');
  client.emit('blocks.get', {"id": "latest" ,"count": maxBlocks});
});

client._connectTimer = setTimeout(function() {
    client.close();
}, 5000);

client.on('connect_error', (error) => {
  clearTimeout(client._connectTimer);
  client.close();
  console.error('Unable to connect :-(');
});

client.on('blocks.set', (blocks) => {
  client.close();
  console.info('Total blocks found: '+  blocks.length);
  if (blocks.length > 0) {
    let latestTime = new Date(0);
    latestTime.setUTCSeconds(blocks[blocks.length - 1].timestamp);
    console.info('Oldest block found: ' + blocks[blocks.length - 1].height + '@' + latestTime.toLocaleTimeString());

    let oldestTime = new Date(0);
    oldestTime.setUTCSeconds(blocks[0].timestamp);
    console.info('Latest block found: ' + blocks[0].height + '@' + oldestTime.toLocaleTimeString());

    let missingBlocks = blocks[0].height - blocks[blocks.length - 1].height - blocks.length;
    console.info('Missing blocks: ' + missingBlocks);
  }
  let minedblocks = [];
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].miner == miner) {
      minedblocks.push(blocks[i]);
    }
  }

  if (minedblocks.length > 0) {
    console.info('\nMined blocks in found blocks:');
    console.info('-------------------------------------');
    printMinedBlocksTable(minedblocks);
  }
  else {
    console.info('No mined blocks for miner ' + miner + '\n');
  }

  if (blocks.length > 0) {
    console.info('Miner ranking for found blocks:');
    console.info('-------------------------------------------------------');
    const counts = Object.create(null);
    blocks.forEach(block => {
      counts[block.miner] = counts[block.miner] ? counts[block.miner] + 1 : 1;
    });
    printStatsTable(counts);
  }

});

function printStatsTable(obj) {
  const entries = Object.entries(obj);
  entries.sort((a, b) => b[1] - a[1]);
  const t = new table();
  let i = 1;
  entries.forEach(row => {
    t.cell('rank', i);
    t.cell('miner', row[0]);
    t.cell('count', row[1]);
    t.newRow();
    i += 1;
  });
  console.info(t.toString());
}

function printMinedBlocksTable(obj) {
    let i = 1;
    const t = new table();
    Object.values(obj).forEach(row => {
      let time = new Date(0);
      time.setUTCSeconds(row.timestamp);
      t.cell('#', i);
      t.cell('height', row.height);
      t.cell('time', time.toLocaleTimeString());
      t.cell('distance', row.distance);
      t.newRow();
      i += 1;
    });
    console.info(t.toString());
}
