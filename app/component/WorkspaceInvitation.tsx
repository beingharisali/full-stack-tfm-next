"use client";

import React from "react";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { respondToInvitation } from "../../services/workspace.api";

interface WorkspaceInvitationProps {
  onInvitationResponse?: () => void;
}

const WorkspaceInvitation: React.FC<WorkspaceInvitationProps> = ({ onInvitationResponse }) => {
  const { invitations, refreshInvitations } = useWorkspaceContext();

  const handleResponse = async (invitationId: string, response: "accepted" | "rejected") => {
    try {
      await respondToInvitation(invitationId, response);
      await refreshInvitations();
      if (onInvitationResponse) {
        onInvitationResponse();
      }
      
      // Show success message
      if (response === "accepted") {
        alert("Invitation accepted! You can now access the workspace.");
      } else {
        alert("Invitation rejected.");
      }
    } catch (error) {
      console.error(`Error ${response} invitation:`, error);
      alert(`Failed to ${response} invitation. Please try again.`);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Workspace Invitations</h3>
      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div key={invitation._id} className="border rounded-lg p-4 bg-blue-50">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <h4 className="font-medium text-lg text-gray-800">{invitation.workspace.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{invitation.invitedBy.firstName} {invitation.invitedBy.lastName}</span> has invited you to join this workspace.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Invited on {new Date(invitation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleResponse(invitation._id, "accepted")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(invitation._id, "rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceInvitation;