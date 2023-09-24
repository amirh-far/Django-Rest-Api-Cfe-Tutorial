const contentContainer = document.getElementById("content-container")
const loginForm = document.getElementById("login-form")
const baseEndpoint = "http://localhost:8000/api"
if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
}

function handleLogin(event) {
    // console.log(event)
    event.preventDefault()
    const loginEndpoint = `${baseEndpoint}/token/`
    let loginFormData = new FormData(loginForm)
    let loginObjectData = Object.fromEntries(loginFormData)
    let bodyStr = JSON.stringify(loginObjectData)
    // console.log(bodyStr,loginObjectData)
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: bodyStr
    }
    fetch(loginEndpoint, options)// This is called Promise in JS // Just like the py code : requests.post
    .then(response=>{
        console.log(response)
        return response.json()
    })
    .then(authData=>{
        handleAuthData(authData, getProductList)
    }) 
    .catch(err=>{
        console.log(err)
    })

}   

function handleAuthData(authData, callback) {
    localStorage.setItem("access", authData.access) // setItem("key", "value")
    localStorage.setItem("refresh", authData.refresh) // setItem("key", "value")
    if (callback) {
         callback()
    }
    
}

function writeToContent(data) {
    if (contentContainer) {
        contentContainer.innerHTML = "<pre>" + JSON.stringify(data, null, 4) + "</pre>"
    }
}

function getFetchOptions(method, body) {
    return {
        method : method == null ? "GET" : method,
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access")}`
        },
        body : body ? body : null
    }
}

function validateJWTToken() {
    // fetch
    const endpoint = `${baseEndpoint}/token/verify/`
    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            token : localStorage.getItem("access")
        })
    }
    fetch(endpoint, options)
    .then(response=>response.json())
    .then(x =>{
        isTokenNotValid(x)
        console.log(x)
    })
}

function isTokenNotValid(jsonData) {
    if (jsonData && jsonData.code == "token_not_valid") {
        // run a refresh token fetch
        alert("Please login again")
        return false
    }
    return true
}
function getProductList() {
    const endpoint = `${baseEndpoint}/products/`
    const options = getFetchOptions()
    fetch(endpoint, options)
    .then(response=>{
        console.log(response)
        response.json()
    })
    .then(data=>{ 
        const validData = isTokenNotValid(data)
        console.log(data)
        if (validData) {
        writeToContent(data)

        }
    })
}

validateJWTToken()