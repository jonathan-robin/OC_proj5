// const { getOneProduct } = require("../../back/controllers/product");

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
    // get product id from url
    // let params = getURLParams(window.location.href);
    let id = getURLParam(window.location.href, 'id');
    
    fetch(`${apiBaseUrl}/${id}`, initFetch('GET')) // get product infos
    .then(res => res.json()) // json formatted
    .then(res =>  initProductPage(res)) //add product infos to html
}

async function getPlainProduct(productId){
    let p = await fetch(`${apiBaseUrl}/${productId}`, initFetch('GET')) // get product infos
    .then(res => res.json()) // json formatted
    return p;
}

const fetchPromise = (productId) => fetch(`${apiBaseUrl}/${productId}`, initFetch('GET')) // get product infos;

// get entire products infos in the cart
// call onload cart page
function getCart(){ 
    let cart = JSON.parse(localStorage.getItem('cart')); // get the cart and parse it
    Object.entries(cart).map(([key, value]) => {  // foreach key in cart (product) we create html article 
        return initCartProduct(key, value); 
    })
}

// call onclick on button, delete one item in local storage with itemId
function deleteItem(cartProductId){ 
    let product = getProductJsonObject(cartProductId); // get the product as an object
    product.quantity -= 1; // minus 1 quantity of it
    product.quantity === 0 ? removeProduct(cartProductId) : replaceProduct(cartProductId, product);
    displayTotalsForProducts() // recalculate the total 
}   

//  call on change in quantity 
function replaceProduct(cartProductId, product){ 
    setProductJsonObject(cartProductId, product); // set the new quantity in localStorage
    replaceProductHTML(product.id, cartProductId); // set the new quantity in the HTML
}

function addToCart(productInfos){
    document.getElementsByClassName('modal__error-wrapper')[0].style.display = "none"; 

    let guid = productInfos.id + '_' + productInfos.color;
    let cartTmp = localStorage['cart'] ? JSON.parse(localStorage['cart']) : {};

    if (cartTmp[guid]){
        let productParsed = getProductJsonObject(guid);
        productParsed.quantity += productInfos.quantity;
        return setProductJsonObject(guid, productParsed);
    }

    cartTmp[guid] = JSON.stringify(productInfos);
    return localStorage.setItem('cart', JSON.stringify(cartTmp))
}

// remove a product 
function removeProduct(id){ 
    let localStorageTmp = getLocalStorageJsonObject(); 
    delete localStorageTmp[id]; // delete the entry in ther local storage with corresponding id
    localStorage.setItem('cart', JSON.stringify(localStorageTmp)); // reset the local storage minus product
    removeProductFromHTML(id); // delete product from HTML
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

// replace the product Quantity in HTML by the current localStorage quantity
//  recalculate price
function replaceProductHTML(productId, cartProductId){ 
    document.getElementById(cartProductId).getElementsByClassName('itemQuantity')[0].value = getProductJsonObject(cartProductId).quantity;
    getPlainProduct(productId).then(res => { 
        document.getElementById(cartProductId).getElementsByClassName('cart__item__content__description')[0].getElementsByTagName('p')[1].innerHTML = getProductJsonObject(cartProductId).quantity * res.price
    })
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

// init productPage with product infos
// @param product: json object api with value for given object
function initProductPage(product){
    document.getElementById('itemId').setAttribute( 'itemId', product._id);
    document.getElementById('itemImg').innerHTML = `<img src="${product.imageUrl}" alt="${product.altTxt}">`
    document.getElementById('title').innerHTML = product.name
    document.getElementById('price').innerHTML = product.price
    document.getElementById('description').innerHTML = product.description
    document.getElementById('colors').innerHTML +=  product.colors.map((color, index) => `<option id=${index + 1}>${color}</option>`)
}

// get plain data for product with backend and render HTML in cart page
async function initCartProduct(productId, values){ 
    let cartInfos = JSON.parse(values);

    // create html node to append to section
    let section = document.getElementById('cart__items'); 
    let article = document.createElement('article'); 

    // set attributes for article
    article.setAttribute('class', 'cart__item');
    article.setAttribute('id', productId);
    article.setAttribute('data-color', values.color)

    //get the plain string html to append to article
    let html = await getPlainProduct(cartInfos.id)
    .then(res => getProductHtml(productId, cartInfos, res));

    article.innerHTML = html
    section.appendChild(article)

    displayTotalsForProducts();

    document.getElementById('delete-'+productId).addEventListener('click', () => { // once the button is created add event listener for delete click
        deleteItem(productId)
    })
}

// init the article html for a product in cart page
function getProductHtml(productId, values, product){
   return `<div class="cart__item__img">
                <img src="${product.imageUrl}" id="product-image" alt="${product.altTxt}">
            </div>
            <div class="cart__item__content">
                <div class="cart__item__content__description">
                    <h2>${product.name}</h2>
                    <p>${values.color}</p>
                    <p>${product.price * values.quantity}€</p>
                </div>
                <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                        <p>Qté : </p>
                        <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${values.quantity}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                        <p class="deleteItem" id="delete-${productId}">Supprimer</p>
                    </div>
                </div>
            </div>`
}

// Add product to cart onclick on add to cart
function submitToCart(){ 
    console.log("Checking submitting order...")
    let productInfos = getProductInfos()
    Object.entries(validateProduct(productInfos)).forEach(([key, value]) => { 
        value ? addToCart(productInfos) : getMessageError(key);
    })
}

// call each time we need to recalculate the total amount and the total articles in cart
async function displayTotalsForProducts(){ 
    //  await the total for the products to calculate
    await getTotalsForProducts().then(res => { // set the value in the HTML
        document.getElementById('totalQuantity').innerHTML = res.totalProduct; 
        document.getElementById('totalPrice').innerHTML = res.totalPrice;
    })
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

function getTotalPrice(){ 
    // let total = 0; 
    // Object.entries(getLocal)
}

// get the product infos to add to cart
function getProductInfos(){
    return { 
        id: document.getElementById('itemId').getAttribute('itemId'), 
        quantity: document.getElementById('quantity').value > 0 ? parseInt(document.getElementById('quantity').value) : null, 
        color: document.getElementById('colors').options.selectedIndex > 0 ? document.getElementById('colors').value : null,
    }
}

// validation for adding to the cart
function validateProduct({id, quantity, color}){
    return quantity ? quantity && color ? { valid: true } : { color: false } : { quantity : false };
}

// return a message error if submitting failed
function getMessageError(error){ 
    document.getElementsByClassName('modal__error-wrapper')[0].style.display = "block"; 
    document.getElementsByClassName('modal__error-text')[0].innerHTML = 'Error... Please enter a valid ' + error + '.';
}