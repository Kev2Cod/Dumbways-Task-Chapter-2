function submitData(){
    // event.preventDefault()
    
    let name = document.getElementById('input-name').value
    let email = document.getElementById('input-email').value
    let phone = document.getElementById('input-phone').value
    let subject = document.getElementById('input-subject').value
    let message = document.getElementById('input-description').value

    if (name == '') {
        return alert("Nama Wajib Diisi!")
    } else if (email == '') {
        return alert("Email Wajib Diisi!")
    } else if (phone == '') {
        return alert("Phone Wajib Diisi!")
    } else if (subject == '') {
        return alert("Subject Wajib Diisi!")
    } else if (message == '') {
        return alert("Message Wajib Diisi!")
    }

    let emailReceiver = "Kevin.dev@gmail.com";
    let a = document.createElement('a')
    a.href = `mailto: ${emailReceiver}?subject=${subject} &body=Hello my name ${name}, ${subject}, Call me in my number please : ${phone}`

    a.click();

}