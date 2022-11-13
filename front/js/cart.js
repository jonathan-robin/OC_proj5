
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
        changeValueOnItem(productId, 'remove');
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

async function getPlainProduct(productId){
    let p = await fetch(`${apiBaseUrl}/${productId}`, initFetch('GET')) // get product infos
    .then(res => res.json()) // json formatted
    return p;
}

// get entire products infos in the cart
// call onload cart page
function getCart(){ 
    let cart = JSON.parse(localStorage.getItem('cart')); // get the cart and parse it
    Object.entries(cart).map(([key, value]) => {  // foreach key in cart (product) we create html article 
        return initCartProduct(key, value); 
    })

    // add event listener on submit click
    document.getElementById("order-form").addEventListener("submit", async function(event) {
        event.preventDefault();
        fetch(`${apiBaseUrl}/order`,  { method: "POST", body: JSON.stringify({ 
            contact : {
                firstName:  document.getElementById('firstName').value,
                lastName:  document.getElementById('lastName').value,
                address:  document.getElementById('address').value,
                city:  document.getElementById('city').value,
                email:  document.getElementById('email').value,
            }, 
            products: Object.entries(getLocalStorageJsonObject()).map(([key, value]) => { 
               return JSON.parse(value).id;
            })
        }),            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
      }) 
    .then(res => { 
        if (res.status === 201){ 
            return res.json();
        }
        else return 500
    }) // json formatted
    .then(res => {
        if (res != 500){ 
            return  window.location.replace(`file:///D:/save/part_time_job/OPEN_CLASSROOMS/projets/p5/P5-Dev-Web-Kanap/front/html/confirmation.html?orderId=${res.orderId}`);
        }
    }) 
      });
}


// input on cart page, on value change -> add one quantity
function changeValueOnItem(cartProductId, verb){ 
    let product = getProductJsonObject(cartProductId); // get the product as an object
    console.log(product);
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
