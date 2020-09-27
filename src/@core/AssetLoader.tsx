import React, {
    createContext,
    RefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import HtmlOverlay from './HtmlOverlay';
import useStateFromProp from './useStateFromProp';

export type AssetType = HTMLImageElement | HTMLAudioElement;

export interface AssetStore {
    [url: string]: AssetType;
}

export const AssetLoaderContext = createContext<RefObject<AssetStore>>(null);

interface Props {
    urls: string[];
    placeholder: React.ReactNode;
    children: React.ReactNode;
}

const createRegExp = (extensions: string) => new RegExp(`^.*\\.(${extensions})$`, 'i');

const imageRegExp = createRegExp('jpg|png|gif');
const audioRegExp = createRegExp('wav|mp3|ogg');

function loadAsset(url) {
    return new Promise<AssetType>((resolve, reject) => {
        let asset: AssetType;
        if (imageRegExp.test(url)) asset = new Image();
        else if (audioRegExp.test(url)) asset = new Audio();

        function handleLoad(event: Event) {
            if (event.type === 'error') {
                reject();
                return;
            }
            resolve(asset);
        }
        asset.onload = handleLoad;
        asset.oncanplaythrough = handleLoad;
        asset.onerror = handleLoad;
        asset.src = url;
    });
}

// define asset store in module scope, so it can be accessed
// from both dom and webgl reconcilers.
const assets: { current: AssetStore } = {
    current: {},
};

interface ProviderProps {
    children: React.ReactNode;
}

export function AssetLoaderProvider({ children }: ProviderProps) {
    return (
        <AssetLoaderContext.Provider value={assets}>
            {children}
        </AssetLoaderContext.Provider>
    );
}

export default function AssetLoader({ urls: urlsProp, placeholder, children }: Props) {
    const [urls, setUrls] = useStateFromProp(urlsProp);
    const [count, setCount] = useState(0);
    // const assets = useRef<AssetStore>({});
    const uniqueUrls = useRef<Set<string>>();
    uniqueUrls.current = new Set(urls);
    const timeout = useRef<NodeJS.Timeout>();
    const mounted = useRef(true);

    useLayoutEffect(
        () => () => {
            mounted.current = false;
        },
        []
    );

    useEffect(() => {
        (async () => {
            for (const url of uniqueUrls.current) {
                try {
                    const asset = await loadAsset(url);
                    assets.current[url] = asset;
                    if (mounted.current) setCount(current => current + 1);
                } catch {
                    // eslint-disable-next-line no-console
                    console.error('Error loading asset:', url);
                }
            }
            clearTimeout(timeout.current);
        })();
    }, [urls]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // sometimes after WDS triggers a reload, not all assets are being reloaded here.
            const delay = 2000 + uniqueUrls.current.size * 100;
            timeout.current = setTimeout(() => {
                setCount(0);
                setUrls(urls.slice());
                // eslint-disable-next-line no-console
                console.warn('AssetLoader failed loading after timeout.');
            }, delay);
            return () => clearTimeout(timeout.current);
        }
        return undefined;
    }, [urls, setUrls]);

    if (count < uniqueUrls.current.size) {
        return placeholder ? (
            <HtmlOverlay center>
                <span>{placeholder}</span>
            </HtmlOverlay>
        ) : null;
    }

    return <AssetLoaderProvider>{children}</AssetLoaderProvider>;
}
