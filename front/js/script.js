const apiBaseUrl = "http://localhost:3000/api/products"; 

// init fetch object
const myheaders = new Headers(); 
// @param verb: string http method 
function initFetch(verb){
    return {
        method: verb,
        headers: myheaders, 
        mode: 'cors',
        cache: 'default'
    }
}

// get all products from api
function getAllProducts(){
   fetch(`${apiBaseUrl}`, initFetch('GET'))
    .then(res => res.json()) 
    .then(res => {
        let elt = document.getElementById('items'); 
        res.map(e => { 
            return elt.innerHTML +=  `<a href='./product.html?id=${e._id}'><article id='${e._id}'><img src='${e.imageUrl}' alt='${e.altTxt}'><h3 class='productName'>${e.name}</h3><p class='productDescription'>${e.description}</p></article></a>`
        })
    }) 
}

// get one specific produt 
function getProduct(){ 
    console.log(window.location.href);
    let id = window.location.href.split('?id=')[1];
    console.log(id);
    fetch(`${apiBaseUrl}/${id}`, initFetch('GET'))
    .then(res => res.json()) 
    .then(res => {
        console.log(res)
        document.getElementById('itemImg').innerHTML = `<img src="${res.imageUrl}" alt="${res.altTxt}">`
        document.getElementById('title').innerHTML = res.name
        document.getElementById('price').innerHTML = res.price
        document.getElementById('description').innerHTML = res.description
        document.getElementById('colors').innerHTML = res.colors.map(color => 
           `<option>${color}</option>`
        )
    })
}