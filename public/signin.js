window.onload = setup

function setup() {
    const inUsername = document.getElementById('inUsername')
    const inPassword = document.getElementById('inPassword')
    document
        .querySelector('#btSignin')
        .addEventListener('click', () => handlerSignin(inUsername, inPassword))
    document
        .querySelector('#btSignup')
        .addEventListener('click', () => handlerSignup(inUsername, inPassword))
}

async function handlerSignin(inUsername, inPassword) {
    try {
        const username = inUsername.value
        const password = await digest(inPassword.value)
        const path = '/user/signin/' + username
        const resp = await fetch(path, {
            method: 'PUT',
            body: JSON.stringify({ password }),
            headers: { 'Content-Type': 'application/json' }
        })
        if (resp.status != 200) {
            const msg = await resp.text()
            alertPanel(resp.status + ' ' + resp.statusText, msg)
            return
        }
        document.location.href = document.location.href.replace("signin", "groups");
    } catch (err) {
        alertPanel('ERROR', err)
    }
}

async function handlerSignup(inUsername, inPassword) {
    try{
        const username = inUsername.value
        const password = await digest(inPassword.value)
        const path = '/users/' + username
        const resp = await fetch(path, { 
            method: 'PUT',
            body: JSON.stringify({ password }),
            headers: { 'Content-Type': 'application/json'}
        })
        if(resp.status != 200) {
            const msg = await resp.text()
            alertPanel(resp.status + ' ' + resp.statusText, msg)
            return
        }        
        document.location.href = document.location.href.replace("signin", "groups");
    } catch(err) {
        alertPanel('ERROR', err)
    }
}


function alertPanel(title, message, kind = 'danger') {
    const html = `<div class="alert alert-${kind} alert-dismissible fade show" role="alert">
                    <strong>${title}</strong>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>`
    document
        .getElementById('alertPanel')
        .innerHTML = html
}

async function digest(message) {
    const msgUint8 = new TextEncoder().encode(message)                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer))                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
    return hashHex
}