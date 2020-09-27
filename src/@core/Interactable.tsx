import { useRef } from 'react';
import useComponentRegistry, { ComponentRef } from './useComponentRegistry';
import useGame from './useGame';
import useGameObject from './useGameObject';
import { GameObjectRef, Position } from './GameObject';
import { PubSubEvent } from './utils/createPubSub';

export type WillInteractEvent = PubSubEvent<'will-interact', Position>;
export type InteractionEvent = PubSubEvent<'interaction', GameObjectRef>;
export type DidInteractEvent = PubSubEvent<'did-interact', Position>;

export type InteractionCallback = (obj: GameObjectRef) => Promise<any> | void;

export type InteractableRef = ComponentRef<
    'Interactable',
    {
        interact: (position: Position) => Promise<boolean>;
        onInteract: (ref: GameObjectRef) => Promise<void>;
        canInteract: () => boolean;
        canReceiveInteraction: () => boolean;
    }
>;

export default function Interactable() {
    const { findGameObjectsByXY } = useGame();
    const { getRef, publish, hasSubscriptions } = useGameObject();
    const canInteract = useRef(true);

    useComponentRegistry<InteractableRef>('Interactable', {
        // this is executed on the game object that *initiates* an interaction
        async interact({ x, y }) {
            const interactables = findGameObjectsByXY(x, y)
                .map(obj => obj.getComponent<InteractableRef>('Interactable'))
                .filter(component => component?.canReceiveInteraction());

            if (!interactables.length) return false;

            publish<WillInteractEvent>('will-interact', { x, y });
            canInteract.current = false;
            await Promise.all(interactables.map(comp => comp.onInteract(getRef())));
            canInteract.current = true;
            publish<DidInteractEvent>('did-interact', { x, y });
            return true;
        },
        // this is executed on the game object that *receives* an interaction
        async onInteract(gameObject) {
            if (canInteract.current) {
                canInteract.current = false;
                publish<WillInteractEvent>('will-interact', gameObject.transform);
                await publish<InteractionEvent>('interaction', gameObject);
                publish<DidInteractEvent>('did-interact', gameObject.transform);
                canInteract.current = true;
            }
        },
        canInteract() {
            return canInteract.current;
        },
        canReceiveInteraction() {
            return (
                canInteract.current &&
                hasSubscriptions<InteractionEvent>('interaction') > 0
            );
        },
    });

    return null;
}
