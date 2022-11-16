// Utils reuse functions throughout the app

let apiBaseUrl = "http://localhost:3000/api/products";

// init fetch object
const myheaders = new Headers(); 
// @param verb: string http method 
function initFetch(verb){
    let prop = {
        method: verb,
        headers: myheaders, 
        mode: 'cors',
        cache: 'default', 
    }
    // body ? prop.body = body : null; 
    return prop;
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
