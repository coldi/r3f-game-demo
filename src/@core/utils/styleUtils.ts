type StylesToMerge = (Function | {})[];

function normalize(styles: StylesToMerge) {
    return (theme: any) => styles.map(s => (typeof s === 'function' ? s(theme) : s));
}

export function combineStyles(...args: any[]) {
    const styles: any[] = [];

    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (!arg) continue;

        const argType = typeof arg;

        if (Array.isArray(arg) && arg.length === 2) {
            const [style, condition] = arg;
            if (condition) {
                styles.push(style);
            }
        } else if (argType === 'object' /* && arg.styles */ || argType === 'function') {
            styles.push(arg);
        }
    }

    return normalize(styles);
}
