import React, { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import { Send } from 'lucide-react'
import { getMessages, sendMessage, getAssignedAgent } from '../api'


export default function ChatWindow({ mode, customerId, agentId: initialAgentId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [agent, setAgent] = useState(initialAgentId ? { id: initialAgentId } : null)
  const messagesEndRef = useRef(null)
  const pusherRef = useRef(null)
  const channelRef = useRef(null)

  // scroll to bottom helper
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'pm' : 'am'
    
    hours = hours % 12
    hours = hours || 12 // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    
    return `${hours}:${minutesStr}${ampm}`
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
          // Fetch agent details to get username
          const ag = await getAssignedAgent(customerId)
          if (ag.status === 'success' && ag.agent && mounted) {
            setAgent(ag.agent) // Store full agent object with id and username
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
    console.log(' Initializing Pusher connection...')
    const pusher = new Pusher(key, { cluster, forceTLS: true })
    pusherRef.current = pusher

    const channelName = `chat_channel_${customerId}`
    console.log(' Subscribing to channel:', channelName)
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    const handler = (payload) => {
      console.log(' Pusher received:', payload)
      
      // Append payload to messages with ID-based deduplication
      setMessages((prev) => {
        // Check if message with this ID already exists
        if (payload.id) {
          const exists = prev.some(msg => msg.id && msg.id === payload.id)
          if (exists) {
            console.log(' Duplicate ID detected, skipping:', payload.id)
            return prev
          }
        }
        
        console.log(' Adding new message')
        return [...prev, payload]
      })
      // scroll to bottom so new message is visible
      setTimeout(scrollToBottom, 50)
    }

    channel.bind('new_message', handler)

    return () => {
      console.log(' Cleaning up Pusher connection...')
      if (channel) {
        channel.unbind('new_message', handler)
        pusher.unsubscribe(channelName)
        console.log(' Unsubscribed from:', channelName)
      }
      if (pusher) {
        pusher.disconnect()
        console.log(' Pusher disconnected')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  // Send message handler
  const handleSend = async () => {
    if (!text || !customerId) return
    
    console.log(' Sending message:', text)
    
    // Prepare payload depending on mode
    const payload = { customer_id: Number(customerId), message: text }
    if (mode === 'agent') {
      // agent must include agent_id
      payload.agent_id = Number(agent?.id || agent)
    }
    
    console.log(' Payload:', payload)
    
    try {
      const res = await sendMessage(payload)
      console.log(' Send response:', res)
      
      if (res.status === 'success') {
        // Clear input - message will appear via Pusher
        setText('')
        console.log(' Input cleared, waiting for Pusher...')
        // Note: No optimistic update - we rely on Pusher to add the message
        // This prevents duplicates and ensures both users see messages identically
      } else {
        console.error(' Send failed', res)
      }
    } catch (err) {
      console.error(' Send error', err)
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
          <div className="text-sm text-slate-500">
            {mode === 'agent' ? 'Chat with Customer' : 'Chat with Agent'}
          </div>
          <div className="font-semibold">
            {mode === 'agent' 
              ? `Customer #${customerId}` 
              : (agent?.username ? agent.username : `Agent #${agent?.id ?? '—'}`)}
          </div>
        </div>
        <div className="text-sm text-slate-500">
          {mode === 'agent' 
            ? (agent?.username ? agent.username : `Agent #${agent?.id ?? '—'}`)
            : `Customer #${customerId}`}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-white to-slate-50">
        <div>
          {messages.length === 0 && (
            <div className="text-center text-slate-400">No messages yet</div>
          )}
          <div className="space-y-3">
            {messages.map((m) => {
              // Backend type field is from agent's perspective:
              // - 'incoming' = from customer
              // - 'outgoing' = from agent
              // So we need to flip the logic for customer mode
              const isMine = mode === 'agent' 
                ? m.type === 'outgoing'  // Agent: my messages are 'outgoing'
                : m.type === 'incoming'  // Customer: my messages are 'incoming' (to agent)
              
              return (
                <div key={m.id ? `${m.type}-${m.id}` : `local-${Date.now()}-${Math.random()}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${isMine ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                    <div className="text-sm break-words">{m.message}</div>
                    <div className={`text-xs mt-2 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{formatTime(m.created_at)}</div>
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
        <div className="flex items-center gap-2">
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
