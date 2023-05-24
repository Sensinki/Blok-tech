fetch('https://www.giantbomb.com/api/search/?api_key=ef6c1b8710bcee3c47c46f751934422f2edbe475&format=json&query=%22metroid%20prime%22&resources=game')
.then(res => res.json())
.then(json => { document.getElementById('game').innerText = json.game[0].main })

// https://www.giantbomb.com/forums/api-developers-3017/quick-start-guide-to-using-the-api-1427959/
// https://www.youtube.com/watch?v=cuEtnrL9-H0&ab_channel=WebDevSimplified
