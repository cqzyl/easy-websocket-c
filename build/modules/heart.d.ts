import type EasyWebSocketC from "./main";
export default function useHeartMsgController(): {
    startHeartKeep: (socket: EasyWebSocketC) => void;
    stopHeartKeep: () => void;
    onHeart: () => void;
};
