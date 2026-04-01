import React from 'react';
import { renderToString } from 'react-dom/server';
import Markdown from 'react-markdown';

try {
    const html = renderToString(
        React.createElement(Markdown, { className: "prose" }, "Hello *world*!")
    );
    console.log("SUCCESS:", html);
} catch (err) {
    console.error("ERROR 1:", err.message);
}

try {
    const html2 = renderToString(
        React.createElement(Markdown, { }, "Hello *world*!")
    );
    console.log("SUCCESS 2:", html2);
} catch (err) {
    console.error("ERROR 2:", err.message);
}
