interface TileLike {
    x: number;
    y: number;
}

class TileClass implements TileLike {
    constructor(public x = 0, public y = 0) {
        this.x = x;
        this.y = y;
    }

    static DIRECTIONS = [
        new TileClass(0, 1),
        new TileClass(1, 0),
        new TileClass(0, -1),
        new TileClass(-1, 0),
    ];

    static DIAGONALS = [
        new TileClass(-1, 1),
        new TileClass(1, 1),
        new TileClass(1, -1),
        new TileClass(-1, -1),
    ];

    static direction(index: number) {
        return TileClass.DIRECTIONS[index];
    }

    static diagonal(index: number) {
        return TileClass.DIAGONALS[index];
    }

    add(t: TileLike | number) {
        if (typeof t === 'object') {
            this.x += t.x;
            this.y += t.y;
        } else {
            this.x += t;
            this.y += t;
        }
        return this;
    }

    sub(t: TileLike | number) {
        if (typeof t === 'object') {
            this.x -= t.x;
            this.y -= t.y;
        } else {
            this.x -= t;
            this.y -= t;
        }
        return this;
    }

    scale(t: TileLike | number) {
        if (typeof t === 'object') {
            this.x *= t.x;
            this.y *= t.y;
        } else {
            this.x *= t;
            this.y *= t;
        }
        return this;
    }

    multiplyScalar(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    divideScalar(scalar: number) {
        return this.multiplyScalar(1 / scalar);
    }

    negate() {
        return this.multiplyScalar(-1);
    }

    equals(t: TileLike) {
        return this.x === t?.x && this.y === t?.y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        return this.divideScalar(this.length() || 1);
    }

    squareDistance(t: TileLike) {
        const dx = this.x - t.x;
        const dy = this.y - t.y;
        return dx * dx + dy * dy;
    }

    floatDistance(t: TileLike) {
        return Math.sqrt(this.squareDistance(t));
    }

    angleRad(t: TileLike) {
        return Math.atan2(t.y - this.y, t.x - this.x);
    }

    angleDeg(t: TileLike) {
        return (this.angleRad(t) * 180) / Math.PI;
    }

    distance(t: TileLike) {
        return Math.round(this.floatDistance(t));
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    lerp(t: TileLike, n: number) {
        this.x += (t.x - this.x) * n;
        this.y += (t.y - this.y) * n;
        return this;
    }

    neighbor(index: number) {
        return this.clone().add(TileClass.direction(index));
    }

    diagonalNeighbor(index: number) {
        return this.clone().add(TileClass.DIAGONALS[index]);
    }

    rangeNeighbors(rangeX: number, rangeY = rangeX) {
        const results: TileClass[] = [];
        for (let y = -rangeY; y <= rangeY; y += 1) {
            for (let x = -rangeX; x <= rangeX; x += 1) {
                results.push(new TileClass(x, y).add(this));
            }
        }
        return results;
    }

    outerRangeNeighbors(rangeX: number, rangeY = rangeX) {
        const results: TileClass[] = [];
        for (let y = -rangeY; y <= rangeY; y += 1) {
            for (let x = -rangeX; x <= rangeX; x += 1) {
                if (x === -rangeX || x === rangeX || y === -rangeY || y === rangeY)
                    results.push(new TileClass(x, y).add(this));
            }
        }
        return results;
    }

    ringNeighbors(radius: number) {
        const results: TileClass[] = [];
        let t = TileClass.diagonal(3)
            .clone()
            .scale(Math.round(radius))
            .add(this);
        for (let i = 0; i < TileClass.DIRECTIONS.length; i += 1) {
            for (let j = 0; j < radius * 2; j += 1) {
                results.push(t);
                t = t.neighbor(i);
            }
        }
        return results;
    }

    lineTo(t: TileLike) {
        const results: TileClass[] = [];
        const precision = 1.5; // 1 appeared to be too low here
        const probes = this.floatDistance(t) * precision;
        const step = 1 / Math.max(probes, 1);
        for (let i = 0; i <= probes; i += 1) {
            const newTile = this.clone()
                .lerp(t, step * i)
                .round();
            if (results.some(tile => tile.equals(newTile))) continue;
            results.push(newTile);
        }
        return results;
    }

    clone() {
        return new TileClass(this.x, this.y);
    }

    toString() {
        return `[${this.x}, ${this.y}]`;
    }

    fromString(string: string) {
        const [x, y] = string
            .slice(1, -1)
            .split(', ')
            .map(Number);
        this.x = x;
        this.y = y;
        return this;
    }

    toArray() {
        return [this.x, this.y];
    }
}

export type TileUtil = TileClass;

export default function tileUtils(from: TileLike = { x: 0, y: 0 }) {
    return new TileClass(from.x, from.y);
}
