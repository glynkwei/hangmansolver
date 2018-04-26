FileSystem = require('fs');

FileSystem.readFile('scripts/words.txt', 'utf8', (err,data) => {
    if (!err) {
        FileSystem.writeFile('data/words.json', JSON.stringify({data: data.split('\r\n')}));
        console.log('Success');
    }
    else {
        console.log(err);
        console.log('Failure');
    }
});