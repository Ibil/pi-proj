
async function logOut() {
    /**
     * E.g. DELETE http://localhost:3000/api/group/rtyu5675353tgf
     */
    try {

        const url = document.location.href.split("/app")[0] + '/app/logout';
        const resp = await fetch(url, { method: 'DELETE' })
        if (resp.status != 200) {
            const msg = await resp.text()
            alertPanel('ERROR ' + resp.status + ': ' + resp.statusText, msg)
            return
        }
        const redirect = document.location.href.split("/app")[0] + "/app";
        document.location.href = redirect;

    } catch (err) {
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