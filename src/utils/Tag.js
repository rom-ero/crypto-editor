/* eslint-disable prettier/prettier */
export function getFunctionNameAndSymbolFromTag(tag) {

    //Zawartosć tagu bez spacji i znaku specjalnego &nbsp;
    let tagContentCleared = tag.replace(/{{|}}|\s|&nbsp;/g, "");

    //Wyodrębnienie nazwy symbolu
    let [fnName, symbol] = tagContentCleared.split("/");

    return { fnName, symbol };
}


export function getTagsFromText(text) {

    return text.match(
        /(?:\{\{){1}(?:&nbsp;|\s)*([a-zA-Z0-9_-]+){1}(?:&nbsp;|\s)*(\/)(?:&nbsp;|\s)*([a-zA-Z0-9_-]+){1}(?:&nbsp;|\s)*(?:\}\}){1}/g
    );

};

export function replaceAll(str, map) {
    if (map.size === 0) return str;

    var re = new RegExp(Array.from(map.keys()).join("|"), "gi");

    return str.replace(re, function (matched) {
        let val = map.get(matched);

        if (val !== "") {
            return `<b>${val}</b>`;
        } else {
            return matched;
        }
    });
};