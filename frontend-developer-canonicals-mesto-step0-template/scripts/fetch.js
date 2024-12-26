async function fetchServ(url, method, headers, body = null)
{
    return await fetch(url, {
        method: method,
        headers: headers,
        body: body
    }).then(res => res.json())
}

export default fetchServ