import React, { Dispatch, SetStateAction, useState, RefObject, useRef } from 'react';
import { Position } from './GameObject';
import Graphic, { GraphicProps } from './Graphic';
import useComponentRegistry, { ComponentRef } from './useComponentRegistry';

export type SpriteRef = ComponentRef<
    'Sprite',
    {
        setColor: Dispatch<SetStateAction<string>>;
        setOpacity: Dispatch<SetStateAction<number>>;
        setState: Dispatch<SetStateAction<string>>;
        setFlipX: Dispatch<SetStateAction<number>>;
        setScale: Dispatch<SetStateAction<number>>;
        setOffset: Dispatch<SetStateAction<Position>>;
        flipX: number;
        nodeRef: RefObject<THREE.Object3D>;
    }
>;

export type SpriteProps = GraphicProps;

export default function Sprite({
    sheet,
    state: initialState = 'default',
    flipX: initialFlipX,
    color: initialColor,
    opacity: initialOpacity,
    offset: initialOffset,
    scale: initialScale,
    ...graphicProps
}: SpriteProps) {
    const [color, setColor] = useState(initialColor);
    const [opacity, setOpacity] = useState(initialOpacity);
    const [flipX, setFlipX] = useState(initialFlipX);
    const [state, setState] = useState(initialState);
    const [offset, setOffset] = useState(initialOffset);
    const [scale, setScale] = useState(initialScale);
    const nodeRef = useRef<THREE.Object3D>();

    useComponentRegistry<SpriteRef>('Sprite', {
        setColor,
        setOpacity,
        setState,
        setOffset,
        setScale,
        setFlipX,
        flipX,
        nodeRef,
    });

    return (
        <Graphic
            ref={nodeRef}
            sheet={sheet}
            state={state}
            flipX={flipX}
            color={color}
            opacity={opacity}
            offset={offset}
            scale={scale}
            {...graphicProps}
        />
    );
}
