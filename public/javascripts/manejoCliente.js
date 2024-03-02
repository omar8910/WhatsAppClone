var fotoPerfil;

function subidaFotoPerfilUsuario(files) {
    fotoPerfil = files[0];
}

var socket = io();

// Setear ID del usuario
socket.on("connect", () => {
    socket.emit("asignarIdUsuario", socket.id);
});

// Cuando se conecta un usuario y se haya subido su foto de perfil al servidor aparecerá como conectado
socket.on("usuariosConectados", usuarios => {
    socket.on("fotoUsuarioSubida", () => {
        $("#usersConnected").html(`Usuarios conectados: ${usuarios}`);
    });
});

// OnChange del input de la foto de usuario
$(document).on("change", "#imageInput", e => {
    subidaFotoPerfilUsuario(e.target.files);
    $("#userPhotoLabel").html(`!Foto Subida! <i class="fa-solid fa-check" class="w-50"></i>`);
});

// Cuando se envía el formulario de creación de usuario
$(document).on("submit", "#joinChat", e => {
    e.preventDefault(); // Evitamos que se recargue la página
    let nombreUsuario = $("#usernameInput").val();
    let estado = "En línea";
    let grupo = $("#chatSelect").val();

    if ($("#imageInput").val() != "") {
        socket.emit("añadirUsuarioAlGrupo", {
            nombreUsuario: nombreUsuario,
            estado: estado,
            grupo: grupo,
            fotoUsuario: fotoPerfil,
        });

        $("#usernameInput").val();
        $("body").addClass("container-fluid");
        $("body").html(`
            <div class="row">
                <aside class="col-3 p-0 m-0">
                    <header class="d-flex justify-content-between align-items-center sidebar-header">
                        <div id="sidebar_header" class="d-flex align-items-center justify-content-center gap-3">       
                        </div>
                        <div class="d-flex align-items-center justify-content-center gap-3">
                            <i class="fa-solid fa-users"></i>
                            <i class="fa-sharp fa-solid fa-circle-notch"></i>
                            <i class="fa-solid fa-message"></i>
                            <i class="fa-solid fa-ellipsis-v" data-bs-toggle="dropdown" aria-expanded="false" title="Opciones de usuarios"></i>
                            <ul class="dropdown-menu">
                            <li><a class="dropdown-item logout">Desconectarse</a></li>
                            </ul>
                        </div>
                    </header>
                    <div class="d-flex flex-column justify-content-start align-items-center chat-group gap-3">
                        <p id="usersConnected" class="text-center mt-3"></p>
                        <div id="user-list" class="align-self-start ps-5"></div>
                    </div>
                </aside>
                
                <main class="col-9 d-flex flex-column justify-content-start align-items-center p-0 m-0">
                    <header class="chat-header d-flex justify-content-between align-items-center w-100">
                        <div class="d-flex justify-content-center align-items-center gap-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp Logo" class="avatar">
                            <h3 class="mb-0 room-number chat-header-title">Grupo ${grupo}</h3>
                        </div>
                        <div class="d-flex justify-content-center align-items-center gap-3 pe-4 search-in-chat">
                            <i class="fa-solid fa-search"></i>
                            <i class="fa-solid fa-ellipsis-v"></i>
                        </div>
                    </header>
                    <div id="chat-messages" class="chat-messages w-100 d-flex flex-column justify-content-start">
                    </div>
                    <div class="chat-type d-flex justify-content-evenly align-items-center w-100 gap-3 ps-3 pe-3 pt-3 pb-3">
                        <i class="fa-sharp fa-regular fa-face-smile"></i>
                        <label id="chatImageInputLabel" for="chatImageInput"><i class="fa-solid fa-paperclip" title="Subir Archivos"></i></label>
                        <input type="file" id="chatImageInput">
                        <input id="newMessage" type="text" class="form-control" placeholder="Escribir un mensaje...">
                        <i class="fa-solid fa-microphone"></i>
                    </div>
                </main>
            </div>`);
    } else {
        $('#photo-error').css('display', 'block');
    }
});

// Al cerrar sesión recargamos la página
$(document).on("click", ".logout", () => {
    window.location.reload();
});

// Para la conexión de un usuario
socket.on("nuevoUsuarioConectado", usuarios => {

    $("#user-list").html("");

    let ultimoUsuario = usuarios[usuarios.length - 1];
    let usuarioActual;

    if (usuarios.length == 1) {
        usuarioActual = usuarios[usuarios.length - 1];
    } else {
        usuarios.forEach(usuario => {
            if (usuario.idUsuario == socket.id) {
                usuarioActual = usuario;
            }
        });
    }

    if (ultimoUsuario.id == socket.id) {
        $("#chat-messages").append(`
                <p class="chat-notification text-center mt-4 mb-4 me-4 p-2 w-25 align-self-center">Te has unido al chat.</p>
            `);
    } else {
        $("#chat-messages").append(`
                <p class="chat-notification text-center mt-4 mb-4 me-4 p-2 w-25 align-self-center">${ultimoUsuario.nombreUsuario} se ha unido al chat!</p>
            `);
    }

    socket.emit("fotoUsuarioIndividual", {
        idUsuario: usuarioActual.idUsuario,
        nombreUsuario: usuarioActual.nombreUsuario,
        estado: usuarioActual.estado,
    });

    socket.on("fotoUsuarioIndividual", datos => {
        console.log(datos.ruta);
        $("#sidebar_header").html(`
                <img src="${datos.ruta}" alt="Foto del usuario" class="d-inline-block align-text-top rounded-circle avatar">
                <h3 class="mb-0 usernameInHeader">${datos.nombreUsuario} -</h3> <h3 class="mb-0 p-0 stateInHeader">${datos.estado}</h3>
            `);
    });

    $("#usersConnected").html(`Usuarios conectados: ${usuarios.length}`);

    usuarios.forEach(usuario => {
        socket.emit("obtenerFotoUsuario", {
            idUsuario: usuario.idUsuario,
            nombreUsuario: usuario.nombreUsuario,
        });
    });
});

// Mostramos la foto de perfil del usuario conectado
socket.on("fotoDelUsuario", datos => {
    console.log("Foto del usuario: ", datos)
    $("#user-list").append(`
        <div class="card chat-preview w-100 mb-4">
              <div class="row g-0 w-100">
                <div class="col-md-2 d-flex justify-content-center align-items-center">
                  <img src="${datos.ruta}" id="${datos.idUsuario}-img" alt="Foto del usuario" class="d-inline-block align-text-top rounded-circle avatar me-5">
                </div>
                <div class="col-md-10 d-flex justify-content-center align-items-center">
                  <div class="card-body p-0 ps-3">
                    <input type="hidden" value="${datos.idUsuario}">
                    <h5 class="card-title list-username mb-0">${datos.nombreUsuario}</h5>
                    <p class="card-text typing mt-2">Escribiendo...</p>
                    <p class="card-text typingInPrivate mt-2">Escribiendote...</p>
                  </div>
                </div>
              </div>
          </div>
        `);
});

// Cuando el usuario se desconecta
socket.on("usuarioDesconectado", datosUsuario => {
    let idUsuario = datosUsuario.idUsuario;
    let nombreUsuario = datosUsuario.nombreUsuario;
    $(`input[value="${idUsuario}"]`).parent().parent().parent().parent().remove();
    $("#chat-messages").append(`
              <p class="chat-notification text-center mt-4 mb-4 me-4 p-2 w-25 align-self-center">${nombreUsuario} salió del chat</p>
          `);
    $("#usersConnected").html(`Usuarios conectados: ${datosUsuario.usuariosConectados}`);
    $("#chat-messages").animate(
        { scrollTop: $("#chat-messages").prop("scrollHeight") },
        500
    );
});

// Cuando se envía un mensaje (en general)
$(document).on("keyup", "#newMessage", e => {
    if (e.keyCode === 13) { // Si se presiona Enter
        if ($("#newMessage").val() != "") {
            socket.emit("nuevoMensaje", $("#newMessage").val());
            $("#newMessage").val("");
        }
    }
});

// Cuando se envía un mensaje (en privado)
$(document).on("keyup", "#newPrivateMessage", e => {
    if (e.keyCode === 13) { // Si se presiona Enter
        if ($("#newPrivateMessage").val() != "") {
            socket.emit("nuevoMensajePrivado", $("#newPrivateMessage").val());
            $("#newPrivateMessage").val("");
        }
    }
});

// Cuando se envía un mensaje (en general)
socket.on("nuevoMensaje", datosMensaje => {
    let fechaFormateada = new Date(datosMensaje.fecha);
    let horas = fechaFormateada.getHours();
    let minutos = fechaFormateada.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos;
    }
    if (datosMensaje.idUsuario === socket.id) {
        $("#chat-messages").append(`
              <div class="single-message-my-user mt-4 mb-4 me-4 p-3 align-self-end d-flex flex-column">
                  <p class="single-message-content m-0">${datosMensaje.mensaje}</p>
                  <p class="single-message-date mb-0 align-self-end">${horas}:${minutos}</p>
              </div>
              `);
    } else {
        $("#chat-messages").append(`
              <div class="single-message-other-user mt-4 mb-4 ms-4 p-3 align-self-start d-flex flex-column gap-2">
                  <h6 class="single-message-username mb-0">${datosMensaje.nombreUsuario}</h6>
                  <p class="single-message-content m-0">${datosMensaje.mensaje}</p>
                  <p class="single-message-date mb-0 align-self-end">${horas}:${minutos}</p>
              </div>
              `);
    }

    $(".single-message-username").css("color", "#ee50af");
    $("#chat-messages").animate(
        { scrollTop: $("#chat-messages").prop("scrollHeight") },
        500
    );
});

// Cuando se envía un mensaje privado
socket.on("nuevoMensajePrivado", datosMensajePrivado => {
    let fechaFormateada = new Date(datosMensajePrivado.fecha);
    let horas = fechaFormateada.getHours();
    let minutos = fechaFormateada.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos;
    }
    if (datosMensajePrivado.idUsuario === socket.id) {
        $("#private-chat-messages").append(`
              <div class="single-message-my-user mt-4 mb-4 me-4 p-3 align-self-end d-flex flex-column">
                  <p class="single-message-content m-0">${datosMensajePrivado.mensaje}</p>
                  <p class="single-message-date mb-0 align-self-end">${horas}:${minutos}</p>
              </div>
              `);
    } else {
        $("#private-chat-messages").append(`
              <div class="single-message-other-user mt-4 mb-4 ms-4 p-3 align-self-start d-flex flex-column gap-2">
                  <h6 class="single-message-username mb-0">${datosMensajePrivado.nombreUsuario}</h6>
                  <p class="single-message-content m-0">${datosMensajePrivado.mensaje}</p>
                  <p class="single-message-date mb-0 align-self-end">${horas}:${minutos}</p>
              </div>
              `);
    }

    $(".single-message-username").css("color", "#ee50af");
    $("#private-chat-messages").animate(
        { scrollTop: $("#private-chat-messages").prop("scrollHeight") },
        500
    );
});


// Cuando se envía un mensaje con archivo en general
socket.on('mensajeConArchivo', datosMensaje => {
    socket.emit('manejarMensajeConArchivo', datosMensaje);
});


// Cuando se envía un mensaje con archivo en privado
socket.on('mensajePrivadoConArchivo', datosMensajePrivado => {
    socket.emit('manejarMensajePrivadoConArchivo', datosMensajePrivado);
});


// Escritura de mensajes con archivos
socket.on('escribirMensajeConArchivo', datosMensaje => {
    let fechaFormateada = new Date(datosMensaje.fecha);
    let horas = fechaFormateada.getHours();
    let minutos = fechaFormateada.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos;
    }
    let nombreArchivo = datosMensaje.ruta.split('/').pop();

    if (datosMensaje.tipo.includes('image')) {
        if (datosMensaje.idUsuario === socket.id) {
            $("#chat-messages").append(`
                <div class="single-message-my-user mt-4 mb-4 me-4 p-3 align-self-end d-flex flex-column">
                    <img src=${datosMensaje.ruta}>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download" title="Descargar archivo"></i>
                </div>
                `);
        } else {
            $("#chat-messages").append(`
                <div class="single-message-other-user mt-4 mb-4 ms-4 p-3 align-self-start d-flex flex-column gap-2">
                  <h6 class="single-message-username mb-2">${mensajeDatos.nombreUsuario}</h6>
                    <img src=${mensajeDatos.ruta}>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download" title="Descargar archivo"></i>
                </div>
                `);
        }
    } else {
        if (mensajeDatos.idUsuario === socket.id) {
            $("#chat-messages").append(`
                <div class="single-message-my-user mt-4 mb-4 me-4 p-3 align-self-end d-flex flex-column">
                    <p class="single-message-content fileNotImg m-0">${nombreArchivo}</p>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download"></i>
                </div>
                `);
        } else {
            $("#chat-messages").append(`
                <div class="single-message-other-user mt-4 mb-4 ms-4 p-3 align-self-start d-flex flex-column gap-2">
                  <h6 class="single-message-username mb-2">${mensajeDatos.nombreUsuario}</h6>
                    <p class="single-message-content fileNotImg m-0">${nombreArchivo}</p>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download"></i>
                </div>
                `);
        }
    }

    $(".single-message-username").css("color", "#ee50af");
    $("#chat-messages").animate(
        { scrollTop: $("#chat-messages").prop("scrollHeight") },
        500
    );
});

socket.on("escribirMensajePrivadoConArchivo", datosMensajePrivado => {
    let fechaFormateada = new Date(datosMensajePrivado.fecha);
    let horas = fechaFormateada.getHours();
    let minutos = fechaFormateada.getMinutes();
    if (minutos < 10) {
        minutos = "0" + minutos;
    }
    let nombreArchivo = datosMensajePrivado.ruta.split('/').pop();

    if (datosMensajePrivado.tipo.includes('image')) {
        if (datosMensajePrivado.idUsuario === socket.id) {
            $("#private-chat-messages").append(`
                <div class="single-message-my-user mt-4 mb-4 me-4 p-3 align-self-end d-flex flex-column">
                    <img src=${datosMensajePrivado.ruta}>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download" title="Descargar archivo"></i>
                </div>
                `);
        } else {
            $("#private-chat-messages").append(`
                <div class="single-message-other-user mt-4 mb-4 ms-4 p-3 align-self-start d-flex flex-column gap-2">
                  <h6 class="single-message-username mb-2">${datosMensajePrivado.nombreUsuario}</h6>
                    <img src=${datosMensajePrivado.ruta}>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download" title="Descargar archivo"></i>
                </div>
                `);
        }
    } else {
        if (datosMensajePrivado.idUsuario === socket.id) {
            $("#private-chat-messages").append(`
                <div class="single-message-my-user mt-4 mb-4 me-4 p-3 align-self-end d-flex flex-column">
                    <p class="single-message-content fileNotImg m-0">${nombreArchivo}</p>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download"></i>
                </div>
                `);
        } else {
            $("#private-chat-messages").append(`
                <div class="single-message-other-user mt-4 mb-4 ms-4 p-3 align-self-start d-flex flex-column gap-2">
                  <h6 class="single-message-username mb-2">${datosMensajePrivado.nombreUsuario}</h6>
                    <p class="single-message-content fileNotImg m-0">${nombreArchivo}</p>
                    <p class="single-message-date mt-2 mb-2 align-self-end">${horas}:${minutos}</p>
                    <i class="fa-solid fa-download"></i>
                </div>
                `);
        }
    }

    $(".single-message-username").css("color", "#ee50af");
    $("#private-chat-messages").animate(
        { scrollTop: $("#private-chat-messages").prop("scrollHeight") },
        500
    );
});


// Cuando se esté escribiendo un mensaje mostrará el icono de enviar
$(document).on("keyup", "#newMessage", function () {
    if ($("#newMessage").val() !== "") {
        $(".fa-microphone").removeClass("fa-microphone").addClass("fa-paper-plane");
        socket.emit("escribiendo",
            {
                idUsuario: socket.id,
                escribiendo: true
            });
    } else {
        $(".fa-paper-plane")
            .removeClass("fa-paper-plane")
            .addClass("fa-microphone");
        socket.emit("escribiendo",
            {
                idUsuario: socket.id,
                escribiendo: false
            });
    }
});

// Cuando se escribe un mensaje privado (para mostrar el icono de enviar)
$(document).on("keyup", "#newPrivateMessage", function () {
    if ($("#newPrivateMessage").val() !== "") {
        $(".fa-microphone").removeClass("fa-microphone").addClass("fa-paper-plane");
        socket.emit("escribiendoChatPrivado",
            {
                idUsuario: socket.id,
                escribiendo: true
            });
    } else {
        $(".fa-paper-plane")
            .removeClass("fa-paper-plane")
            .addClass("fa-microphone");
        socket.emit("escribiendoChatPrivado",
            {
                idUsuario: socket.id,
                escribiendo: false
            });
    }
});

// Cuando se está escribiendo un mensaje se mostrará un text "escribiendo..."
socket.on("escribiendo", datos => {
    if (!datos.escribiendo) {
        setInterval(() => {
            $(`input[value="${datos.idUsuario}"]`)
                .siblings(".typing")
                .css("display", "none");
        }, 3000);
    } else {
        $(`input[value="${datos.idUsuario}"]`)
            .siblings(".typing")
            .css("display", "block");
    }
});

// Cuando se está escribiendo un mensaje en un chat privado mostrará un texto "escribiendote..."
socket.on("escribiendoChatPrivado", datos => {
    if (!datos.escribiendo) {
        setInterval(() => {
            $(`input[value="${datos.idUsuario}"]`)
                .siblings(".typingInPrivate")
                .css("display", "none");
        }, 3000);
    } else {
        $(`input[value="${datos.idUsuario}"]`)
            .siblings(".typingInPrivate")
            .css("display", "block");
    }
});

// Evento OnChange para subir archivos al servidor
$(document).on("change", "#chatImageInput", e => {
    socket.emit("subirArchivo", {
        buffer: e.target.files[0],
        nombre: e.target.files[0].name,
        tipo: e.target.files[0].type,
    });
});

$(document).on("change", "#privateChatImageInput", e => {
    socket.emit("subirArchivoDeChatPrivado", {
        buffer: e.target.files[0],
        nombre: e.target.files[0].name,
        tipo: e.target.files[0].type,
    });
});

// Evento para descargar el archivo
$(document).on('click', '.fa-download', () => {
    let src = $(this).siblings('img').attr('src');
    let srcNoEsImagen = $(this).siblings('.fileNotImg').text();
    let urlActual = window.location.href;
    var nombreArchivo;

    if (src === undefined) {
        nombreArchivo = srcNoEsImagen.split('/').pop();
        fetch(`${urlActual}${srcNoEsImagen}`)
            .then(res => {
                // new Blob() crea un nuevo objeto Blob, que contiene la información del archivo.
                let blob = new Blob([res], { type: 'application/pdf' });
                // saveAs() es una función de la librería FileSaver.js que permite descargar archivos.
                saveAs(blob, nombreArchivo);
            });
    } else {
        nombreArchivo = src.split('/').pop();
        fetch(`${urlActual}${src}`)
            .then(res => res.blob())
            .then(blob => {
                saveAs(blob, nombreArchivo);
            });
    }
});

$(document).on('click', '.list-username', () => {
    let idUsuario = $(this).siblings('input').val();

    if (idUsuario !== socket.id) {
        $('.list-username').css('pointer-events', 'none');
        let grupo = $('.room-number').text();
        let nombreUsuario = $(this).text();
        let fotoUsuario = $(`#${idUsuario}-img`).attr('src');

        $('.chat-header-title').text(nombreUsuario);
        $('.chat-header-title').siblings('img').attr('src', fotoUsuario);
        $('.chat-header-title').siblings('img').addClass('rounded-circle');

        $(".chat-group").append(`
          <div class="card chat-preview room-preview w-100 mb-4">
                <div class="row g-0 w-100">
                  <div class="col-md-2 d-flex justify-content-center align-items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp Logo" class="d-inline-block align-text-top rounded-circle avatar">
                  </div>
                  <div class="col-md-10 d-flex justify-content-center align-items-center">
                    <div class="card-body p-0 ps-3">
                      <h5 class="card-title list-room mb-0">Volver al <span id="roomNumberInCard">${grupo}</span></h5>
                    </div>
                  </div>
                </div>
            </div>
          `);

        $('#chat-messages').replaceWith(`
    <div id="private-chat-messages" class="private-chat-messages w-100 d-flex flex-column justify-content-start">
    </div>
    `);

        $('#newMessage').replaceWith(`
      <input id="newPrivateMessage" type="text" class="form-control" placeholder="Escribir un mensaje...">
    `)

        $('#chatImageInput').replaceWith(`<input type="file" id="privateChatImageInput">`);

        $('#chatImageInputLabel').replaceWith(`
      <label id="privateChatImageInputLabel" for="privateChatImageInput"><i class="fa-solid fa-paperclip" title="Subir archivos"></i></label>
    `);

        socket.emit('empezarChatPrivado', idUsuario);
        socket.emit('notificarUsuario', {
            from: socket.id,
            to: idUsuario
        });

        if ($('.dm-notification').length > 0) {
            socket.emit('eliminarNotificacion', socket.id);
        }
    }
});

socket.on('notificarUsuario', idUsuario => {
    let inputDelUsuario = $(`input[value="${idUsuario}"]`);
    let divDelUsuario = inputDelUsuario.parent();

    divDelUsuario.append(`
    <p class="card-text dm-notification mt-2">!Quiere enviarte un mensaje!</p>
  `);
});

socket.on('eliminarNotificacion', idUsuario => {
    let inputDelUsuario = $(`input[value="${idUsuario}"]`);
    let divDelUsuario = inputDelUsuario.parent();

    divDelUsuario.find('.dm-notification').remove(); 
    // Esto es para que si el usuario ya está en el chat privado no se le notifique de nuevo
});

$(document).on('click', '.room-preview', () => {
    let grupo = $('#roomNumberInCard').text();

    socket.emit('abandonarChatPrivado');

    $(".room-preview").html('');

    $('.chat-header-title').text(grupo);
    $('.chat-header-title').siblings('img').attr('src', "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png");
    $('.chat-header-title').siblings('img').removeClass('rounded-circle');
    $('.list-username').css('pointer-events', 'auto');

    $('#private-chat-messages').replaceWith(`
  <div id="chat-messages" class="chat-messages w-100 d-flex flex-column justify-content-start">
  </div>`);

    $('#newPrivateMessage').replaceWith(`
    <input id="newMessage" type="text" class="form-control" placeholder="Escribir un mensaje...">
  `)

    $('#privateChatImageInput').replaceWith(`<input type="file" id="chatImageInput">`);

    $('#privateChatImageInputLabel').replaceWith(`
      <label id="chatImageInputLabel" for="chatImageInput"><i class="fa-solid fa-paperclip" title="Subir archivos"></i></label>
    `);
});