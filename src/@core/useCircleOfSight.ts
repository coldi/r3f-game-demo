import { useCallback } from 'react';
import { Position } from './GameObject';
import useCollisionTest from './useCollisionTest';
import tileUtils from './utils/tileUtils';

export default function useCircleOfSight() {
    const testSight = useCollisionTest({ sight: true });
    return useCallback(
        (origin: Position, range: number) => {
            const center = tileUtils(origin);
            const ring = center.rangeNeighbors(range);
            // visibleTiles should only contain unique items
            const visibleTiles = new Set([center.toString()]);
            // loop over cells of outer ring
            for (const ringTile of ring) {
                // get cells on a direct line from origin to ring cell
                const line = center.lineTo(ringTile).slice(1);
                // loop over line
                for (const tile of line) {
                    visibleTiles.add(tile.toString());
                    // break 'line of sight' if not walkable
                    if (!testSight(tile)) {
                        break;
                    }
                }
            }
            return Array.from(visibleTiles.values()).map(string =>
                tileUtils().fromString(string)
            );
        },
        [testSight]
    );
}
