import { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";

export default function MessagesModal({ data, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    loadMessages();
  }, [data]);

  async function loadMessages() {
    const msgs = await ApiClient.getMessages(data.customer_id);
    setMessages(msgs);
  }

  async function handleSend() {
    if (!newMsg.trim()) return;
    await ApiClient.sendMessage(data.customer_id, data.agent_id, newMsg);
    // Reload messages to get the latest from the server
    await loadMessages();
    setNewMsg("");
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[400px] h-[500px] flex flex-col">
        <h2 className="text-lg font-bold mb-4">
          Chat: {data.customer_name} & {data.agent_username}
        </h2>

        <div className="flex-1 overflow-y-auto border p-2 mb-3 rounded">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`my-1 p-2 rounded-lg max-w-[75%] ${
                m.type === "outgoing"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-black mr-auto"
              }`}
            >
              {m.message}
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="border rounded flex-1 p-2"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Send
          </button>
        </div>

        <button onClick={onClose} className="mt-4 text-gray-600 text-sm">
          Close
        </button>
      </div>
    </div>
  );
}
