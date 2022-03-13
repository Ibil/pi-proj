
window.onload = setup 

function setup() {
    document
        .querySelectorAll('.editGroup')
        .forEach(elem => elem.addEventListener('click', () => handerEditGroup(elem)))
}

/**
 * @param {Element} btEdit 
 */
async function handerEditGroup(btEdit) {
    try {
        const url = document.location.href.replace('/app', '').split('/group')[0] + '/group'

        const myHeaders = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${btEdit.dataset.token}`
        })

        const myBody = {
            "id": btEdit.dataset.groupId,
            "name": document.getElementById("groupNameInput").value,
            "description": document.getElementById("groupDescInput").value
        }

        const resp = await fetch(url, { method: 'PUT',  headers: myHeaders, body: JSON.stringify(myBody) })
        if(resp.status == 200) {            
            alertPanel('SUCCESS ' , "Group edited successfully", "success")
        }
        else{
            const msg = await resp.text()
            alertPanel('ERROR ' + resp.status + ': ' + resp.statusText, msg)
        }
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