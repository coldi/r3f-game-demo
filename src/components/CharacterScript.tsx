import React, { useCallback, useRef } from 'react';
import GameObject, { Position } from '../@core/GameObject';
import Graphic from '../@core/Graphic';
import {
    AttemptMoveEvent,
    DidMoveEvent,
    Direction,
    MoveDirection,
    MovingEvent,
    WillMoveEvent,
} from '../@core/Moveable';
import { useScene } from '../@core/Scene';
import Sound from '../@core/Sound';
import { SpriteRef } from '../@core/Sprite';
import useGameLoop from '../@core/useGameLoop';
import useGameObject from '../@core/useGameObject';
import useGameObjectEvent from '../@core/useGameObjectEvent';
import soundData from '../soundData';
import spriteData from '../spriteData';

interface Props {
    interactionSound?: React.ReactElement;
    children: React.ReactNode;
}

export const characterOffsetY = 0.25;

/**
 * This component applies bounce/wobble animations to the GameObject's Sprite
 * when the character is moving.
 * It also applies a breathe animation when the character is standing still.
 */

export default function CharacterScript({ children }: Props) {
    const { transform, getComponent } = useGameObject();
    const { instantiate } = useScene();
    const groupRef = useRef<THREE.Group>();
    const childRef = useRef<THREE.Group>();
    const scaleRef = useRef<THREE.Group>();
    const movementWobble = useRef(0);
    const movementCount = useRef(0);
    const movementActive = useRef(false);

    // flip sprite in the current moving direction
    const faceDirection = useCallback(
        ({ x, y }: Position): MoveDirection => {
            const sprite = getComponent<SpriteRef>('Sprite');
            const dirX = Math.max(-1, Math.min(1, x - transform.x)) as Direction;
            const dirY = Math.max(-1, Math.min(1, y - transform.y)) as Direction;
            if (dirX) sprite.setFlipX(dirX);
            return [dirX, dirY];
        },
        [transform, getComponent]
    );

    // wobble effect while moving
    const wobble = useCallback(() => {
        if (movementActive.current) {
            movementCount.current += 0.1;
            if (movementWobble.current < 1) {
                movementWobble.current = Math.min(1, movementWobble.current + 0.02);
            }
        } else {
            movementWobble.current = Math.max(0, movementWobble.current - 0.1);
        }

        if (movementWobble.current > 0) {
            const wobbleTime = 2;
            const wobblePower = 0.17;
            const angle =
                Math.sin(movementCount.current * wobbleTime) *
                movementWobble.current *
                wobblePower;
            childRef.current.rotation.set(0, 0, angle);
        } else {
            childRef.current.rotation.set(0, 0, 0);
        }
    }, []);

    // face direction
    useGameObjectEvent<AttemptMoveEvent>('attempt-move', faceDirection, [faceDirection]);

    // when character is about to move, enable wobble and footstep effect
    useGameObjectEvent<WillMoveEvent>(
        'will-move',
        () => {
            movementWobble.current = 1;
            movementActive.current = true;

            const removeInstance = instantiate(
                <GameObject x={transform.x} y={transform.y}>
                    <Graphic
                        {...spriteData.footstep}
                        offset={{ x: 0, y: characterOffsetY }}
                        onIteration={() => removeInstance()}
                    />
                    <Sound {...soundData.footstep} />
                </GameObject>
            );
        },
        [transform]
    );

    // bounce animation while moving
    useGameObjectEvent<MovingEvent>(
        'moving',
        ({ currentPosition, nextPosition, direction, facingDirection }) => {
            const [dirX, dirY] = direction;
            const { x, y } = currentPosition;
            const sizeDivider = 5;

            let bounce = 0;

            let delta = 0;
            if (dirX !== 0) delta = x - nextPosition.x;
            else if (dirY !== 0) delta = (y - nextPosition.y) * -facingDirection;

            if (delta > 0) {
                // left/up
                delta = delta > 0.5 ? 1 - delta : delta;
            } else if (delta < 0) {
                // right/down
                delta = delta < -0.5 ? -1 - delta : delta;
            }
            bounce = Math.abs(delta / sizeDivider);
            childRef.current.position.setX(bounce * dirX);
            childRef.current.position.setY(bounce);
        }
    );

    useGameObjectEvent<DidMoveEvent>('did-move', () => {
        movementActive.current = false;
    });

    useGameLoop(time => {
        // apply wobbling animation
        wobble();

        // apply breathe animation
        if (!movementActive.current) {
            // breathe animation while standing still
            const breathIntensity = 20;
            scaleRef.current.scale.setY(1 + Math.sin(time / 240) / breathIntensity);
        } else {
            // no breathe animation while moving
            scaleRef.current.scale.setY(1);
        }
    });

    const offsetY = 0.5;

    return (
        <group position-y={characterOffsetY}>
            <group ref={groupRef}>
                <group ref={scaleRef} position-y={-offsetY}>
                    <group position-y={offsetY}>
                        <group ref={childRef}>{children}</group>
                    </group>
                </group>
            </group>
        </group>
    );
}
