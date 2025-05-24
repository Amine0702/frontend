import { Mic, Webcam } from "lucide-react";

export default function PermissionPrompt() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <Webcam size={40} />
        <Mic size={40} />
      </div>
      <p className="text-center">
        Veuillez autoriser l'accès à votre microphone et caméra pour rejoindre
        la réunion
      </p>
    </div>
  );
}
