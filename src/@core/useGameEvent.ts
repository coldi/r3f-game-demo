import { DependencyList, useEffect, useRef } from 'react';
import { PubSubEvent } from './utils/createPubSub';
import useGame from './useGame';

export default function useGameEvent<T extends PubSubEvent>(
    eventName: T['name'],
    callback: (data: T['data']) => void,
    deps: DependencyList = []
) {
    const callbackRef = useRef<typeof callback>();
    const { subscribe } = useGame();

    callbackRef.current = callback;

    useEffect(() => {
        return subscribe(eventName, callbackRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subscribe, eventName, ...deps]);
}
