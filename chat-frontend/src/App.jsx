import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import { assignAgent, getAssignedAgent } from './api'

/**
 * App - single page application that contains:
 *  - Landing form to open chat as Customer or Agent
 *  - Sidebar + ChatWindow layout
 *
 * This file implements the "two windows" flow by allowing you to open
 * two browser tabs and enter different modes/ids in each.
 */
export default function App() {
  const [mode, setMode] = useState(null) // 'customer' or 'agent'
  const [customerIdInput, setCustomerIdInput] = useState('')
  const [agentIdInput, setAgentIdInput] = useState('')
  const [session, setSession] = useState(null) // { mode, customerId, agentId }
  const [previewMessages, setPreviewMessages] = useState([])

  // If you open as agent and assign, we call assignAgent endpoint (temporary admin behavior)
  const openAsAgent = async () => {
    if (!customerIdInput || !agentIdInput) {
      alert('Please enter both customer_id and agent_id for agent mode')
      return
    }
    // For the demo we will call assignAgent so backend knows the relationship.
    try {
      await assignAgent(Number(customerIdInput), Number(agentIdInput))
    } catch (err) {
      console.warn('assignAgent may have failed (it may already be assigned).', err)
    }
    setSession({
      mode: 'agent',
      customerId: Number(customerIdInput),
      agentId: Number(agentIdInput)
    })
    setMode('agent')
    // small fetch to show recent messages in sidebar
    try {
      const gm = await getAssignedAgent(Number(customerIdInput))
      if (gm.status === 'success') {
        // no-op: backend call ensures agent info present; preview messages left for chat window to load
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openAsCustomer = () => {
    if (!customerIdInput) {
      alert('Please enter customer_id for customer mode')
      return
    }
    setSession({
      mode: 'customer',
      customerId: Number(customerIdInput),
      agentId: null
    })
    setMode('customer')
  }

  // Reset session (back to landing)
  const reset = () => {
    setSession(null)
    setMode(null)
    setPreviewMessages([])
  }

  // Optional: show a tiny preview of messages by reading local storage or leaving empty.
  useEffect(() => {
    // nothing for now; chat window will fetch full history
  }, [])

  // Landing form
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-2xl bg-white rounded shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Open Chat</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600">Customer ID</label>
              <input
                type="number"
                value={customerIdInput}
                onChange={(e) => setCustomerIdInput(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                placeholder="e.g. 1"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Agent ID (for agent mode)</label>
              <input
                type="number"
                value={agentIdInput}
                onChange={(e) => setAgentIdInput(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                placeholder="e.g. 2"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={openAsCustomer}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Open Chat (Customer)
            </button>

            <button
              onClick={openAsAgent}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open Chat (Agent)
            </button>

            <button
              onClick={() => { setCustomerIdInput(''); setAgentIdInput('') }}
              className="px-4 py-2 bg-slate-200 rounded"
            >
              Clear
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Tip: open two browser tabs/windows — one as Customer and one as Agent using the same customer_id.
          </p>
        </div>
      </div>
    )
  }

  // Main app layout: sidebar (30%) + chat (70%)
  return (
    <div className="min-h-screen flex">
      <div className="w-1/3 h-screen">
        <Sidebar
          info={{
            mode: session.mode,
            customerId: session.customerId,
            agentId: session.agentId
          }}
          previewMessages={previewMessages}
        />
      </div>

      <div className="flex-1 h-screen">
        <ChatWindow
          mode={session.mode}
          customerId={session.customerId}
          agentId={session.agentId}
        />
      </div>

      <button
        onClick={reset}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg"
        title="Back to landing"
      >
        ←
      </button>
    </div>
  )
}
