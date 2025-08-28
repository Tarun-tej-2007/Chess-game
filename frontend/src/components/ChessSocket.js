// src/components/ChessSocket.js
import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChessSocket({ roomId, username }) {
  const [fen, setFen] = useState("start");

  useEffect(() => {
    socket.emit("join", { room: roomId, username });

    socket.on("joined", (data) => {
      setFen(data.fen);
    });

    socket.on("move_made", (data) => {
      setFen(data.fen);
    });

    socket.on("invalid", (d) => {
      console.warn("invalid:", d);
    });

    return () => {
      socket.off("joined");
      socket.off("move_made");
      socket.off("invalid");
    };
  }, [roomId, username]);

  const onDrop = (sourceSquare, targetSquare) => {
    // simple UCI like 'e2e4' or 'e7e8q' for promotion
    const move = sourceSquare + targetSquare;
    socket.emit("move", { room: roomId, move });
    // we rely on server to validate and broadcast the new FEN
    return true;
  };

  return <Chessboard position={fen} onPieceDrop={(s,t)=>onDrop(s,t)} />;
}
