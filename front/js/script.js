let apiBaseUrl = "http://localhost:3000/api/products";

// init fetch object
const myheaders = new Headers(); 
// @param verb: string http method 
function initFetch(verb, body = null){
    let prop = {
        method: verb,
        headers: myheaders, 
        mode: 'cors',
        cache: 'default', 
    }
    body ? prop.body = body : null; 
    return prop;
}

// get all products from api
function getAllProducts(){
   fetch(`${apiBaseUrl}`, initFetch('GET'))
    .then(res => res.json()) 
    .then(res => {
        let elt = document.getElementById('items'); 
        res.map(e => { 
            return elt.innerHTML += `<a href='./product.html?id=${e._id}'><article id='${e._id}'><img src='${e.imageUrl}' alt='${e.altTxt}'><h3 class='productName'>${e.name}</h3><p class='productDescription'>${e.description}</p></article></a>`
        })
    }) 
}

//  call on change in quantity 
function replaceProduct(cartProductId, product){ 
    setProductJsonObject(cartProductId, product); // set the new quantity in localStorage
    replaceProductHTML(product.id, cartProductId); // set the new quantity in the HTML
}

// remove a product 
function removeProduct(id){ 
    let localStorageTmp = getLocalStorageJsonObject(); 
    delete localStorageTmp[id]; // delete the entry in ther local storage with corresponding id
    localStorage.setItem('cart', JSON.stringify(localStorageTmp)); // reset the local storage minus product
    removeProductFromHTML(id); // delete product from HTML
    getTotalsForProducts();
    displayTotalsForProducts();
}

// remove a product from the HTML
function removeProductFromHTML(id){ 
    document.getElementById(id).style = 'display : none';
}

// get localstorage JSON Object
function getLocalStorageJsonObject(){ 
    return JSON.parse(localStorage.getItem('cart'));
}

// get product JSON object
function getProductJsonObject(id){ 
    return JSON.parse(getLocalStorageJsonObject()[id]);
}

// set localStorage with changed product item
function setProductJsonObject(id, product){
    let parsedCart = getLocalStorageJsonObject();
    parsedCart[id] = JSON.stringify(product); 
    return localStorage.setItem('cart', JSON.stringify(parsedCart));
}

// get a specific param of a url
// @param url: the full url page
// @param verb: the param we need to extract from the url 
function getURLParam(url, param){
    let params = url.split('?')[1]; // split url to keep only params
    return new URLSearchParams(params).get(param);
}

// return object with all params of a url
// @param url: the full url page
function getURLParams(url){
    params = url.split('?')[1] // keep the params part of the url
    let paramsObj = {};
    // map all the params and push to object array { [key]:[value] }
    params.split('?').map(paramValue => {
        Object.assign(paramsObj, { [paramValue.split('=')[0]] : paramValue.split('=')[1] })
    })
    return paramsObj;
}


// call on first cart load and each time a product is added or remove
async function getTotalsForProducts(){
    let totalProduct = 0; 
    let totalPrice = 0;

    let promises = Object.entries(getLocalStorageJsonObject()).map(async([key, v]) => { // map over all the product in cart
        let obj = await (getPlainProduct(key.split('_')[0]).then(res => res)); // get datas for each product 
        return Object.defineProperty((obj), 'quantity', { value: JSON.parse(v).quantity }); // add to the temporary object the quantity we have in cart for this object
    })

    await Promise.all(promises).then(values => { // wait for all the promises to resolve
        values.map(value => { // map over them
            totalProduct += parseInt(value.quantity); // add their own quantity to the total
            totalPrice += parseInt(value.quantity) * parseInt(value.price); // calculate the total amount
        })
    });

    return {totalProduct, totalPrice}; 
 }

// get the product infos to add to cart
function getProductInfos(){
    return { 
        id: document.getElementById('itemId').getAttribute('itemId'), 
        quantity: document.getElementById('quantity').value > 0 ? parseInt(document.getElementById('quantity').value) : null, 
        color: document.getElementById('colors').options.selectedIndex > 0 ? document.getElementById('colors').value : null,
    }
}



