import { useCallback, useState } from 'react';

export default function useForceUpdate() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
}
