FileSystem = require('fs');

FileSystem.readFile('scripts/shortwords.txt', 'utf8', (err,data) => {
    if (!err) {
        FileSystem.writeFile('data/commonwords.json', JSON.stringify({data: data.split('\r\n')}));
        console.log('Success');
    }
    else {
        console.log(err);
        console.log('Failure');
    }
});