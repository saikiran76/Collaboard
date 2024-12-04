import { createServer } from "http";

import express, {Request, Response} from "express";
import next from "next"

import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev});
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
    const app = express();
    const server = createServer(app);

    const io = new Server<ClientToServerEvents, ServerToClientEvents>(server)

    app.get("/health", async(_, res)=>{
        res.send("Server is healthy and UP")

    })

    io.on("connection", (socket)=> {
        console.log("connection")
        

        // start listening to Draw event
        socket.on("draw", (moves, options) => {
            // check whether listening on server side or not
            console.log("draw", moves, options)
            socket.broadcast.emit("socket_draw", moves, options)
        })

        // listen for disconnect
        socket.on("disconnect", ()=>{
            console.log("Client disconnected")
        })
    })



    app.all("*", (req: Request, res: Response) => nextHandler(req, res));

    server.listen(port, ()=>{
        console.log(`Server is listening on ${port}`)
    })

});