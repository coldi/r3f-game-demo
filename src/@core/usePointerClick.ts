import { useEffect } from 'react';
import { useThree } from 'react-three-fiber';
import useGame from './useGame';

export default function usePointerClick(clickCallback: (event: PointerEvent) => void) {
    const {
        gl: { domElement },
    } = useThree();
    const { paused } = useGame();

    useEffect(() => {
        function handleClick(event: PointerEvent) {
            if (paused) return;
            clickCallback(event);
        }
        domElement.addEventListener('pointerup', handleClick);
        return () => {
            domElement.removeEventListener('pointerup', handleClick);
        };
    }, [paused, clickCallback, domElement]);
}
