
// get entire products infos in the cart
// call onload cart page
function getCart(){ 
    let cart = JSON.parse(localStorage.getItem('cart')); // get the cart and parse it
    Object.entries(cart).map(([key, value]) => {  // foreach key in cart (product) we create html article 
        return initCartProduct(key, value); 
    })

    console.log(Object.keys(getLocalStorageJsonObject()).length)

    if (Object.keys(getLocalStorageJsonObject()).length === 0){ 
        toggleCartVisibility('none');
    }
    else{ 
        toggleCartVisibility('block');
    }

    // add event listener on submit click
    document.getElementById("order-form").addEventListener("submit", async function(event) {
        event.preventDefault();
        checkFormValues();
    //     fetch(`${apiBaseUrl}/order`,  { method: "POST", body: JSON.stringify({ 
    //         contact : {
    //             firstName:  document.getElementById('firstName').value,
    //             lastName:  document.getElementById('lastName').value,
    //             address:  document.getElementById('address').value,
    //             city:  document.getElementById('city').value,
    //             email:  document.getElementById('email').value,
    //         }, 
    //         products: Object.entries(getLocalStorageJsonObject()).map(([key, value]) => { 
    //            return JSON.parse(value).id;
    //         })
    //     }),            headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'
    //     },
    //   }) 
    // .then(res => { 
    //     if (res.status === 201){ 
    //         return res.json();
    //     }
    //     else return 500
    // }) // json formatted
    // .then(res => {
    //     if (res != 500){ 
    //         return window.location.replace(`/confirmation.html?orderId=${res.orderId}`);
    //     }
    // }) 
      });
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
        // changeValueOnItem(productId, 'remove');
        removeProduct(productId);
    })
    document.getElementById('changeValue-'+productId).addEventListener('input', function(evt) { // once the button is created add event listener for delete click
        let previousValue =  getProductJsonObject(productId).quantity;
        this.value > previousValue ? changeValueOnItem(productId, 'add') : changeValueOnItem(productId, 'remove');
    })
}

// init the article html for a product in cart page
function getProductHtml(productId, values, product){
   return  `<div class="cart__item__img">
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
                        <input type="number" id="changeValue-${productId}" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${values.quantity}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                        <p class="deleteItem" id="delete-${productId}">Supprimer</p>
                    </div>
                </div>
            </div>`
}

// return product data for a given id
async function getPlainProduct(productId){
    let p = await fetch(`${apiBaseUrl}/${productId}`, initFetch('GET')) // get product infos
    .then(res => res.json()) // json formatted
    return p;
}

// input on cart page, on value change -> add one quantity
function changeValueOnItem(cartProductId, verb){ 
    let product = getProductJsonObject(cartProductId); // get the product as an object
    switch (verb){
        case 'remove': 
            product.quantity -= 1;
            product.quantity === 0 ? removeProduct(cartProductId) : replaceProduct(cartProductId, product);
        break;
        case 'add': 
            product.quantity += 1;
            replaceProduct(cartProductId, product);
        break;
    }
    displayTotalsForProducts() // recalculate the total 
}  

// replace the product Quantity in HTML by the current localStorage quantity
//  recalculate price
function replaceProductHTML(productId, cartProductId){ 
    document.getElementById(cartProductId).getElementsByClassName('itemQuantity')[0].value = getProductJsonObject(cartProductId).quantity;
    getPlainProduct(productId).then(res => { 
        document.getElementById(cartProductId).getElementsByClassName('cart__item__content__description')[0].getElementsByTagName('p')[1].innerHTML = getProductJsonObject(cartProductId).quantity * res.price
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

 //  call on change in quantity 
 function replaceProduct(cartProductId, product){ 
    setProductJsonObject(cartProductId, product); // set the new quantity in localStorage
    replaceProductHTML(product.id, cartProductId); // set the new quantity in the HTML
    console.log(getLocalStorageJsonObject());
}

// remove a product 
function removeProduct(id){ 
    let localStorageTmp = getLocalStorageJsonObject(); 
    delete localStorageTmp[id]; // delete the entry in ther local storage with corresponding id
    localStorage.setItem('cart', JSON.stringify(localStorageTmp)); // reset the local storage minus product
    removeProductFromHTML(id); // delete product from HTML
    getTotalsForProducts();
    displayTotalsForProducts();
    if (Object.keys(getLocalStorageJsonObject()).length === 0){ 
        toggleCartVisibility('none');
    }
    else{ 
        toggleCartVisibility('block');
    }
}

// remove a product from the HTML
function removeProductFromHTML(id){ 
    document.getElementById(id).style = 'display : none';
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

//  hide the form if cart is empty 
function toggleCartVisibility(verb){ 
    document.getElementById('order-form').style.display = verb;
}   


function checkFormValues(){ 
    let stringRegex = new RegExp(/^[a-zA-Z\s-]*$/); 
    let stringNumberRegex = new RegExp(/^[a-zA-Z\s0-9-,]*$/); 
    let emailRegex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
     
    if (stringRegex.test(document.getElementById('firstName').value) && stringRegex.test(document.getElementById('lastName').value) && stringRegex.test(document.getElementById('city').value)){ 
        console.log('firstname and name ok and city')
    }if(stringNumberRegex.test(document.getElementById('address').value)){ 
        console.log('adress ok')
    }if(emailRegex.test(document.getElementById('email').value)){ 
        console.log('email ok')
    }
    else{ 
        console.log('nok')
    }
}