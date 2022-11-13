
function getConfirmation(){ 
    let orderId = getURLParam(window.location.href, 'orderId');
    console.log(orderId);
    document.getElementById('orderId').innerHTML =  orderId;

}