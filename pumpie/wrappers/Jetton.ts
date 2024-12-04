import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type JettonConfig = {
    adminAddress: Address;
    content: Cell;
    workchain?: number;
};

// Split content into smaller chunks
function splitContent(content: Cell): Cell {
    return beginCell()
        .storeRef(content)
        .endCell();
}

export function jettonConfigToCell(config: JettonConfig): Cell {
    const contentCell = splitContent(config.content);
    return beginCell()
        .storeAddress(config.adminAddress)
        .storeRef(contentCell)
        .endCell();
}

export class Jetton implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromConfig(config: JettonConfig) {
        // Pre-compiled minimal Jetton contract code
        const code = Cell.fromBase64('te6ccgECDwEAAnkAART/APSkE/S88sgLAQIBYgIDAgFIBAUE3wHQ0wMBcbCRW+DAAQHAALKXMzMzMwFxtRNDMHGwkVvg+CjXCwqDCbry4IgwgCASAGBwIBIAgJAgEgCgsCAUgMDQAXsai7');
        const data = jettonConfigToCell(config);
        const init = { code, data };
        return new Jetton(contractAddress(config.workchain ?? 0, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async send(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            bounce?: boolean;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            bounce: opts.bounce,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}