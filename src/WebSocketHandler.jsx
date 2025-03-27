import { useCallback } from "react";
import { useDispatch } from "react-redux";

const useWebSocketHandler = (
    projState,
    checkForErrors,
    logMessage,
    setPreprocessing,
    setPid,
    newFeatureCreated,
    removeMessageFromLog
) => {
    const dispatch = useDispatch();
    // Combined WebSocket handler
    const handleWebSocket = useCallback(
        (params) => {
            return new Promise((resolve, reject) => {
                const ws = new WebSocket(projState.bpServer.websocketEndpoint + params);

                ws.onopen = () => {
                    setPreprocessing(true);
                };

                ws.onmessage = async (evt) => {
                    const message = JSON.parse(evt.data);

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
                    setPreprocessing(false);
                    reject(evt);
                    ws.close();
                };

                ws.onclose = (evt) => {
                    setPreprocessing(false);
                    if (!evt.wasClean) {
                        logMessage({ status: "SocketClosedUnexpectedly" });
                    } else {
                        reject(evt);
                    }
                };
            });
        },
        [projState.bpServer.websocketEndpoint, checkForErrors, logMessage, setPreprocessing, setPid, newFeatureCreated, removeMessageFromLog]
    );

    return handleWebSocket;
};

export default useWebSocketHandler;
