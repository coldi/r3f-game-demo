import { useCallback } from 'react';
import { Position } from './GameObject';
import useGame from './useGame';
import useInteractableTest from './useInteractableTest';
import useCollisionTest from './useCollisionTest';

export const WALKABLE = 0;
export const BLOCKED = 1;

export default function useMapSnapshot() {
    const { mapSize } = useGame();
    const testCollision = useCollisionTest();
    const testInteractable = useInteractableTest();

    return useCallback(
        (destination?: Position) => {
            const [mapWidth, mapHeight] = mapSize;
            const snapshot: number[][] = [[]];
            for (let y = 0; y < mapHeight; y += 1) {
                snapshot[y] = snapshot[y] || [];
                for (let x = 0; x < mapWidth; x += 1) {
                    snapshot[y][x] = testCollision({ x, y }) ? WALKABLE : BLOCKED;
                    // allow destination to be walkable, if it is interactable
                    if (destination != null) {
                        if (x === destination.x && y === destination.y) {
                            snapshot[y][x] = testInteractable({ x, y })
                                ? WALKABLE
                                : snapshot[y][x];
                        }
                    }
                }
            }
            return snapshot;
        },
        [testCollision, testInteractable, mapSize]
    );
}
