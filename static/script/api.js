fetch('https://gamerpower.p.rapidapi.com/api/filter?platform=epic-games-store.steam.android&type=game.loot&sort-by=popularity', {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'f09b37802cmsh0182708bf84dc2cp1404e4jsn18a18d2f1e8b',
        'X-RapidAPI-Host': 'gamerpower.p.rapidapi.com'
    }
})
    .then((response) => response.json())
    // got some help from ChatGPT in this part
    .then((data) => {
        const gameImages = data.map((game) => game.thumbnail)
        const gameList = document.getElementById('game-list')

        gameImages.forEach((image) => {
            const imgElement = document.createElement('img')
            imgElement.src = image
            gameList.appendChild(imgElement)
        })
    })
    .catch((err) => {
        console.log(err)
    })
