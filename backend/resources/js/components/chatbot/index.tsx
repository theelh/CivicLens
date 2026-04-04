import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import FloatingButton from "./FloatingButton";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && <FloatingButton onClick={() => setOpen(true)} />}
      {open && <ChatWindow onClose={() => setOpen(false)} />}
    </>
  );
}