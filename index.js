// EPPR Sala de Chat Privado NodeJS + TwitterBot
// Escuela de Programación y Pensamiento Recursivo
// eppr.link
// Autor: @lxps 2020

const { exec } = require("child_process");
var qrcode = require('qrcode-terminal');
var moment = require('moment');
var express = require('express');
var app = express();

// Antes de iniciar recuerda:
// 1) Iniciar un nuevo proyecto de Node con el comando:
// sudo npm init
// 2) Instalar los módulos express, ejs, moment, socket.io & qrcode-terminal con el comando:
// sudo npm install --save express ejs qrcode-terminal moment socket.io twit
// 3) Modificar el archivo secretKeys.js
// code secretKeys.js
// 4) Iniciar el servidor de NodeJS
// node index


// Cargamos las llaves secretas de Twitter
var secret = require('./secretKeys.js');
// Carga modulo de Node TWIT
var twit = require('twit');
// Carga modulo de Node TWIT
var Twitter = new twit(secret);

app.set('view engine', 'ejs')
app.use(express.static('public'))
server = app.listen(3000, function () {
    console.log('Node app corriendo en el puerto 3000!');
    console.log('Para iniciar visita: http://10.55.0.1:3000');
// Corre un comando Shell desde NodeJS.
    // Este comando va a traernos la URL asociada a la dirección local sobre WIFI.
    exec("ifconfig wlan0 | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1'", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        // Limpiar respuesta, usualmente incluye la palabra "inet " además de multiples entradas de línea "\n"
        var LAN = stdout.replace("\n", "").replace("\n", "").replace("inet ", "").replace("\n", "")
        console.log(`o bien, mediante WIFI en : http://${LAN}:3000`);
        // Imprimir Código QR para rápido acceso mediante WiFi.
        qrcode.generate(`http://${LAN}:3000`, { small:true });
        console.log('Usa este QR desde un dispositivo en la misma red WiFi')
    });

});

// Código para iniciar Socket.IO
const io = require("socket.io")(server)
// Función de conexión, sucede cada vez que un dispositivo se conecta.
io.on('connection', (socket) => {
    // setScore : Función inicial para reportar el Record actual.
    socket.emit('welcome', { msg: "Bienvenidx!", ip: socket.conn.remoteAddress.replace("::ffff:","") });
    console.log('Nuevo usuario: '+socket.conn.remoteAddress.replace("::ffff:","")+' conectado!')
    // submit : Función que escucha una respuesta del mismo dispositivo que acaba de conectarse.
    socket.on('submit', (data) => {
        var newMsg = data.msg
        newMsg.from = data.ip

        Twitter.post('statuses/update', { status: newMsg.msg }, function(err, data, response) {
            console.log(data)
          })

        io.emit('newMessage', { data: {msg:newMsg, ip: data.ip } });

        // Imprime información sobre el nuevo mensaje.
        console.log({msg:data.msg.msg, ip: data.ip })
    });
    socket.on('pending', (data) => {
        io.emit('showPending', { ip: data.ip });
        // Imprime información sobre el nuevo mensaje.
        // console.log(`Escribiendo: ${data.ip}`)
    });
    socket.on('clear', (data) => {
        io.emit('clearPending', { ip: data.ip });
        // Imprime información sobre el nuevo mensaje.
        // console.log(`Cleared: ${data.ip}`)
    });
    
})

app.get('/', function (req, res) {
    res.render('index')
});
