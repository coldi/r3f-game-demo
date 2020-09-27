import { InteractionCallback, InteractionEvent } from './Interactable';
import useGameObjectEvent from './useGameObjectEvent';

// this hook exists for legacy support
export default function useInteraction(callback: InteractionCallback) {
    useGameObjectEvent<InteractionEvent>('interaction', callback, [callback]);
}
