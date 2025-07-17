import React, { useState } from "react";
import axios from "axios";

const TestCaseForm = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    try {
      await axios.post(
        "http://localhost:8080/api/test-cases",
        { input, output },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Test case created!");
      setInput("");
      setOutput("");
    } catch (error) {
      alert("Error creating test case");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Add Test Case</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Output</label>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
            rows={3}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default TestCaseForm;
