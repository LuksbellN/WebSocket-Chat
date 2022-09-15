const socket = io();
let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chat');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector("#chatTextInput");

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

const renderUserList = () => {
    let ul = document.querySelector('.userList');
    ul.innerHTML = "<li>Online users</li>";
    for(let i of userList) {
        ul.innerHTML += `<li>${i}</li>`
    }
}

const addMessage = (type, user, msg) => {
    let ul = document.querySelector('.chatList');

    switch(type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">'+msg+'</li>'
        break;
        case 'msg':
            if(username == user) {
                ul.innerHTML += '<li class="m-txt"><span class="me">'+user+'</span> '+msg+'</li>'
            } else {
                ul.innerHTML += '<li class="m-txt"><span>'+user+'</span> '+msg+'</li>'
            }
        break;
    }

    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim();
        if(name != '') {
            if(!userList || !userList.includes(name)) {
                console.log(userList)
                username = name;
                document.title = 'Chat('+username+')'
                socket.emit('join-request', username);
            } else {
                alert("Já existe alguém com esse nome na sala!")
            }
        }
    }
})

textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = ""
        if(txt != "") {
            socket.emit('message-req', {
                type: 'msg', 
                user: username,
                msg: txt
            });
            addMessage('msg', username, txt);
        }
    }
})

socket.on('userOk', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';

    addMessage('status', null, 'Conectado!')

    userList = list;
    renderUserList();
});

socket.on('list-update', (data) => {
    if(data.joined) {
        addMessage('status', null, data.joined+' entrou no chat.')
    }
    if(data.left) {
        addMessage('status', null, data.left+' saiu do chat.')
    }
    userList = data.list;
    renderUserList();
});

socket.on('message', (data) => {
    console.log(data)
    addMessage(data.type, data.user, data.msg);
});

socket.on('disconnect', () => {
    addMessage('status', null, "Você foi desconectado");
    userList = [];
    renderUserList();
});

socket.on('connect_error', () => {
    addMessage('status', null, "Tentando reconectar...");
});

socket.io.on('reconnect', () => {
    addMessage('status', null, 'Reconectado')
    if(username != ''){
      socket.emit('join-request', username)
    }
  })