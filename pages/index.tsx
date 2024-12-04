// import Image from "next/image";
// import localFont from "next/font/local";
import {socket} from '@/common/lib/socket'

import { useState, useEffect, useRef } from "react";
import { useDraw } from "@/common/hooks/drawing";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>();

  const [size, setSize] = useState({ width: 0, height: 0});

  const [options, setOptions] = useState<CtxOptions>({
    lineColor: "#000",
    lineWidth: 5

  })

  const { handleDraw, handleStartDrawing, handleEndDrawing, drawing} = useDraw(
    options, 
    ctxRef.current
  );

  // to dynamically update the width and height

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight});

    }

    window.addEventListener("resize", handleResize)

    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
    
  })

  useEffect(()=> {
    const canvas = canvasRef.current;

    if(canvas){
      const ctx = canvas.getContext("2d");
      if(ctx) ctxRef.current = ctx;
    }
  }, [options.lineColor, options.lineWidth]);

  const drawFromSocket = (
    socketMoves: [number, number][],
    socketOptions: CtxOptions
  ) => {
    const tempCtx = ctxRef.current;

    if(tempCtx){
      tempCtx.lineWidth = socketOptions.lineWidth;
      tempCtx.strokeStyle = socketOptions.lineColor;

      tempCtx.beginPath();
      socketMoves.forEach(([x, y])=>{
        tempCtx.lineTo(x, y);
        tempCtx.stroke()
      })

      tempCtx.closePath()
        
     
    }
  }


  // to start listening to the events emitted from server
  useEffect(()=>{
    let movesToDrawLater: [number, number][] = [];
    let optionsToUseLater: CtxOptions = {
      lineColor: "",
      lineWidth: 0,
    };

    socket.on("socket_draw", (movesToDraw, socketOptions) => {

      if(ctxRef.current && !drawing){
        drawFromSocket(movesToDraw, socketOptions)
      } else {
        movesToDrawLater = movesToDraw;
        optionsToUseLater = socketOptions
      }
    })

    return () => {
      socket.off("socket_draw");

      if(movesToDrawLater.length){
        drawFromSocket(movesToDrawLater, optionsToUseLater)
      }
    }

    

    
  }, [drawing])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <button onClick={()=> setOptions({lineColor: "blue", lineWidth: 5})}
      className="absolute bg-black">Click</button>
      <canvas
      className="h-full w-full"
      ref={canvasRef}
      onMouseDown={(e)=> handleStartDrawing(e.clientX, e.clientY)}
      onMouseUp={handleEndDrawing}
      onMouseMove={(e) => handleDraw(e.clientX, e.clientY)}
      onTouchStart={(e)=>{
        handleStartDrawing(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        )
      }}
      onTouchEnd={handleEndDrawing}
      onTouchMove={(e)=>{
        handleDraw(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      }}
      width={size.width}
      height={size.width}
      >
      </canvas>
    </div>
  );
}
