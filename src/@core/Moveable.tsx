import anime from 'animejs';
import { useEffect, useRef } from 'react';
import { Position } from './GameObject';
import useCollisionTest from './useCollisionTest';
import useComponentRegistry, { ComponentRef } from './useComponentRegistry';
import useGame from './useGame';
import useGameObject from './useGameObject';
import { PubSubEvent } from './utils/createPubSub';
import waitForMs from './utils/waitForMs';

export type Direction = -1 | 0 | 1;
export type MoveDirection = [Direction, Direction];

export type AttemptMoveEvent = PubSubEvent<'attempt-move', Position>;
export type CannotMoveEvent = PubSubEvent<'cannot-move', Position>;
export type WillMoveEvent = PubSubEvent<'will-move', Position>;
export type WillChangePositionEvent = PubSubEvent<'will-change-position', Position>;
export type DidMoveEvent = PubSubEvent<'did-move', Position>;
export type DidChangePositionEvent = PubSubEvent<'did-change-position', Position>;
export type MovingEvent = PubSubEvent<
    'moving',
    {
        currentPosition: Position;
        nextPosition: Position;
        direction: MoveDirection;
        facingDirection: Direction;
    }
>;
export type MoveableRef = ComponentRef<
    'Moveable',
    {
        canMove: (position?: Position) => boolean;
        isMoving: () => boolean;
        blockMovement: (delayMs: number) => Promise<any>;
        move: (position: Position, type?: 'move' | 'push' | 'jump') => Promise<boolean>;
    }
>;

interface Props {
    isStatic?: boolean;
}

export default function Moveable({ isStatic = false }: Props) {
    const {
        settings: { movementDuration },
    } = useGame();
    const { transform, publish, nodeRef } = useGameObject();
    const canMove = useRef(!isStatic);
    const testCollision = useCollisionTest();
    const nextPosition = useRef({ x: transform.x, y: transform.y });
    const facingDirection = useRef<Direction>(1);
    const movingDirection = useRef<MoveDirection>([0, 0]);

    const api = useComponentRegistry<MoveableRef>('Moveable', {
        canMove(position) {
            if (isStatic) return false;
            if (position && !testCollision(position)) return false;
            return canMove.current;
        },
        isMoving() {
            return !isStatic && !canMove.current;
        },
        async blockMovement(delayMs) {
            canMove.current = false;
            await waitForMs(delayMs);
            canMove.current = true;
        },
        async move(targetPosition, type = 'move') {
            if (isStatic) return false;
            if (!canMove.current) return false;

            const isJumping = type === 'jump';
            const isPushed = type === 'push';
            const isForced = isJumping || isPushed;

            !isPushed && publish<AttemptMoveEvent>('attempt-move', targetPosition);

            if (!testCollision(targetPosition)) {
                publish<CannotMoveEvent>('cannot-move', targetPosition);
                await api.blockMovement(movementDuration / 2);
                return false;
            }

            publish<WillChangePositionEvent>('will-change-position', targetPosition);
            !isForced && publish<WillMoveEvent>('will-move', targetPosition);

            const dirX = (targetPosition.x - transform.x) as Direction;
            const dirY = (targetPosition.y - transform.y) as Direction;
            nextPosition.current = targetPosition;
            movingDirection.current = [dirX, dirY];
            facingDirection.current = dirX || facingDirection.current;

            canMove.current = false;

            const fromX = transform.x;
            const fromY = transform.y;
            const toX = targetPosition.x;
            const toY = targetPosition.y;

            anime.remove(nodeRef.current.position);

            await anime({
                targets: nodeRef.current.position,
                x: [fromX, toX],
                y: [fromY, toY],
                duration: movementDuration,
                easing: 'linear',
                begin() {
                    if (dirX) transform.setX(targetPosition.x);
                    if (dirY) transform.setY(targetPosition.y);
                },
                update() {
                    !isForced &&
                        publish<MovingEvent>('moving', {
                            currentPosition: nodeRef.current.position,
                            nextPosition: targetPosition,
                            direction: movingDirection.current,
                            facingDirection: facingDirection.current,
                        });
                },
            }).finished;

            canMove.current = true;

            publish<DidChangePositionEvent>('did-change-position', targetPosition);
            !isForced && publish<DidMoveEvent>('did-move', nextPosition.current);

            return true;
        },
    });

    useEffect(() => {
        const node = nodeRef.current;
        // clean up running animation
        return () => anime.remove(node.position);
    }, [nodeRef]);

    return null;
}
