
window.addEventListener('load', (event) => { 
    getProduct();
})

// get one specific produt 
function getProduct(){ 
    // get product id from url
    // let params = getURLParams(window.location.href);
    let id = getURLParam(window.location.href, 'id');

    fetch(`${apiBaseUrl}/${id}`, initFetch('GET')) // get product infos
        .then(res => res.json()) // json formatted
        .then(res => {
            document.title = res.name   
            initProductPage(res) //add product infos to html
        })

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
    let productInfos = getProductInfos();
    Object.entries(validateProduct(productInfos)).forEach(([key, value]) => { 
        value ? addToCart(productInfos) : getMessageError(key);
    })
}

// adding a product to cart
function addToCart(productInfos){

    if (document.getElementById('divError')){ 
        let elError = document.getElementById('divError');
        elError.parentNode.removeChild(elError);
    }
    if (document.getElementById('divValid')){ 
        let elValid = document.getElementById('divValid');
        elValid.parentNode.removeChild(elValid);
    }

    let guid = productInfos.id + '_' + productInfos.color;
    let cartTmp = localStorage['cart'] ? JSON.parse(localStorage['cart']) : {};

    if (cartTmp[guid]){
        let productParsed = getProductJsonObject(guid);
        productParsed.quantity += productInfos.quantity;
        getMessageValid(productInfos);
        return setProductJsonObject(guid, productParsed);
    }
    cartTmp[guid] = JSON.stringify(productInfos);
    getMessageValid(productInfos);
    return localStorage.setItem('cart', JSON.stringify(cartTmp));
}

// validation for adding to the cart
function validateProduct({id, quantity, color}){
    return quantity ? quantity && color ? { valid: true } : { color: false } : { quantity : false };
}

// return a message error if submitting failed
 function getMessageError(error){ 
    if (document.getElementById('divError')){ 
        let elError = document.getElementById('divError');
        elError.parentNode.removeChild(elError);
    }
    if (document.getElementById('divValid')){ 
        let elValid = document.getElementById('divValid');
        elValid.parentNode.removeChild(elValid);
    }

    let section = document.getElementsByClassName('item__content')[0];
    let divError = document.createElement('div');
    divError.setAttribute('id', 'divError');

    divError.style = "background: red";
    divError.innerHTML = 'Error... Please enter a valid ' + error + '.';
    section.appendChild(divError)
}

// return a message error if submitting failed
function getMessageValid(productInfos){
    if (document.getElementById('divError')){ 
        let elError = document.getElementById('divError');
        elError.parentNode.removeChild(elError);
    }
    if (document.getElementById('divValid')){ 
        let elValid = document.getElementById('divValid');
        elValid.parentNode.removeChild(elValid);
    }

    let section = document.getElementsByClassName('item__content')[0];
    let divValid = document.createElement('div'); 
    divValid.setAttribute('id', 'divValid');

    divValid.style = "background: green";
    divValid.innerHTML = 'Product added! '+productInfos.quantity + ' items - color : '+productInfos.color;
    section.appendChild(divValid); 
}

// get the product infos to add to cart
function getProductInfos(){
    let quantityValue = parseInt(document.getElementById('quantity').value);
    return { 
        id: document.getElementById('itemId').getAttribute('itemId'), 
        quantity: quantityValue > 0 && quantityValue <= 100 && quantityValue % 1 == 0 ? parseInt(document.getElementById('quantity').value) : null, 
        color: document.getElementById('colors').options.selectedIndex > 0 ? document.getElementById('colors').value : null,
    }
}
