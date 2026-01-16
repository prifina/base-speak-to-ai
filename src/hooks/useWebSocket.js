// hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from "react";

const MAX_DELAY = 10_000;
const BASE_DELAY = 1_000;


let sharedSocket = null;

export function useWebSocket({
  site,
  enabled,
  setConnectionId = () => {},
  onSocketUpdate = () => {},
  //onUploadOK = () => {},
  //onUploadError = () => {},
}) {
  // console.log("WEBSOCKET ",site,enabled);
  const reconnectAttempt = useRef(0);
  const intentionalClose = useRef(false);

  
  
  
  const open = useCallback(() => {
    if (!enabled || !site) return;

    
    if (
      sharedSocket &&
      sharedSocket.readyState !== WebSocket.CLOSING &&
      sharedSocket.readyState !== WebSocket.CLOSED
    ) {
      return; // already CONNECTING or OPEN → nothing to do
    }

    //  websocket = new WebSocket(`wss://aucm12x6m4.execute-api.us-east-1.amazonaws.com/prod?Id=${requestId}`);
    //const ws = new WebSocket(process.env.WEB_SOCKET_URL);
    const ws = new WebSocket(
      `${
        process.env.WEB_SOCKET_URL ||
        "wss://aucm12x6m4.execute-api.us-east-1.amazonaws.com/prod"
      }?Id=${site}`
    );
    sharedSocket = ws; // remember for the next mount

    ws.onopen = () => {
      reconnectAttempt.current = 0;
      ws.send(JSON.stringify({ action: "ready", knowledgebaseId: site }));
    };

    ws.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data);

        if (msg.connectionId) {
          setConnectionId(msg.connectionId); // fires only once now
          return;
        }

        switch (msg.event) {
          case "STRIPE":
            onSocketUpdate(msg);
            break;
          case "NOTIFY":
            onSocketUpdate(msg);
            break;
          //case "CLUSTERING":  onSocketUpdate(msg);                       break;
          case "EMBEDDINGS":
            onSocketUpdate(msg);
            break;
          case "CHUNKING": // ok orchestration
            onSocketUpdate(msg);
            break;
          case "UPLOAD":
          case "UPLOAD-V2": // ok orchestration
          case "CONTENT_EXTRACTION":
          case "CLUSTERING": // ok orchestration
          case "BATCH_JOB":
            onSocketUpdate(msg);
            //
            // msg.status === "OK" ? onUploadOK() : onUploadError();
            break;
        }
      } catch {
        
      }
    };

    ws.onerror = () => {
      
    };

    ws.onclose = () => {
      if (intentionalClose.current || !enabled) return;

      reconnectAttempt.current += 1;
      const jitter = Math.random() + 0.4;
      const delay = Math.min(
        BASE_DELAY * 2 ** reconnectAttempt.current * jitter,
        MAX_DELAY
      );

      setConnectionId(null);
      setTimeout(open, delay);
    };
  }, [
    enabled,
    site,
    setConnectionId,
    // onUploadOK,
    // onUploadError,
    onSocketUpdate,
  ]);

  
  
  
  useEffect(() => {
    open(); // first mount or when deps change

    return () => {
      // DON’T close in the first (fake) unmount caused by Strict-Mode:
      if (process.env.NODE_ENV === "development") return;

      intentionalClose.current = true;
      sharedSocket?.close();
      sharedSocket = null;
    };
  }, [open]);
}
