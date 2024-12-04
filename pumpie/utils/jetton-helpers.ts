import { Sha256 } from "@aws-crypto/sha256-js";
import { Dictionary, beginCell, Cell } from "@ton/core";

const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

const sha256 = (str: string) => {
    const sha = new Sha256();
    sha.update(str);
    return Buffer.from(sha.digestSync());
};

const toKey = (key: string) => {
    return BigInt(`0x${sha256(key).toString("hex")}`);
};

const CHUNK_SIZE = 127; // Safe size for cell content

function splitToChunks(str: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += CHUNK_SIZE) {
        chunks.push(str.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
}

function chunkString(str: string, size: number): string[] {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks;
}

export function buildOnchainMetadata(data: { name: string; description: string; image: string }): Cell {
    // Prepare metadata
    const name = data.name.slice(0, 30);
    const desc = data.description.slice(0, 50);
    const hash = data.image.split('ipfs/').pop()?.slice(0, 40) || '';
    
    // Build simple metadata string
    const metadataStr = `${name}|${desc}|${hash}`;
    
    // Split into chunks of 100 characters
    const chunks = chunkString(metadataStr, 100);
    
    // Build cell chain
    let currentCell = beginCell();
    for (let i = chunks.length - 1; i >= 0; i--) {
        currentCell = beginCell()
            .storeStringTail(chunks[i])
            .storeRef(currentCell);
    }
    
    return beginCell()
        .storeUint(0, 8)
        .storeRef(currentCell)
        .endCell();
}

export function createCompactUrl(url: string): string {
    if (!url) return '';
    const hash = url.split('ipfs/').pop() || '';
    return hash.slice(0, 40);
}

export function makeSnakeCell(data: Buffer) {
    // Existing implementation
    let currentCell = beginCell();
    currentCell.storeUint(0, 8);  // Prefix
    
    for (let i = 0; i < data.length; i++) {
        currentCell.storeUint(data[i], 8);
    }
    
    return currentCell.endCell();
}

function bufferToChunks(buff: Buffer, chunkSize: number) {
    let chunks: Buffer[] = [];
    while (buff.byteLength > 0) {
        chunks.push(buff.slice(0, chunkSize));
        buff = buff.slice(chunkSize);
    }
    return chunks;
}