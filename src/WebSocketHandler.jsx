import { useDispatch, useSelector } from "react-redux";

import { useCallback } from "react";

const useWebSocketHandler = (
    checkForErrors,
    logMessage,
    setPreprocessing,
    setPid,
    newFeatureCreated,
    removeMessageFromLog
) => {
    const dispatch = useDispatch();
    const projState = useSelector((state) => state.project);

    // Combined WebSocket handler
    const handleWebSocket = useCallback((params) => {
        return new Promise((resolve, reject) => {
            console.log("Connecting to:", projState.bpServer.websocketEndpoint + params);
            const ws = new WebSocket(projState.bpServer.websocketEndpoint + params);

            ws.onopen = () => setPreprocessing(true);

            ws.onmessage = async (evt) => {
                const message = JSON.parse(evt.data);
                console.log("message from websocker - ", message);

                if (!checkForErrors(message)) {
                    logMessage(message);

                    switch (message.status) {
                        case "Started":
                            setPreprocessing(true);
                            break;
                        case "pid":
                            dispatch(setPid(message.pid));
                            break;
                        case "FeatureCreated":
                            removeMessageFromLog("Preprocessing");
                            await newFeatureCreated(message.id);
                            break;
                        case "Finished":
                            dispatch(setPid(0));
                            removeMessageFromLog("Preprocessing");
                            setPreprocessing(false);
                            resolve(message);
                            ws.close();
                            break;
                        default:
                            break;
                    }
                } else {
                    logMessage(message);
                    setPreprocessing(false);
                    reject(message.error);
                    ws.close();
                }
            };

            ws.onerror = (evt) => {
                console.error("WebSocket error:", evt);
                logMessage({ status: "WebSocketError", detail: evt });
                setPreprocessing(false);
                reject(evt);
                ws.close();
            };

            ws.onclose = (evt) => {
                setPreprocessing(false);
                console.warn("WebSocket closed:", evt);
                if (!evt.wasClean) {
                    logMessage({
                        status: "SocketClosedUnexpectedly",
                        code: evt.code,
                        reason: evt.reason || "No reason provided",
                    });
                } else {
                    logMessage({ status: "SocketClosedCleanly" });
                }

                // 403 usually has code 1006 (abnormal closure)
                if (evt.code === 1006) {
                    reject(new Error("WebSocket closed with code 1006 — possible 403 or CORS issue."));
                }
                reject(evt);
            };
        });
    }, [projState.bpServer.websocketEndpoint, checkForErrors, logMessage, setPreprocessing, setPid, newFeatureCreated, removeMessageFromLog]);
    return handleWebSocket;
};

export default useWebSocketHandler;
