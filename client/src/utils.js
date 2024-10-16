import { createContext } from "react"

const dev = 1
export const HOST = dev? "http://localhost" : "http://localhost"
export const context = createContext({})


export function hostURL(path) {
    if(path[0] == '/')
        path = path.slice(1)
    return HOST + '/' + path
}

export function jsonToFormData(data) {
    const fd = new FormData()

    Object.keys(data).forEach(k => {
        if (Array.isArray(data[k])) {
            data[k].forEach(w => fd.append(k, w))
            return
        }
        else if(typeof data[k] === 'boolean')
            fd.append(k, data[k]? 1 : 0)
        else if(typeof data[k] === null)
            return
        else
            fd.append(k, data[k])
    })

    return fd
}

export function quickFetch(url, params) {
    if (params)
        url = url + '?' + Object.keys(params).filter(k => params[k] !== undefined).map(k => `${k}=${params[k]}`).join('&')

    return fetch(hostURL(url), {credentials:'include'})
    .then(r => r.json())
}

export function quickFetchPostFormData(url, json, fd) {
    fd = fd ?? jsonToFormData(json)

    return fetch(hostURL(url), {
        method: 'POST',
        credentials:'include',
        body: fd
    }).then(r => r.json())
}

export function quickFetchPostJSON(url, body) {
    return fetch(hostURL(url), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials:'include',
        body: JSON.stringify(body)
    }).then(r => r.json())
}


export function combineValidations(v1, v2) {
    v1 ??= {}
    v2 ??= {}

    const validate = {...v1.validate??{}, ...v2.validate??{}}

    return {
        ...v1,
        ...v2,
        validate
    }
}

export function prepareFormResult(r) {
    if (!r)
        return null

    let alert = r.alert ?? {}

    if (r.alertDefaultTitle)
        alert.title = r.muiError? 'Ошибка!' : r.muiSuccess? 'Успех!' : null

    if (r.alertTitle)
        alert.title = r.alertTitle

    if (r.muiError) {
        alert.muiType = 'error'
        alert.text = r.muiError
    }
    else if(r.muiInfo) {
        alert.muiType = 'info'
        alert.text = r.muiInfo
    }
    else if(r.muiSuccess) {
        alert.muiType = 'success'
        alert.text = r.muiSuccess
    }

    return {
        ...r,
        alert
    }
}


export const isFormInvalid = (err) => {
    return Object.keys(err).length > 0
}

export function isIterable(obj) {
    if (obj == null) {
      return false
    }
    return typeof obj[Symbol.iterator] === 'function'
}

export const trimMultilineText = (s) => {
    return s.replace(/^(\n|\ )+|(\n|\ )+$/g, '')
}

export function findInputError(errors, name) {
    const filtered = Object.keys(errors)
        .filter(key => key == name)
        .reduce((cur, key) => {
            cur.error = errors[key]
            return cur
        }, {})
    return filtered
}

export function getFileExtension(file) {
    return file.name.split('.').pop().toLowerCase()
}

export function blobToBase64(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob); 
        reader.onloadend = function() {
            resolve(reader.result)
        }
    })
}

export function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + 'B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
    return bytes.toFixed(dp) + units[u];
}


