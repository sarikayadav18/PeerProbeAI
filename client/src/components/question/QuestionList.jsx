import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [testCases, setTestCases] = useState({});
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTestCaseId, setEditTestCaseId] = useState(null);
  const [editTestCaseInput, setEditTestCaseInput] = useState("");
  const [editTestCaseOutput, setEditTestCaseOutput] = useState("");
  const [newTestCaseInput, setNewTestCaseInput] = useState("");
  const [newTestCaseOutput, setNewTestCaseOutput] = useState("");
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return {
      headers: { Authorization: `Bearer ${user?.token}` },
    };
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/questions", getAuthHeader());
      setQuestions(res.data);
    } catch (err) {
      alert("Failed to fetch questions");
    }
  };

  const fetchTestCases = async (questionId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/test-cases/by-question/${questionId}`,
        getAuthHeader()
      );
      setTestCases(prev => ({ ...prev, [questionId]: response.data }));
    } catch (err) {
      console.error("Failed to fetch test cases:", err);
      setTestCases(prev => ({ ...prev, [questionId]: [] }));
    }
  };

  const handleToggleTestCases = async (questionId) => {
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(questionId);
      if (!testCases[questionId]) {
        await fetchTestCases(questionId);
      }
    }
  };

  // Question CRUD operations
  const deleteQuestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await axios.delete(`http://localhost:8080/api/questions/${id}`, getAuthHeader());
      fetchQuestions();
      // Remove test cases for deleted question
      setTestCases(prev => {
        const newTestCases = { ...prev };
        delete newTestCases[id];
        return newTestCases;
      });
    }
  };

  const saveQuestionEdit = async () => {
    await axios.put(
      `http://localhost:8080/api/questions/${editQuestionId}`,
      { name: editName, description: editDescription },
      getAuthHeader()
    );
    setEditQuestionId(null);
    fetchQuestions();
  };

  // Test Case CRUD operations
  const addTestCase = async (questionId) => {
    try {
      await axios.post(
        "http://localhost:8080/api/test-cases",
        { input: newTestCaseInput, output: newTestCaseOutput, questionId },
        getAuthHeader()
      );
      setNewTestCaseInput("");
      setNewTestCaseOutput("");
      await fetchTestCases(questionId);
    } catch (err) {
      console.error("Failed to add test case:", err);
    }
  };

  const saveTestCaseEdit = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/test-cases/${editTestCaseId}`,
        { input: editTestCaseInput, output: editTestCaseOutput },
        getAuthHeader()
      );
      setEditTestCaseId(null);
      if (expandedQuestionId) {
        await fetchTestCases(expandedQuestionId);
      }
    } catch (err) {
      console.error("Failed to update test case:", err);
    }
  };

  const deleteTestCase = async (id) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      try {
        await axios.delete(`http://localhost:8080/api/test-cases/${id}`, getAuthHeader());
        if (expandedQuestionId) {
          await fetchTestCases(expandedQuestionId);
        }
      } catch (err) {
        console.error("Failed to delete test case:", err);
      }
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-center">All Questions</h2>
      {questions.map((q) => (
        <div key={q.id} className="border-b py-4">
          {editQuestionId === q.id ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveQuestionEdit}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditQuestionId(null)}
                  className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{q.name}</h3>
                  <p className="text-gray-700 mb-2">{q.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditQuestionId(q.id);
                      setEditName(q.name);
                      setEditDescription(q.description);
                    }}
                    className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleToggleTestCases(q.id)}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  >
                    {expandedQuestionId === q.id ? "Hide" : "Show"} Test Cases
                  </button>
                </div>
              </div>

              {expandedQuestionId === q.id && (
                <div className="mt-4 pl-4 border-l-4 border-blue-200">
                  <h4 className="font-medium mb-2">Test Cases:</h4>
                  {testCases[q.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {testCases[q.id].map((tc) => (
                        <div key={tc.id} className="p-3 bg-gray-50 rounded">
                          {editTestCaseId === tc.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editTestCaseInput}
                                onChange={(e) => setEditTestCaseInput(e.target.value)}
                                className="w-full px-3 py-1 border rounded"
                              />
                              <input
                                type="text"
                                value={editTestCaseOutput}
                                onChange={(e) => setEditTestCaseOutput(e.target.value)}
                                className="w-full px-3 py-1 border rounded"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={saveTestCaseEdit}
                                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditTestCaseId(null)}
                                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <p><strong>Input:</strong> {tc.input}</p>
                                <p><strong>Output:</strong> {tc.output}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditTestCaseId(tc.id);
                                    setEditTestCaseInput(tc.input);
                                    setEditTestCaseOutput(tc.output);
                                  }}
                                  className="text-yellow-600 hover:text-yellow-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteTestCase(tc.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No test cases yet</p>
                  )}

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Add New Test Case:</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Input"
                        value={newTestCaseInput}
                        onChange={(e) => setNewTestCaseInput(e.target.value)}
                        className="px-3 py-1 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Output"
                        value={newTestCaseOutput}
                        onChange={(e) => setNewTestCaseOutput(e.target.value)}
                        className="px-3 py-1 border rounded"
                      />
                    </div>
                    <button
                      onClick={() => addTestCase(q.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Add Test Case
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionList;