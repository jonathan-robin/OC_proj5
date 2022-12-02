
// get the confirmation orderId from url
function getConfirmation(){ 
    let orderId = new URLSearchParams(window.location.href.split('?')[1]).get('orderId');
    document.getElementById('orderId').innerHTML =  orderId;
    return localStorage.clear();
}