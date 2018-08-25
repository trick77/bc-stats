# bc-stats

A quick hack for command line interface enthusiasts to query a Block Collider node of your choice and display some statistics.

## Prerequisites

Node.js and NPM need to be installed.

## Installation

Run ```npm install``` first to install the required modules.

## Usage

Use the --help argument to get a list of all available options:

```
$ node bc-stats.js --help

  Usage: bc-stats -n localhost -a 0xf296ae51b4cb7c6028edf2fb99d5f754167f01e3

  Options:

    -V, --version                output the version number
    -n, --hostname <hostname>    Hostname with a running bcnode
    -a, --miner <miner>          Miner address
    -m, --maxblocks [maxblocks]  Maximum number of blocks to query
    -r, --ranking                Show miner ranking table (off by default)
    -c, --no-color               Disable colors in output (on by default)
    -h, --help                   output usage information
```    

Usage example:

```
$ node bc-stats.js --hostname localhost --address 0x79d5dffb9ea3a4c30c1d479a519d14a8f6220746 --ranking

Requesting a maximum of 1024 blocks
Connected to localhost:3000

Total blocks found: 23 (out of a requested 1024)
Unique miner addresses: 10
Latest block found: 249970 @ 20:39:05
Oldest block found: 249946 @ 20:36:50
Missing blocks: 2

Mined blocks (3) in found blocks (23):
----------------------------------------
#  Height  Time      Difficulty       Distance         Diffy-Dist Δ
-  ------  --------  ---------------  ---------------  -----------------------
1  249969  20:39:03  296138548244184  299557023913895  3418475669711
2  249964  20:38:42  300329760312934  308839000403271  8509240090337
3  249947  20:36:58  304599290577826  304286229677335  -313060900491 (invalid)

Miner ranking for found blocks:
------------------------------------
Rank  Miner                                       Count
----  ------------------------------------------  -----
1     0x40cf776fbd9e3336f48c2f6cc32cec888e2e2a74  4
2     0x79d5dffb9ea3a4c30c1d479a519d14a8f6220746  3
3     0xf61e847f4622e57e81352c58d43a252e13b62141  2
4     0x76336ca889df2ad3724f97bbca6c472a9de0bbb6  2
5     0xa267754e593004930b1f3b0031b953ad2b1cc3ce  2
6     0x1c2fd61edaeda21ff04bd0b470fab973ebf5f90c  2
7     0x1caaa1b480d73a7975e245590e91c217d5824360  2
8     0x40cf776fbd9e3336f48c2f6cc32cec888e2e2a74  2
9     0x8f14af5b2ee9ff1f4179db89a73d706238d98e3f  1
10    0xec003b77af4813a26714f1733e8fe7dadd85bf4c  1
```

## Tips & tricks

To receive the statistics by e-mail (i.e. useful for cron jobs) you could use something like this:

```
node bc-stats.js -n localhost -a 0x1c2fd61edaeda21ff04bd0b470fab973ebf5f90c --no-color -m 10000 | mail -s "Block Collider miner stats" johndoe@domain.abc
```

Obviously, e-mail needs to be working on the local system.