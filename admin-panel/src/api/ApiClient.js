import axios from "axios";

// Set your base backend URL
const API_BASE = "http://localhost/chatapp/server/";

export const ApiClient = {
  // Get all assignments with customer and agent details
  async getAssignments() {
    try {
      const response = await axios.get(`${API_BASE}getAssignments.php`);
      if (response.data.status === "success") {
        // Transform assignments to include customer_name
        return response.data.assignments.map((assignment) => ({
          id: assignment.id,
          customer_id: assignment.customer_id,
          agent_id: assignment.agent_id,
          customer_name: `Customer ${assignment.customer_id}`,
          agent_username: assignment.agent_username || "Unknown",
          assigned_at: assignment.assigned_at,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  },

  // Get all agents
  async getAgents() {
    try {
      const response = await axios.get(`${API_BASE}getAgents.php`);
      if (response.data.status === "success") {
        return response.data.agents;
      }
      return [];
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  },

  // Reassign agent to customer
  async reassign(assignmentId, newAgentId, customerId) {
    try {
      const response = await axios.post(`${API_BASE}reassignAgent.php`, {
        customer_id: customerId,
        agent_id: newAgentId,
      });
      return response.data;
    } catch (error) {
      console.error("Error reassigning agent:", error);
      throw error;
    }
  },

  // Delete assignment
  async deleteAssignment(id) {
    try {
      const response = await axios.post(`${API_BASE}deleteAssignment.php`, {
        id: id,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting assignment:", error);
      throw error;
    }
  },

  // Get messages for a customer
  async getMessages(customerId) {
    try {
      const response = await axios.get(
        `${API_BASE}getMessages.php?customer_id=${customerId}`
      );
      if (response.data.status === "success") {
        return response.data.messages;
      }
      return [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  },

  // Send message
  async sendMessage(customerId, agentId, message) {
    try {
      const response = await axios.post(`${API_BASE}sendMessage.php`, {
        customer_id: customerId,
        agent_id: agentId,
        message: message,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};
