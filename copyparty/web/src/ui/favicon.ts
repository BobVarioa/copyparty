export const parseFavicon = (txt: string) => {
    let dv = txt.trim().split(/ +/);
    let fg = (dv.length < 2 ? "fc5" : dv[1]).toLowerCase();
    let bg = (dv.length < 3 ? "222" : dv[2]).toLowerCase();
    let ico = dv[0];

    if (fg.toLowerCase() === "none") fg = "";

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg version="1.1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        ${bg !== "none" ? `<rect width="100%" height="100%" rx="16" fill="#${bg}" />` : ""}
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="64px" fill="#${fg}">${ico}</text>
    </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
