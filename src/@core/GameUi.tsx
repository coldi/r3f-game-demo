import { HTML } from 'drei';
import React from 'react';
import { AssetLoaderProvider } from './AssetLoader';
import { GameContext } from './Game';
import useGame from './useGame';

interface Props {
    children: React.ReactNode;
}

export default function GameUi({ children }: Props) {
    const gameContextValue = useGame(); // forwarded to dom reconciler

    return (
        <HTML eps={1} zIndexRange={[0, 0]}>
            <GameContext.Provider value={gameContextValue}>
                <AssetLoaderProvider>{children}</AssetLoaderProvider>
            </GameContext.Provider>
        </HTML>
    );
}
