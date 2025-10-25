import React, { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import { Send } from 'lucide-react'
import { getMessages, sendMessage, getAssignedAgent } from '../api'

/**
 * ChatWindow component - main chat area.
 * Props:
 *  - mode: 'customer' | 'agent'
 *  - customerId (number)
 *  - agentId (number | null)
 *
 * Behavior:
 *  - Fetches message history on mount
 *  - Subscribes to Pusher channel `chat_channel_{customerId}`
 *  - Appends incoming events to messages state
 *  - Allows sending messages (uses sendMessage API)
 */
export default function ChatWindow({ mode, customerId, agentId: initialAgentId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [agent, setAgent] = useState(initialAgentId || null)
  const messagesEndRef = useRef(null)
  const pusherRef = useRef(null)
  const channelRef = useRef(null)

  // scroll to bottom helper
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  // load history and assigned agent
  useEffect(() => {
    if (!customerId) return

    let mounted = true

    async function load() {
      try {
        const res = await getMessages(customerId)
        if (res.status === 'success' && mounted) {
          setMessages(res.messages || [])
          // set agent from assigned agent if not provided
          if (!initialAgentId) {
            const ag = await getAssignedAgent(customerId)
            if (ag.status === 'success' && ag.agent) setAgent(ag.agent.id)
          }
          // scroll after a small delay so UI has rendered
          setTimeout(scrollToBottom, 50)
        }
      } catch (err) {
        console.error('Failed to load messages', err)
      }
    }
    load()

    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  // subscribe to pusher channel
  useEffect(() => {
    if (!customerId) return

    const key = import.meta.env.VITE_PUSHER_KEY
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER

    if (!key) {
      console.warn('VITE_PUSHER_KEY not set in .env.local — realtime will not work')
      return
    }

    // Initialize Pusher and subscribe
    const pusher = new Pusher(key, { cluster, forceTLS: true })
    pusherRef.current = pusher

    const channelName = `chat_channel_${customerId}`
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    const handler = (payload) => {
      // Append payload to messages
      setMessages((prev) => {
        // keep ordering: older first, newest appended
        return [...prev, payload]
      })
      // scroll to bottom so new message is visible
      setTimeout(scrollToBottom, 50)
    }

    channel.bind('new_message', handler)

    return () => {
      if (channel) {
        channel.unbind('new_message', handler)
        pusher.unsubscribe(channelName)
      }
      if (pusher) {
        pusher.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  // Send message handler
  const handleSend = async () => {
    if (!text || !customerId) return
    // Prepare payload depending on mode
    const payload = { customer_id: Number(customerId), message: text }
    if (mode === 'agent') {
      // agent must include agent_id
      payload.agent_id = Number(agent)
    }
    try {
      const res = await sendMessage(payload)
      if (res.status === 'success') {
        // optimistic update: append local copy
        const localMsg = {
          id: `local-${Date.now()}`,
          type: res.type || (mode === 'agent' ? 'outgoing' : 'incoming'),
          message: text,
          customer_id: Number(customerId),
          agent_id: mode === 'agent' ? Number(agent) : null,
          created_at: new Date().toISOString().slice(0,19).replace('T',' ')
        }
        setMessages((prev) => [...prev, localMsg])
        setText('')
        setTimeout(scrollToBottom, 50)
      } else {
        console.error('Send failed', res)
      }
    } catch (err) {
      console.error('Send error', err)
    }
  }

  // Enter to send
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div>
          <div className="text-sm text-slate-500">Chat with Customer</div>
          <div className="font-semibold">Customer #{customerId}</div>
        </div>
        <div className="text-sm text-slate-500">
          {mode === 'agent' ? `Agent #${agent ?? '—'}` : 'Customer Mode'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-slate-400">No messages yet</div>
          )}
          <div className="space-y-3">
            {messages.map((m) => {
              const isOutgoing = m.type === 'outgoing'
              return (
                <div key={m.id ? `${m.type}-${m.id}` : `local-${Date.now()}-${Math.random()}`} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${isOutgoing ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                    <div className="text-sm break-words">{m.message}</div>
                    <div className="text-xs text-slate-300 mt-2 text-right">{m.created_at}</div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none p-3 rounded border focus:outline-none focus:ring"
            rows={2}
          />
          <button
            onClick={handleSend}
            className="p-3 rounded bg-blue-600 text-white flex items-center hover:bg-blue-700"
            aria-label="Send"
            title="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
