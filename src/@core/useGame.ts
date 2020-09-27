import { useContext } from 'react';
import { GameContext, GameContextValue } from './Game';

export default function useGame() {
    return useContext(GameContext) as GameContextValue;
}
