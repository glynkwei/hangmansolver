// @flow
export type Letter =
    'a'
    | 'b'
    | 'c'
    | 'd'
    | 'e'
    | 'f'
    | 'g'
    | 'h'
    | 'i'
    | 'j'
    | 'k'
    | 'l'
    | 'm'
    | 'n'
    | 'o'
    | 'p'
    | 'q'
    | 'r'
    | 's'
    | 't'
    | 'u'
    | 'v'
    | 'w'
    | 'x'
    | 'y'
    | 'z'
    | '_';
export type Hint = Array<Letter>;

const intersection = (setA: Set<mixed>, setB: Set<mixed>): Set<mixed> => new Set(
    [...setA].filter(x => setB.has(x)));

const getKey = (letter, indexList, length) => JSON.stringify([letter,...indexList, length]);

const createCharMap = (word : string | Hint) => {
    const charMap = new Map();
    if (typeof word === 'string') {
        for (let i = 0; i < word.length; i++) {
            const letter = word.charAt(i).toLowerCase();
            const indexList = charMap.get(letter) || [];
            indexList.push(i);
            charMap.set(letter, indexList);
        }
    }
    else {
        word.forEach((letter, index) => {
            if (letter !== '_')
            {
                const indexList = charMap.get(letter) || [];
                indexList.push(index);
                charMap.set(letter, indexList);
            }
        });
    }
    return charMap;
};

// Asynchronously process 10,000 words at a time
const BATCH_SIZE = 1000;

export class Dictionary {
    wordMap: Map<string, Map<string, Set<Letter>>>;

    constructor(words?: Array<string>, onProgress: number => void) {
        this.wordMap = new Map();
        if (words !== undefined) {
            this.add(words, onProgress);
        }
    }

    add = (words: Array<string>, onProgress: number => void, prevState: {index: number, progress: number} = {}) => {
        let {progress = 0, index = 0} = prevState;
        let i = index;
        for (let k = 0; i < words.length && k < BATCH_SIZE; i++, k++) {
            if (i >= Math.floor(progress * words.length / 100) - 1)
            {
                progress += Math.min(1, Math.ceil(100 / words.length));
                if (onProgress)
                {
                    onProgress(progress);
                }
            }
            const word = words[i];
            const charMap = createCharMap(word);
            [...charMap.entries()].forEach((entry) => {
               const key = getKey(entry[0], entry[1], word.length);
                const wordSet = this.wordMap.get(key) || new Map();
                wordSet.set(word, new Set(charMap.keys()));
                this.wordMap.set(key, wordSet);
            });
        }
        if (i !== words.length) {
            setTimeout(() => this.add(words,onProgress, {index: i, progress}));
        }
    };

    processData = (words: Array<string>, index: number, onProgress: number => void) => {
        let progress = 0;
        for (let i = index; i < words.length; i++) {
            if (i >= Math.floor(progress * words.length / 100) - 1)
            {
                progress += Math.min(1, Math.ceil(100 / words.length));
            }
            const word = words[i];
            const charMap = createCharMap(word);
            [...charMap.entries()].forEach((entry) => {
                const key = getKey(entry[0], entry[1], word.length);
                const wordSet = this.wordMap.get(key) || new Map();
                wordSet.set(word, new Set(charMap.keys()));
                this.wordMap.set(key, wordSet);
            });
        }
    };

    search = (hint: Hint, duds: Set<Letter> = new Set()) => {
        if (hint.length === 0) {
            return [];
        }
        const charMap = createCharMap(hint);
        const wordSets = [...charMap.entries()].map(entry => {
            const key = getKey(entry[0], entry[1], hint.length);
            const wordSet = this.wordMap.get(key) || new Map();
            return new Set([...wordSet.entries()].filter(wordEntry => {
               return wordEntry[0] !== '_' && intersection(duds, wordEntry[1]).size === 0;
            }).map(wordEntry => wordEntry[0]));
        });
        if (wordSets.length !== 0)
        {
        return [...wordSets.reduce(intersection)];
        }
        return [];
    };
}

export const parseStringAsHint = (str : string) => {
    const hint = new Array(str.length).fill('');
    for (let i = 0; i < str.length; i++) {
        hint[i] = str.charAt(i).toLowerCase();
    }
    return hint;
};

