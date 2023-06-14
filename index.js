const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

let socketIDList = []

io.on("connection", (socket) => {
	socketIDList.push(socket.id);
	socket.emit("me", socket.id);
	io.emit("playerList", socketIDList);

	socket.on("criarChamada", ({ userToCall, signalData, from }) => {
		io.to(userToCall).emit("criarChamada", { signal: signalData, from });
	});

	socket.on("responderChamada", ({ to, signal, from }) => {
		io.to(to).emit("chamadaAceita", {signal, from})
	});

	socket.on("disconnect", () => {
		socketIDList = socketIDList.filter((s) => s !== socket.id);
		socket.broadcast.emit("callEnded", { from: socket.id})
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
