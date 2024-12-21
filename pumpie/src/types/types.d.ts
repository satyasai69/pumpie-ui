export interface Transaction {
    hash: string;
    time: number; // Assuming time is a UNIX timestamp
    from: string;
    to: string;
    amount: string;
    fee: string;
}
