import { useThree } from 'react-three-fiber';
import { MoveableRef, MoveDirection } from './Moveable';
import { SceneInitEvent, SceneReadyEvent } from './Scene';
import useComponentRegistry, { ComponentRef } from './useComponentRegistry';
import useGame from './useGame';
import useGameEvent from './useGameEvent';
import useGameObject from './useGameObject';
import useInteraction from './useInteraction';
import useSceneManager from './useSceneManager';

export interface ScenePortalProps {
    name: string;
    target: string;
    enterDirection?: MoveDirection;
    controlled?: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
}

export type ScenePortalRef = ComponentRef<
    'ScenePortal',
    Pick<ScenePortalProps, 'name' | 'target'> & {
        port: (target?: string) => void;
    }
>;

const targetPortalKey = Symbol('targetPortalKey');
const portedGameObjectKey = Symbol('portedGameObjectKey');

export default function ScenePortal({
    name,
    target: targetProp,
    enterDirection = [0, 0],
    controlled = false,
    onEnter,
    onLeave,
}: ScenePortalProps) {
    const { findGameObjectByName, setGameState, getGameState } = useGame();
    const { transform, nodeRef } = useGameObject();
    const { setScene } = useSceneManager();
    const { camera } = useThree();
    const [enterX, enterY] = enterDirection;

    const api = useComponentRegistry<ScenePortalRef>('ScenePortal', {
        name,
        target: targetProp,
        port(target = targetProp) {
            const [targetScene, targetPortal] = target.split('/');

            setGameState(targetPortalKey, targetPortal);
            setGameState(portedGameObjectKey, 'player');
            onEnter?.();
            setScene(targetScene);
        },
    });

    useInteraction(async ref => {
        if (controlled) return;
        if (ref.name !== 'player') return;
        api.port();
    });

    // set position of target game object to this portal
    useGameEvent<SceneInitEvent>(
        'scene-init',
        () => {
            const targetName = getGameState(targetPortalKey);
            if (targetName !== name) return;

            const portedKey = getGameState(portedGameObjectKey);
            const portedObj = findGameObjectByName(portedKey);
            portedObj.transform.setX(transform.x);
            portedObj.transform.setY(transform.y);

            // update camera position
            camera.position.setX(nodeRef.current.position.x);
            camera.position.setY(nodeRef.current.position.y);
        },
        [name, transform]
    );

    // move target game object in enter direction
    useGameEvent<SceneReadyEvent>(
        'scene-ready',
        () => {
            const targetName = getGameState(targetPortalKey);
            if (targetName !== name) return;
            if (!enterX && !enterY) return;

            const portedKey = getGameState(portedGameObjectKey);
            const portedObj = findGameObjectByName(portedKey);
            if (!portedObj) return;

            onLeave?.();

            portedObj
                .getComponent<MoveableRef>('Moveable')
                .move({ x: transform.x + enterX, y: transform.y + enterY });

            // reset game state
            setGameState(targetPortalKey, null);
            setGameState(portedGameObjectKey, null);
        },
        [name, enterX, enterY, transform]
    );

    return null;
}
