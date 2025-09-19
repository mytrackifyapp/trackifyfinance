// components/AiChatClient.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";

export default function AiChatClient({ initialSystemPrompt = "You are a helpful assistant for budgeting and crypto actions." }) {
  const [messages, setMessages] = useState([
    { role: "system", content: initialSystemPrompt },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(null);
  const active = useActiveAccount();
  const address = active?.address;
  const { mutateAsync: sendTx } = useSendTransaction() || {}; // mutateAsync is provided by thirdweb hooks
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, txPending, loading]);

  const addMessage = (m) => setMessages((s) => [...s, m]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!address) {
      alert("Please connect your wallet to use the AI assistant.");
      return;
    }

    const userMessage = { role: "user", content: input.trim() };
    const sendMessages = [...messages, userMessage];

    // show user message in UI
    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      // call your server route
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: sendMessages,
          context: {
            from: address,
            chain_ids: [1], // change to the chain(s) you support; use dynamic value if you want
            // session_id: "<optional-session-id>" 
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        addMessage({ role: "assistant", content: `Error from server: ${errText}` });
        return;
      }

      const json = await res.json();

      // thirdweb may return messages[] or a single message field. Try both.
      if (Array.isArray(json.messages) && json.messages.length) {
        json.messages.forEach((m) => addMessage({ role: m.role || "assistant", content: m.content || JSON.stringify(m) }));
      } else if (json.message) {
        addMessage({ role: "assistant", content: json.message });
      } else {
        // fallback: append entire response
        addMessage({ role: "assistant", content: JSON.stringify(json) });
      }

      // Process structured actions (if any)
      if (Array.isArray(json.actions) && json.actions.length > 0) {
        for (const action of json.actions) {
          // Example: sign_transaction / prepare_transaction
          if (action.type === "sign_transaction" || action.type === "prepare_transaction") {
            // action.data should be a tx object { to, value, data, chainId, ... }
            const txData = action.data;
            // Show a confirmation message to user in UI
            addMessage({ role: "assistant", content: `AI prepared a transaction to ${txData.to}. Please confirm in your wallet.` });

            if (!sendTx) {
              addMessage({ role: "assistant", content: "Unable to send transaction: wallet hook not available." });
              continue;
            }

            try {
              setTxPending(true);
              // Call thirdweb hook to send tx (prompts the user's wallet)
              const txResult = await sendTx(txData);
              setTxPending(null);
              addMessage({ role: "assistant", content: `Transaction sent. Result: ${JSON.stringify(txResult)}` });
            } catch (txErr) {
              setTxPending(null);
              console.error("tx error", txErr);
              addMessage({ role: "assistant", content: `Transaction failed or rejected: ${txErr?.message || txErr}` });
            }
          } else {
            // handle other action types as needed (monitor_transaction, read_chain, etc.)
            addMessage({ role: "assistant", content: `Action returned: ${action.type} — ${JSON.stringify(action.data)}` });
          }
        }
      }
    } catch (err) {
      console.error("AI request error", err);
      addMessage({ role: "assistant", content: `Request failed: ${err?.message || err}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4 border rounded-lg overflow-hidden shadow-sm">
        <div ref={listRef} className="h-64 overflow-auto p-4 space-y-3 bg-white">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div className={`inline-block px-3 py-2 rounded-md ${m.role === "user" ? "bg-blue-50" : "bg-gray-100"}`}>
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                <div className="text-xs text-gray-400 mt-1">{m.role}</div>
              </div>
            </div>
          ))}
          {txPending ? <div className="text-yellow-600 text-sm">Waiting for wallet signature...</div> : null}
        </div>

        <div className="p-3 border-t bg-gray-50 flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={address ? "Ask the assistant to show balances, transfer, or analyze a transaction..." : "Connect your wallet to use the assistant."}
            className="flex-1 rounded-md p-2 border resize-none h-16"
            disabled={!address || loading}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <strong>Note:</strong> Actions that modify chain state will always prompt your wallet for confirmation.
      </div>
    </div>
  );
}
