
getAllProducts();

// get all products from api
function getAllProducts(){
   fetch(`http://localhost:3000/api/products`, { method: 'GET' })
    .then(res => res.json()) 
    .then(res => {
        let elt = document.getElementById('items'); 
        res.forEach(e => { 
            elt.innerHTML += `
                <a href='./product.html?id=${e._id}'>
                    <article id='${e._id}'><img src='${e.imageUrl}' alt='${e.altTxt}'>
                        <h3 class='productName'>${e.name}</h3>
                        <p class='productDescription'>${e.description}</p>
                    </article>
                </a>
                `
        })
    }) 
}