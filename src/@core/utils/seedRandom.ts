/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
export type Seed = string | number;

let baseSeed: Seed = '?';

export function setSeed(seed: Seed) {
    baseSeed = seed;
}

export default function seedRandom(seed: Seed) {
    const mash = makeMash();
    return mash(`${baseSeed}${seed}`);
}

export function makeRandom(seed: Seed) {
    let i = 0;
    return function random() {
        return seedRandom(`${seed}${i++}`);
    };
}

// mash function originally part of Baagøe's Alea algorithm:

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
function makeMash() {
    let n = 0xefc8249d;

    return (seed: Seed) => {
        seed = String(seed);
        for (let i = 0; i < seed.length; i++) {
            n += seed.charCodeAt(i);
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
}
