import { useCallback } from 'react';
import { Position } from './GameObject';
import { InteractableRef } from './Interactable';
import useGame from './useGame';
import useGameObject from './useGameObject';

export default function useInteractableTest() {
    const { findGameObjectsByXY } = useGame();
    const { id } = useGameObject() || {}; // optional

    return useCallback(
        (position: Position) => {
            const { x, y } = position;

            return findGameObjectsByXY(x, y).some(gameObject => {
                // skip own collider
                if (gameObject.id === id) return false;

                const interactable = gameObject.getComponent<InteractableRef>(
                    'Interactable'
                );
                return !!interactable;
            });
        },
        [id, findGameObjectsByXY]
    );
}
