/**
 * Centralized API functions using Axios.
 * All calls go to the PHP backend described in the prompt.
 */
import axios from 'axios'

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost/chatapp/server'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  // optional: set timeout
  timeout: 10000
})

export async function assignAgent(customer_id, agent_id) {
  return api.post('/assignAgent.php', { customer_id, agent_id }).then(r => r.data)
}

export async function sendMessage(payload) {
  // payload: { customer_id, message } OR { customer_id, agent_id, message }
  return api.post('/sendMessage.php', payload).then(r => r.data)
}

export async function getMessages(customer_id) {
  return api.get(`/getMessages.php`, { params: { customer_id } }).then(r => r.data)
}

export async function getAssignedAgent(customer_id) {
  return api.get(`/getAssignedAgent.php`, { params: { customer_id } }).then(r => r.data)
}

export default api
