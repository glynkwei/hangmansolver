FileSystem = require('fs');

const getKey = (letter, indexList, length) => JSON.stringify([letter,...indexList, length]);

const createCharMap = (word) => {
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

class Dictionary {
    constructor(words) {
        this.wordMap = new Map();
        if (words !== undefined) {
            this.add(words);
        }
    }

    add(words) {
        for (let word of words) {
            const charMap = createCharMap(word);
            [...charMap.entries()].forEach((entry) => {
                const key = getKey(entry[0], entry[1], word.length);
                const wordSet = this.wordMap.get(key) || new Map();
                wordSet.set(word, new Set(charMap.keys()));
                this.wordMap.set(key, wordSet);
            });
        }
    };
}





FileSystem.readFile('../data/words.txt', 'utf8', (err,data) => {
    if (!err) {
        const dictionary = new Dictionary(data.split('\n'));
        FileSystem.writeFile('../data/wordMap.json', JSON.stringify({data: [...dictionary.wordMap], toJSON:  function()  {
            'use strict';
            return [...this.entries()].map(entry => [entry[0], JSON.stringify([...entry[1]])]);
        }.bind(dictionary.wordMap)}));
        console.log('Success');
    }
    else {
        console.log(err);
        console.log('Failure');
    }
});