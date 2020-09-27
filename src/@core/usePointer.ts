import { useRef, useState } from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { Position } from './GameObject';
import useGameLoop from './useGameLoop';

const vector3 = new THREE.Vector3();
const getPointer = (mouse: THREE.Vector2, camera: THREE.Camera) => {
    const { x, y } = vector3.set(mouse.x, mouse.y, 0.5).unproject(camera);
    return { x: Math.round(x), y: Math.round(y) };
};

export default function usePointer() {
    const { camera, mouse } = useThree();
    const [pointer, setPointer] = useState<Position>(() => getPointer(mouse, camera));
    const prevPointer = useRef(pointer);

    useGameLoop(() => {
        const nextPointer = getPointer(mouse, camera);
        if (
            prevPointer.current.x === nextPointer.x &&
            prevPointer.current.y === nextPointer.y
        )
            return;

        setPointer(nextPointer);
        prevPointer.current = nextPointer;
    });

    return pointer;
}
