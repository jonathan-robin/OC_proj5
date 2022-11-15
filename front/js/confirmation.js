
// get the confirmation orderId from url
function getConfirmation(){ 
    let orderId = getURLParam(window.location.href, 'orderId');
    document.getElementById('orderId').innerHTML =  orderId;
}