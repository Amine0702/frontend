"use client";

import { Copy, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient, Call, MemberRequest } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { getUserIds } from "./action";
import Button from "@/app/meeting/components/Button";
import Link from "next/link";

export default function CreateMeetingPage() {
  const client = useStreamVideoClient();
  const { user } = useUser();
  const [descriptionInput, setDescriptionInput] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [participantsInputt, setparticipantsInputt] = useState("");

  const [call, setCall] = useState<Call>();

  async function createMeeting() {
    if (!client || !user) return;

    try {
      const id = crypto.randomUUID();
      const callType = participantsInputt ? "meeting-private" : "default";
      const call = client.call(callType, id);
      const memberEmails = participantsInputt.split(",").map(email => email.trim());
      const memberIds = await getUserIds(memberEmails);

      const members: MemberRequest[] = memberIds
        .map((id: string) => ({ user_id: id, role: "call_member" }))
        .concat({ user_id: user.id, role: "call_member" })
        .filter((v, i, a) => a.findIndex(v2 => v2.user_id === v.user_id) === i);

      const starts_at = new Date(startTimeInput || Date.now()).toISOString();

      await call.getOrCreate({
        data: {
          starts_at,
          members,
          custom: { description: descriptionInput },
        },
      });

      setCall(call);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again later.");
    }
  }

  if (!client || !user) {
    return <Loader2 className="mx-auto animate-spin text-white" />;
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-12 bg-black-200 min-h-screen">
      <h1 className="text-3xl font-semibold text-black dark:text-white">
        Welcome {user.username}!
      </h1>

      <div className="w-full max-w-md space-y-6 bg-gray-100 p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900">Create a new meeting</h2>
        <DescriptionInput value={descriptionInput} onChange={setDescriptionInput} />
        <StartTimeInput value={startTimeInput} onChange={setStartTimeInput} />
        <ParticipantsInputt value={participantsInputt} onChange={setparticipantsInputt} />
        <Button
          onClick={createMeeting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
        >
          Create meeting
        </Button>
      </div>
      {call && <MeetingLink call={call} />}
    </div>
  );
}

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">Meeting info:</div>
      <div className="flex items-center">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          style={{
            WebkitAppearance: "radio",
            MozAppearance: "radio",
            appearance: "radio",
            marginRight: "4px" // Réduction de l'espace entre la case et le texte
          }}
        />
        <span className="ml-2 text-sm text-gray-900">Include description</span>
      </div>
      {active && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter meeting description..."
          className="w-full h-24 p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

interface StartTimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

function StartTimeInput({ value, onChange }: StartTimeInputProps) {
  const [active, setActive] = useState(false);

  const dateTimeLocalNow = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">Meeting start:</div>
      <div className="flex items-center">
        <input
          type="radio"
          name="startTime"
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
          style={{
            WebkitAppearance: "radio",
            MozAppearance: "radio",
            appearance: "radio",
            marginRight: "4px" // Réduction de l'espace entre la case et le texte
          }}
        />
        <span className="ml-2 text-sm text-gray-900">Start immediately</span>
      </div>
      <div className="flex items-center">
        <input
          type="radio"
          name="startTime"
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          checked={active}
          onChange={() => {
            setActive(true);
            onChange(dateTimeLocalNow);
          }}
          style={{
            WebkitAppearance: "radio",
            MozAppearance: "radio",
            appearance: "radio",
            marginRight: "4px" // Réduction de l'espace entre la case et le texte
          }}
        />
        <span className="ml-2 text-sm text-gray-900">Schedule for later</span>
      </div>
      {active && (
        <div className="mt-2">
          <div className="block text-sm font-medium text-gray-900 mb-1">
            Select start time:
          </div>
          <input
            type="datetime-local"
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={dateTimeLocalNow}
            
          />
        </div>
      )}
    </div>
  );
}

interface ParticipantsInputtProps {
  value: string;
  onChange: (value: string) => void;
}

function ParticipantsInputt({ value, onChange }: ParticipantsInputtProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">Participants</div>
      <div className="flex items-center">
        <input
          type="radio"
          name="participants"
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
          style={{
            WebkitAppearance: "radio",
            MozAppearance: "radio",
            appearance: "radio",
            marginRight: "4px" // Réduction de l'espace entre la case et le texte
          }}
        />
        <div className="ml-2 text-sm text-gray-900">
          Open meeting (Anyone with the link can join)
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="radio"
          name="participants"
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          checked={active}
          onChange={() => setActive(true)}
          style={{
            WebkitAppearance: "radio",
            MozAppearance: "radio",
            appearance: "radio",
            marginRight: "4px" // Réduction de l'espace entre la case et le texte
          }}
        />
        <span className="ml-2 text-sm text-gray-900">Private meeting</span>
      </div>
      {active && (
        <div className="mt-2">
          <div className="block text-sm font-medium text-gray-900 mb-1">
            Enter participants' emails:
          </div>
          <textarea
            className="w-full h-20 p-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter emails separated by commas"
          />
        </div>
      )}
    </div>
  );
}

interface MeetingLinkProps {
  call: Call;
}

function MeetingLink({ call }: MeetingLinkProps) {
  const meetingLink = `${process.env.NEXT_PUBLIC_API_BASE_URL2}/meeting/${call.id}`;

  return (
    <div className="flex flex-col items-center gap-4 text-center mt-4">
      <div className="flex items-center gap-3">
        <span className="text-gray-900">
          Invitation link:{" "}
          <Link href={meetingLink} className="font-medium text-blue-600 hover:underline">
            {meetingLink}
          </Link>
        </span>
        <button 
          title="Copy invitation link"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            alert("Copied to clipboard");
          }}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Copy className="w-5 h-5 text-gray-900 dark:text-white" />

        </button>
      </div>
      <a 
        href={getMailToLink(
          meetingLink,
          call.state.startsAt,
          call.state.custom.description,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline text-sm"
      >
        Send invitation via email
      </a>
    </div>
  );
}

function getMailToLink(
  meetingLink: string,
  startsAt?: Date,
  description?: string,
) {
  const startDateFormatted = startsAt
    ? startsAt.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : undefined;

  const subject =
    "Join my meeting" + (startDateFormatted ? ` at ${startDateFormatted}` : "");
  
  const body =
    `Join my meeting at ${meetingLink}.` +
    (startDateFormatted ? `\n\nThe meeting starts at ${startDateFormatted}.` : "") +
    (description ? `\n\nDescription: ${description}` : "");

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
