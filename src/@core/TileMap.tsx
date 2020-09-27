import React, { useEffect, useMemo } from 'react';
import useGame from './useGame';
import { PubSubEvent } from './utils/createPubSub';

export type TileMapUpdateEvent = PubSubEvent<'tile-map-update', void>;

export type TileMapDataValue = number | string;
export type TileMapData = TileMapDataValue[][];

export type TileMapResolver = (
    type: TileMapDataValue,
    x: number,
    y: number
) => React.ReactElement;

interface Props {
    data: TileMapData;
    resolver?: TileMapResolver;
    definesMapSize?: boolean;
}

export default function TileMap({ data, resolver, definesMapSize = false }: Props) {
    const { setMapSize, publish } = useGame();
    // const [mapData, setMapData] = useState([]);
    const mapData = useMemo(() => data.slice().reverse(), [data]);

    useEffect(() => {
        publish<TileMapUpdateEvent>('tile-map-update');
    }, [mapData, publish]);

    useEffect(() => {
        if (definesMapSize && mapData.length) {
            const sizeX = mapData[0].length;
            const sizeY = mapData.length;
            setMapSize([sizeX, sizeY]);
        }
    }, [mapData, definesMapSize, setMapSize]);

    if (!resolver) return null;

    return <>{mapData.map((row, y) => row.map((type, x) => resolver(type, x, y)))}</>;
}
