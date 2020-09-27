import React from 'react';
import Collider, { TriggerEvent } from './Collider';
import useGameObjectEvent from './useGameObjectEvent';
import useSceneManager from './useSceneManager';

interface Props {
    targetScene: string;
}

export default function SceneSwitch({ targetScene }: Props) {
    const { setScene } = useSceneManager();

    useGameObjectEvent<TriggerEvent>('trigger', () => setScene(targetScene));

    return <Collider isTrigger />;
}
