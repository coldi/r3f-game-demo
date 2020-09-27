import { useCallback } from 'react';
import { GameObjectRef, Position } from './GameObject';
import useGameObject from './useGameObject';
import useCollisionTest, { CollisionTestOptions } from './useCollisionTest';
import tileUtils from './utils/tileUtils';

interface Options extends CollisionTestOptions {
    origin?: GameObjectRef;
}

export default function useSightTest(options: Options = { sight: true }) {
    const test = useCollisionTest(options);
    const { transform: selfTransform } = useGameObject() || {}; // optional
    const transform = options.origin?.transform || selfTransform;

    return useCallback(
        (targetObjectOrPosition: GameObjectRef | Position, range: number) => {
            const target =
                (targetObjectOrPosition as GameObjectRef).transform ||
                (targetObjectOrPosition as Position);
            // TODO: transform might be deprecated when this fn is called
            const base = tileUtils(transform);
            if (base.distance(target) > range) return false;

            const line = base.lineTo(target).slice(1, -1);
            for (const tile of line) {
                // break 'line of sight' if not walkable
                if (!test(tile)) return false;
            }
            return true;
        },
        [test, transform]
    );
}
