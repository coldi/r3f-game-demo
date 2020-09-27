import css from '@emotion/css';

export default function globalStyles() {
    return css`
        :root {
            user-select: none;
        }
        :root,
        body,
        #root {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            height: 100%;
        }
        body {
            position: relative;
            margin: 0;
            padding: 0;
            overflow: hidden;
            color: white;
            background: black;
        }
    `;
}
