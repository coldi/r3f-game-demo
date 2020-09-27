import React from 'react';
import Collider, { TriggerEvent } from '../@core/Collider';
import GameObject, { GameObjectProps } from '../@core/GameObject';
import { useSound } from '../@core/Sound';
import Sprite from '../@core/Sprite';
import useGameObject from '../@core/useGameObject';
import useGameObjectEvent from '../@core/useGameObjectEvent';
import soundData from '../soundData';
import spriteData from '../spriteData';

function DisableOnTriggerScript() {
    const { getRef } = useGameObject();
    const playSfx = useSound(soundData.eating);

    useGameObjectEvent<TriggerEvent>('trigger', other => {
        if (other.name === 'player') {
            getRef().setDisabled(true);
            playSfx();
        }
    });

    return null;
}

export default function PizzaPickup(props: GameObjectProps) {
    const name = `pizza-${props.x}-${props.y}`; // fallback name required for persisted flag
    return (
        <GameObject name={name} persisted {...props}>
            <Sprite {...spriteData.objects} state="pizza" />
            <Collider isTrigger />
            <DisableOnTriggerScript />
        </GameObject>
    );
}
