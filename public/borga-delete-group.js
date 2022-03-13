window.onload = setup 

function setup() {
    document
        .querySelectorAll('.deleteGroup')
        .forEach(elem => elem.addEventListener('click', () => deleteGroupHandler(elem)))
}

/**
 * @param {Element} btDelete 
 */
async function deleteGroupHandler(btDelete) {
    /**
     * E.g. DELETE http://localhost:3000/api/group/rtyu5675353tgf
     */
    try {
        const myHeaders = new Headers({
            "Authorization": `Bearer ${btDelete.dataset.token}`
        })
  
        const url = document.location.href.replace('/app/groups', '/group/') + btDelete.dataset.groupId
        const resp = await fetch(url, { method: 'DELETE',  headers: myHeaders})
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