import { MessageCircle } from "lucide-react";
import React from "react";

interface Props {
  onClick: () => void;
}

export default function FloatingButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6 z-50 flex font-sans font-bold items-center gap-2
        bg-[#2771ad] hover:text-[#2771ad] hover:bg-white hover:border hover:border-[#2771ad]
        text-white p-4 rounded-full shadow-xl
        transition-all duration-300
      "
    >
      AI Chat
      <MessageCircle size={26} />
    </button>
  );
}
