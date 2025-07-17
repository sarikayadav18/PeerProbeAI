import React, { useEffect, useState } from "react";
import axios from "axios";

const TestCaseList = () => {
  const [testCases, setTestCases] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [editOutput, setEditOutput] = useState("");

  const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token;
  };

  const fetchTestCases = async () => {
    const res = await axios.get("http://localhost:8080/api/test-cases", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    setTestCases(res.data);
  };

  const deleteTestCase = async (id) => {
    await axios.delete(`http://localhost:8080/api/test-cases/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchTestCases();
  };

  const saveEdit = async () => {
    await axios.put(
      `http://localhost:8080/api/test-cases/${editId}`,
      {
        input: editInput,
        output: editOutput,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    setEditId(null);
    fetchTestCases();
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Test Cases</h2>
      {testCases.map((tc) => (
        <div key={tc.id} className="border-b py-4">
          {editId === tc.id ? (
            <>
              <textarea
                className="w-full border rounded p-2 mb-2"
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                rows={2}
              />
              <textarea
                className="w-full border rounded p-2 mb-2"
                value={editOutput}
                onChange={(e) => setEditOutput(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="mb-1">
                <strong>Input:</strong> {tc.input}
              </p>
              <p className="mb-2">
                <strong>Output:</strong> {tc.output}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditId(tc.id);
                    setEditInput(tc.input);
                    setEditOutput(tc.output);
                  }}
                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTestCase(tc.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestCaseList;
