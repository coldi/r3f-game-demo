import { SoundProps } from './@core/Sound';

const soundData: { [index: string]: SoundProps } = {
    eating: {
        // "Chewing" by InspectorJ - freesound.org
        src: './assets/sfx/eating.wav',
    },
    drinking: {
        // "Drinking" by dersuperanton - freesound.org"
        src: './assets/sfx/drinking.wav',
    },
    footstep: {
        src: './assets/sfx/footstep.wav',
        volume: 0.75,
    },
};

export default soundData;
