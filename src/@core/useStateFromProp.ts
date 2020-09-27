import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export default function useStateFromProp<T = undefined>(
    prop: T
): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(prop);
    const initial = useRef(true);

    useEffect(() => {
        if (!initial.current) {
            setState(prop);
        }
        initial.current = false;
    }, [prop]);

    return [state, setState];
}
