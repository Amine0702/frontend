import Navbar from "@/app/meeting/components/Navbar";
import CreateMeetingPage from "./CreateMeetingPage";

export default function Home() {
  return (
    <div className="meeting-container h-full w-full p-4">
      <Navbar />
      <CreateMeetingPage />
    </div>
  );
}
