import React from 'react'

/**
 * Sidebar: shows mode info, simple header and last N messages preview.
 * Props:
 *  - info: { mode: 'customer'|'agent', customerId, agentId (optional) }
 *  - previewMessages: array of last messages (most recent last)
 */
export default function Sidebar({ info, previewMessages }) {
  return (
    <aside className="h-full p-4 bg-slate-50 border-r">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Simple Chat</h1>
        <p className="text-sm text-slate-600 mt-1">Real-time demo</p>
      </div>

      <div className="mb-4">
        <div className="text-sm text-slate-500">Mode</div>
        <div className="font-medium">{info.mode === 'agent' ? 'Agent' : 'Customer'}</div>
        <div className="text-sm text-slate-500 mt-2">Customer ID</div>
        <div className="font-medium">{info.customerId}</div>
        {info.mode === 'agent' && (
          <>
            <div className="text-sm text-slate-500 mt-2">Agent ID</div>
            <div className="font-medium">{info.agentId}</div>
          </>
        )}
      </div>

      <div>
        <h2 className="text-sm text-slate-600 mb-2">Recent messages</h2>
        <ul className="space-y-2 max-h-[50vh] overflow-auto">
          {previewMessages.length === 0 && (
            <li className="text-sm text-slate-500">No messages yet</li>
          )}
          {previewMessages.map((m) => (
            <li key={m.id} className="text-sm p-2 rounded border bg-white">
              <div className="text-xs text-slate-400">{m.created_at}</div>
              <div className="truncate">
                <span className="font-mono text-xs mr-2">{m.type === 'incoming' ? 'C→A' : 'A→C'}</span>
                {m.message}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
