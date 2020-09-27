import { css } from '@emotion/core';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Canvas } from 'react-three-fiber';
import { GameObjectLayer, GameObjectRef } from './GameObject';
import { SceneExitEvent } from './Scene';
import createPubSub, { PubSub } from './utils/createPubSub';

export type GameObjectRegistry<T = GameObjectRef> = Map<symbol | string, T>;

export interface GameObjectRegistryUtils {
    registerGameObject: (identifier: symbol, ref: GameObjectRef) => void;
    unregisterGameObject: (identifier: symbol, ref: GameObjectRef) => void;
    findGameObjectById: (id: symbol) => GameObjectRef;
    findGameObjectByName: (name: string) => GameObjectRef;
    findGameObjectsByXY: (x: number, y: number) => GameObjectRef[];
    findGameObjectsByLayer: (layer: GameObjectLayer) => GameObjectRef[];
    // findGameObjects: (props: Partial<GameObjectProps>) => GameObjectRef[];
}

export interface GameContextValue extends GameObjectRegistryUtils, PubSub {
    settings: {
        movementDuration: number;
        cameraZoom: number;
    };
    paused: boolean;
    setPaused: Dispatch<SetStateAction<boolean>>;
    mapSize: [number, number];
    setMapSize: Dispatch<SetStateAction<[number, number]>>;
    setGameState: (key: string | symbol, value: any) => void;
    getGameState: (key: string | symbol) => any;
}

export const GameContext = React.createContext<GameContextValue>(null);

interface Props extends Partial<GameContextValue['settings']> {
    children: React.ReactNode;
}

const styles = {
    root: css`
        position: relative;
        user-select: none;
        width: 100%;
        height: 100%;
    `,
};

export default function Game({
    movementDuration = 250,
    cameraZoom = 64,
    children,
}: Props) {
    const [paused, setPaused] = useState(false);
    const [mapSize, setMapSize] = useState<[number, number]>(() => [1, 1]);
    const [registryById] = useState<GameObjectRegistry>(() => new Map());
    const [registryByName] = useState<GameObjectRegistry>(() => new Map());
    const [registryByXY] = useState<GameObjectRegistry<GameObjectRef[]>>(() => new Map());
    const [registryByLayer] = useState<GameObjectRegistry<GameObjectRef[]>>(
        () => new Map()
    );
    const [pubSub] = useState(() => createPubSub());
    const [gameStore] = useState(() => new Map<string | symbol, any>());

    const storeUtils = useMemo(
        () => ({
            setGameState(key, value) {
                gameStore.set(key, value);
            },
            getGameState(key) {
                return gameStore.get(key);
            },
        }),
        [gameStore]
    );

    useEffect(() => {
        return pubSub.subscribe<SceneExitEvent>('scene-exit', () => {
            registryById.clear();
            registryByName.clear();
            registryByXY.clear();
            registryByLayer.clear();
        });
    }, [pubSub, registryById, registryByLayer, registryByName, registryByXY]);

    const registryUtils = useMemo<GameObjectRegistryUtils>(
        () => ({
            registerGameObject(identifier, ref) {
                // register by id
                registryById.set(identifier, ref);
                // register by name
                registryByName.set(ref.name, ref);
                // register by x, y
                const { transform } = ref;
                const xy = `${transform.x},${transform.y}`;
                const xyList = registryByXY.get(xy) || [];
                xyList.push(ref);
                registryByXY.set(xy, xyList);
                // register by layer
                const layerList = registryByLayer.get(ref.layer) || [];
                layerList.push(ref);
                registryByLayer.set(ref.layer, layerList);
            },
            unregisterGameObject(identifier, ref) {
                // unregister by id
                registryById.delete(identifier);
                // unregister by name
                registryByName.delete(ref.name);
                // unregister by x, y
                const { transform } = ref;
                const xy = `${transform.x},${transform.y}`;
                const xyList = registryByXY.get(xy);
                xyList?.splice(xyList.indexOf(ref), 1);
                // unregister by layer
                const layerList = registryByLayer.get(ref.layer);
                layerList?.splice(layerList.indexOf(ref), 1);
            },
            findGameObjectById(id) {
                return registryById.get(id);
            },
            findGameObjectByName(name) {
                return registryByName.get(name);
            },
            findGameObjectsByXY(x, y) {
                return registryByXY.get(`${x},${y}`)?.filter(obj => !obj.disabled) || [];
            },
            findGameObjectsByLayer(layer) {
                return registryByLayer.get(layer)?.filter(obj => !obj.disabled) || [];
            },
        }),
        [registryById, registryByLayer, registryByName, registryByXY]
    );

    const contextValue: GameContextValue = {
        settings: {
            movementDuration,
            cameraZoom,
        },
        paused,
        setPaused,
        mapSize,
        setMapSize,
        ...storeUtils,
        ...registryUtils,
        ...pubSub,
    };

    return (
        <div css={styles.root}>
            <Canvas
                camera={{
                    position: [0, 0, 32],
                    zoom: cameraZoom,
                    near: 0.1,
                    far: 64,
                }}
                orthographic
                noEvents
                gl2
                // @ts-ignore
                gl={{ antialias: false }}
                onContextMenu={e => e.preventDefault()}
            >
                <GameContext.Provider value={contextValue}>
                    {children}
                </GameContext.Provider>
            </Canvas>
        </div>
    );
}
