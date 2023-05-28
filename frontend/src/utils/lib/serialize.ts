export const serialize = (obj) => {
    const str = [];
    for (const p in obj)
        if (Object.hasOwn(obj, p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
    return str.join('&');
};
