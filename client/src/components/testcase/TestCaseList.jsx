import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TestCaseList = () => {
  const [testCases, setTestCases] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [editOutput, setEditOutput] = useState("");
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const fetchTestCases = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/test-cases",
        getAuthHeader()
      );
      setTestCases(response.data);
    } catch (err) {
      alert("Failed to fetch test cases");
    }
  };

  const deleteTestCase = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test case?")) return;
    
    try {
      await axios.delete(
        `http://localhost:8080/api/test-cases/${id}`,
        getAuthHeader()
      );
      fetchTestCases();
    } catch (err) {
      alert("Failed to delete test case");
    }
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/test-cases/${editId}`,
        { input: editInput, output: editOutput },
        getAuthHeader()
      );
      setEditId(null);
      fetchTestCases();
    } catch (err) {
      alert("Failed to update test case");
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Test Cases</h2>
        <button
          onClick={() => navigate("/questions/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Test Case
        </button>
      </div>

      {testCases.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No test cases found</p>
      ) : (
        <div className="space-y-4">
          {testCases.map((tc) => (
            <div key={tc.id} className="border-b py-4">
              {editId === tc.id ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                    <input
                      type="text"
                      value={editOutput}
                      onChange={(e) => setEditOutput(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
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
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Input</p>
                      <p className="text-gray-800">{tc.input}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Output</p>
                      <p className="text-gray-800">{tc.output}</p>
                    </div>
                  </div>
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
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestCaseList;