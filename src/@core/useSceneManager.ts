import { useContext } from 'react';
import { SceneManagerContextValue, SceneManagerContext } from './SceneManager';

export default function useSceneManager() {
    return useContext(SceneManagerContext) as SceneManagerContextValue;
}
