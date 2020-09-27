export default function waitForMs(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
