const OP_CODE_DELETION = 'DELETE';
const OP_CODE_WRITING = 'WRITING';

export async function type(
    node: any,
    speed: number,
    deletionSpeed: number,
    omitDeletionAnimation: boolean,
    ...args: any
) {
    for (const arg of args) {
        switch (typeof arg) {
            case 'string':
                await edit(node, arg, speed, deletionSpeed, omitDeletionAnimation);
                break;
            case 'number':
                await wait(arg);
                break;
            case 'function':
                await arg(node, speed, deletionSpeed, omitDeletionAnimation, ...args); // рекурсия, когда передаются аргументы в typeloop
                break;
            default:
                await arg;
        }
    }
}

async function edit(node: any, text: any, speed: number, deletionSpeed: number, omitDeletionAnimation: boolean) {
    const overlap = getOverlap(node.textContent, text);
    await perform(
        node,
        [...deleter(node.textContent, overlap), ...writer(text, overlap)],
        speed,
        deletionSpeed,
        omitDeletionAnimation
    );
}

async function wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function perform(node: any, edits: any, speed: number, deletionSpeed: number, omitDeletionAnimation: boolean) {
    let filteredEdits = edits;
    if (omitDeletionAnimation) {
        let slicePoint = 0;
        // Ищем конечное состояние строки - пустая или нет
        for (let i = 1; i < edits.length; i++) {
            const [prev, curr] = [edits[i - 1], edits[i]];
            if (curr.length > prev.length || curr === '') {
                slicePoint = i;
                break;
            }
        }
        filteredEdits = edits.slice(slicePoint, edits.length); // нарезаем строку на части для анимашки
    }
    for (const op of editor(filteredEdits)) {
        const waitingTime =
            op.opCode(node) === OP_CODE_WRITING
                ? speed + speed * (Math.random() - 0.5)
                : deletionSpeed + deletionSpeed * (Math.random() - 0.5);
        op.op(node);
        await wait(waitingTime);
    }
}
// познал генераторы
function* editor(edits: any) {
    for (const edit of edits) {
        yield {
            op: (node: any) => requestAnimationFrame(() => (node.textContent = edit)),

            opCode: (node: any) => {
                return edit === '' || node.textContent.length > edit.length ? OP_CODE_DELETION : OP_CODE_WRITING;
            },
        };
    }
}

function* writer([...text], startIndex = 0, endIndex = text.length) {
    while (startIndex < endIndex) {
        yield text.slice(0, ++startIndex).join('');
    }
}

function* deleter([...text], startIndex = 0, endIndex = text.length) {
    while (endIndex > startIndex) {
        yield text.slice(0, --endIndex).join('');
    }
}

function getOverlap(start: any, [...end]) {
    return [...start, NaN].findIndex((char, i) => end[i] !== char);
}
