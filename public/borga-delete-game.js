window.onload = setup 

function setup() {
    document
        .querySelectorAll('.deleteGame')
        .forEach(elem => elem.addEventListener('click', () => deleteGameHandler(elem)))
}

/**
 * @param {Element} btDelete 
 */
async function deleteGameHandler(btDelete) {
    try {
        const myHeaders = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${btDelete.dataset.token}`
        })
        const myBody = {
            "groupId": btDelete.dataset.groupId,
            "gameId": btDelete.dataset.gameId
        }
  
        const url = document.location.href.split("app/group")[0] + 'group/game'
        const resp = await fetch(url, { method: 'DELETE',  headers: myHeaders, body: JSON.stringify(myBody)})
        if(resp.status != 200) {
            const msg = await resp.text()
            alertPanel('ERROR ' + resp.status + ': ' + resp.statusText, msg)
            return
        }
        btDelete
            .parentElement // get the TD element
            .parentElement // get the TR element
            .remove()
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