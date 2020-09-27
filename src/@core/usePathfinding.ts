import { useCallback } from 'react';
import findPath from './utils/findPath';
import { Position } from './GameObject';
import useGameObject from './useGameObject';
import useMapSnapshot from './useMapSnapshot';

interface PathfindingOptions {
    from?: Position;
    to: Position;
}

export default function usePathfinding() {
    const { transform } = useGameObject() || {}; // optional
    const createMap = useMapSnapshot();

    return useCallback(
        ({ from = transform, to }: PathfindingOptions) => {
            return findPath({
                from,
                to,
                map: createMap(to),
            });
        },
        [createMap, transform]
    );
}
