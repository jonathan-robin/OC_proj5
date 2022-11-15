// get one specific produt 
function getProduct(){ 
    // get product id from url
    // let params = getURLParams(window.location.href);
    let id = getURLParam(window.location.href, 'id');
    
    fetch(`${apiBaseUrl}/${id}`, initFetch('GET')) // get product infos
        .then(res => res.json()) // json formatted
        .then(res =>  initProductPage(res)) //add product infos to html
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

// Add product to cart onclick on add to cart
function submitToCart(){ 
    let productInfos = getProductInfos()
    Object.entries(validateProduct(productInfos)).forEach(([key, value]) => { 
        value ? addToCart(productInfos) : getMessageError(key);
    })
}

// adding a product to cart
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

    document.getElementsByClassName('modal__success-wrapper')[0].style.display  = "block";
    document.getElementsByClassName('modal__success-content')[0].innerHTML = "Product added !"

    return localStorage.setItem('cart', JSON.stringify(cartTmp))


}

// validation for adding to the cart
function validateProduct({id, quantity, color}){
    return quantity ? quantity && color ? { valid: true } : { color: false } : { quantity : false };
}

// return a message error if submitting failed
 function getMessageError(error){ 
    document.getElementsByClassName('modal__success-wrapper')[0].style.display = "none"; 
    document.getElementsByClassName('modal__error-wrapper')[0].style.display = "block"; 
    document.getElementsByClassName('modal__error-text')[0].innerHTML = 'Error... Please enter a valid ' + error + '.';
}
