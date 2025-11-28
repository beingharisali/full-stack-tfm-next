"use client";

import React, { useState } from "react";
import { updateProfile } from "@/services/auth.api";

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await updateProfile("John", "Doe", "john.doe@example.com", "newpassword123");
      setResult({ success: true, data: response });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">API Test Page</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Update Profile API</h2>
          <button
            onClick={testUpdateProfile}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Update Profile"}
          </button>
        </div>
        
        {result && (
          <div className={`p-6 rounded-xl ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}