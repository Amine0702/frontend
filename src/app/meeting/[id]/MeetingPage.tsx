"use client";

import { useStreamVideoClient, Call, StreamCall, StreamTheme, SpeakerLayout, CallControls, useCallStateHooks, useCall, VideoPreview, DeviceSettings, CallingState } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import useLoadCall from "../hooks/useLoadCall";
import { useUser } from "@clerk/nextjs";
import useStreamCall from "../hooks/useStreamCall";
import Link from "next/link";
import Button, { buttonClassName } from "@/app/meeting/components/Button";
import PermissionPrompt from "../components/PermissionPrompt";
import AudioVolumeIndicator from "../components/AudioVolumeIndicator";
import FlexibleCallLayout from "../components/FlexibleCallLayouts";
import RecordingsList from "../components/RecordingsList";


interface MeetingPageProps {
    id: string;
}

export default function MeetingPage({ id }: MeetingPageProps) {
    const {call, callLoading } = useLoadCall(id);

    const {user, isLoaded: userLoaded} = useUser();

    if(!userLoaded ||callLoading) {
        return <Loader2 className="mx-auto animate-spin" />;
    }

    if(!call){
        return(
            <p className="text-center font-bold">
                Call not found 
            </p>
        );
    }

    const notAllowedToJoin =
    call.type === "meeting-private" &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

    if (notAllowedToJoin){
        return(
            <p className="text-center font-bold">
                You are not allowed to view this meeting
            </p>
        );
    }
    return (
        <StreamCall call={call}>
            <StreamTheme >
                <MeetingScreen />
            </StreamTheme>
        </StreamCall>
    );
}

function MeetingScreen(){
    const call = useStreamCall();

    const {useCallEndedAt, useCallStartsAt } = useCallStateHooks();

    const CallEndedAt = useCallEndedAt();
    const CallStartsAt = useCallStartsAt();

    const [setupComplete, setSetupComplete] = useState (false);

    async function handleSetupComplete (){
        call.join();
        setSetupComplete(true);
    }

    const callInFuture = CallStartsAt && new Date(CallStartsAt) > new Date();

    const callHasEnded = !!CallEndedAt;

    if(callHasEnded) {
        return <MeetingEndedScreen />
    }
    if (callInFuture){
        return <UpcomingMeetingScreen />
    }

    const description = call.state.custom.description;

    return (
        <div className="space-y-6">
            {description && (
                <p className="text-center">
                    Meeting description: <span className="font-bold">{description}</span>
                </p>
            )}
            {setupComplete ? (
                <CallUI />
            ) : (
                <SetupUI onSetupComplete={handleSetupComplete} />
            )}
        </div>
    );
}


interface SetupUIProps {
    onSetupComplete: () => void;
}

function SetupUI({onSetupComplete}: SetupUIProps) {
    const call = useStreamCall();

    const {useMicrophoneState, useCameraState} = useCallStateHooks();

    const micState = useMicrophoneState();
    const camState = useCameraState();

    const [micCamDisabled, setMicCamDisabled] = useState(false);

    useEffect(() => {
        if(micCamDisabled){
            call.camera.disable();
            call.microphone.disable();
        }else {
            call.camera.enable();
            call.microphone.enable();
        }

    },[micCamDisabled])

    if(!micState.hasBrowserPermission || !camState.hasBrowserPermission){
       return  <PermissionPrompt /> ;
    }
    
    return (
        <div className="flex flex-col items-center gap-3">
            <h1 className="text-center text-2xl font-bold">Setup</h1>
            <VideoPreview />
            <div className="flex h-16 items-center gap-3">
                <AudioVolumeIndicator />
                <DeviceSettings />
            </div>
            <div className="flex items-center gap-2 font-medium">
                <input
                    type="checkbox"
                    className="w-4 h-4" // Taille forcée pour éviter les différences d'affichage
                    style={{
                        WebkitAppearance: "checkbox",
                        MozAppearance: "checkbox",
                        appearance: "checkbox",
                        marginRight: "4px" // Réduction de l'espace entre la case et le texte
                    }}
                    checked={micCamDisabled}
                    onChange={(e) => setMicCamDisabled(e.target.checked)}
                />
                Join with mic and camera off
            </div>
            <button
              className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600" onClick={onSetupComplete}>Join meeting</button>
        </div>
    );
}

function CallUI() {
    const {useCallCallingState} = useCallStateHooks();

    const callingState = useCallCallingState();

    if(callingState !== CallingState.JOINED) {
        return <Loader2 className="mx-auto animate-spin" />
    }

    return <FlexibleCallLayout />
}

function UpcomingMeetingScreen(){
    const call = useStreamCall();

    return <div className="flex flex-col items-center gap-6">
        <p>
            This meeting has not started yet. It will start at {" "}
            <span className="font-bold">
                {call.state.startsAt?.toLocaleString()}
            </span>
        </p>
        {call.state.custom.description && (
            <p>
                Description: {" "}
                <span className="font-bold">
                    {call.state.custom.description}
                </span>
            </p>
        )}
        <Link href="/meeting" className={buttonClassName}>Go home</Link>
    </div>
}

function MeetingEndedScreen(){
    return (
        <div className="flex flex-col items-center gap-6">
            <p className="font-bold">This meeting has ended.</p>
            <Link href="/meeting" className={buttonClassName}>Go home</Link>
            <div className="space-y-3">
                <h2 className="text-center text-xl font-bold">
                    Recordings
                </h2>
                <RecordingsList />
            </div>
        </div>
    );
}
