import React, {
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ComponentRegistryUtils } from './useComponentRegistry';
import useForceUpdate from './useForceUpdate';
import useGame from './useGame';
import useGameObject from './useGameObject';
import useGameObjectStore from './useGameObjectStore';
import useStateFromProp from './useStateFromProp';
import createPubSub, { PubSub } from './utils/createPubSub';

export interface Position {
    x: number;
    y: number;
}

export interface GameObjectContextValue extends ComponentRegistryUtils, PubSub {
    id: symbol;
    name: Readonly<string>;
    transform: {
        x: Readonly<number>;
        y: Readonly<number>;
        setX: Dispatch<SetStateAction<number>>;
        setY: Dispatch<SetStateAction<number>>;
    };
    forceUpdate: VoidFunction;
    nodeRef: RefObject<THREE.Group>;
    getRef: () => GameObjectRef;
}

export const GameObjectContext = React.createContext<GameObjectContextValue>(null);

export type GameObjectLayer =
    | 'ground'
    | 'ground-decal'
    | 'wall'
    | 'visible-wall'
    | 'water'
    | 'obstacle'
    | 'character'
    | 'item'
    | 'fx';

export interface GameObjectProps extends Partial<Position> {
    name?: string;
    displayName?: string;
    layer?: GameObjectLayer;
    disabled?: boolean;
    persisted?: boolean;
    children?: React.ReactNode;
}

export type GameObjectRef = Pick<GameObjectProps, 'name' | 'displayName'> & {
    id: symbol;
    layer: GameObjectLayer;
    transform: GameObjectContextValue['transform'];
    getComponent: ComponentRegistryUtils['getComponent'];
    disabled: Readonly<boolean>;
    setDisabled: Dispatch<SetStateAction<boolean>>;
    subscribe: PubSub['subscribe'];
};

function Persistence() {
    const { getRef } = useGameObject();

    useGameObjectStore(
        '_gameObject',
        () => {
            const self = getRef();
            return {
                x: self.transform.x,
                y: self.transform.y,
                disabled: self.disabled,
            };
        },
        stored => {
            const self = getRef();
            // TODO: make peristence of position optional
            //   (the position of one-time enemies like bosses should not be persisted)
            // self.transform.setX(stored.x);
            // self.transform.setY(stored.y);
            self.setDisabled(stored.disabled);
        }
    );

    return null;
}

export default function GameObject({
    name,
    displayName,
    layer,
    children,
    disabled: initialDisabled = false,
    persisted = false,
    ...props
}: GameObjectProps) {
    const identifier = useRef(Symbol('GameObject'));
    const node = useRef(null);
    const [registry] = useState(() => new Map<string, any>());
    const [pubSub] = useState(() => createPubSub());
    const [x, setX] = useStateFromProp(props.x || 0);
    const [y, setY] = useStateFromProp(props.y || 0);
    const [disabled, setDisabled] = useState(initialDisabled);
    const { registerGameObject, unregisterGameObject } = useGame();
    const forceUpdate = useForceUpdate();

    const registryUtils = useMemo<ComponentRegistryUtils>(
        () => ({
            registerComponent(id, api) {
                registry.set(id, api);
            },
            unregisterComponent(id) {
                registry.delete(id);
            },
            getComponent(id) {
                return registry.get(id);
            },
        }),
        [registry]
    );

    const transform = useMemo<GameObjectContextValue['transform']>(
        () => ({
            x,
            y,
            setX,
            setY,
        }),
        [x, y, setX, setY]
    );

    const gameObjectRef = useMemo<GameObjectRef>(
        () => ({
            id: identifier.current,
            name,
            displayName,
            layer,
            transform,
            getComponent: registryUtils.getComponent,
            disabled,
            setDisabled,
            subscribe: pubSub.subscribe,
        }),
        [name, displayName, layer, transform, registryUtils, disabled, pubSub]
    );

    const getRef = useCallback(() => gameObjectRef, [gameObjectRef]);

    useLayoutEffect(() => {
        const id = identifier.current;
        registerGameObject(id, gameObjectRef);
        return () => unregisterGameObject(id, gameObjectRef);
    }, [registerGameObject, unregisterGameObject, gameObjectRef]);

    const contextValue: GameObjectContextValue = {
        id: identifier.current,
        name,
        transform,
        forceUpdate,
        nodeRef: node,
        getRef,
        ...pubSub,
        ...registryUtils,
    };

    // TODO: add constants for z indices
    let offsetZ = 0;
    if (layer === 'ground') offsetZ = -1;
    if (layer === 'ground-decal') offsetZ = 0.1;
    if (layer === 'obstacle') offsetZ = 0.2;
    if (layer === 'item') offsetZ = 0.3;
    if (layer === 'character') offsetZ = 0.5;
    if (layer === 'fx') offsetZ = 4;

    return (
        <GameObjectContext.Provider value={contextValue}>
            {persisted && <Persistence />}
            <group ref={node} position={[x, y, (-y + offsetZ) / 100]}>
                {!disabled && children}
            </group>
        </GameObjectContext.Provider>
    );
}
