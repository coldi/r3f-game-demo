import React, { useEffect, useState } from 'react';
import { Position } from '../@core/GameObject';
import { InteractableRef } from '../@core/Interactable';
import { MoveableRef } from '../@core/Moveable';
import useCollisionTest from '../@core/useCollisionTest';
import useGameLoop from '../@core/useGameLoop';
import useGameObject from '../@core/useGameObject';
import useKeyPress from '../@core/useKeyPress';
import usePathfinding from '../@core/usePathfinding';
import usePointer from '../@core/usePointer';
import usePointerClick from '../@core/usePointerClick';
import tileUtils from '../@core/utils/tileUtils';
import PlayerPathOverlay from './PlayerPathOverlay';

export default function PlayerScript() {
    const { getComponent, transform } = useGameObject();
    const testCollision = useCollisionTest();
    const findPath = usePathfinding();
    const [path, setPath] = useState<Position[]>([]);
    const [pathOverlayEnabled, setPathOverlayEnabled] = useState(true);

    // key controls
    const leftKey = useKeyPress(['ArrowLeft', 'a']);
    const rightKey = useKeyPress(['ArrowRight', 'd']);
    const upKey = useKeyPress(['ArrowUp', 'w']);
    const downKey = useKeyPress(['ArrowDown', 's']);

    useGameLoop(() => {
        const direction = {
            x: -Number(leftKey) + Number(rightKey),
            y: Number(upKey) - Number(downKey),
        };
        const nextPosition = tileUtils(transform).add(direction);
        // is same position?
        if (tileUtils(nextPosition).equals(transform)) return;

        // is already moving?
        if (!getComponent<MoveableRef>('Moveable').canMove()) return;

        // will cut corner?
        const horizontal = { ...transform, x: nextPosition.x };
        const vertical = { ...transform, y: nextPosition.y };
        const canCross =
            direction.x !== 0 && direction.y !== 0
                ? // test diagonal movement
                  testCollision(horizontal) && testCollision(vertical)
                : true;

        if (canCross) {
            setPath([nextPosition]);
            setPathOverlayEnabled(false);
        }
    });

    // mouse controls
    const pointer = usePointer();

    usePointerClick(event => {
        if (event.button === 0) {
            try {
                const nextPath = findPath({ to: pointer });
                if (path.length > 0) {
                    nextPath.unshift(transform);
                }
                setPath(nextPath);
                setPathOverlayEnabled(true);
            } catch {
                // pointer out of bounds
                setPath([]);
            }
        }
    });

    // walk the path
    useEffect(() => {
        if (!path.length) return;

        const [nextPosition] = path;

        (async () => {
            const anyAction =
                (await getComponent<MoveableRef>('Moveable')?.move(nextPosition)) ||
                (path.length === 1 && // try interaction on last step of path
                    (await getComponent<InteractableRef>('Interactable')?.interact(
                        nextPosition
                    )));

            if (anyAction) {
                // proceed with next step in path
                setPath(current => current.slice(1));
            }
        })();
    }, [path, getComponent]);

    return (
        <PlayerPathOverlay
            path={path}
            pathVisible={pathOverlayEnabled}
            pointer={pointer}
        />
    );
}
