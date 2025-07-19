import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const TestCaseForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/questions",
          getAuthHeader()
        );
        setQuestions(response.data);
      } catch (err) {
        setError("Failed to fetch questions");
      }
    };

    const fetchTestCase = async () => {
      if (mode !== "create" && id) {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8080/api/test-cases/${id}`,
            getAuthHeader()
          );
          setInput(response.data.input);
          setOutput(response.data.output);
          setQuestionId(response.data.questionId);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load test case");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
    if (mode !== "create") fetchTestCase();
  }, [id, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") {
        await axios.post(
          "http://localhost:8080/api/test-cases",
          { input, output, questionId },
          getAuthHeader()
        );
        alert("Test case created successfully!");
        navigate("/questions");
      } else if (mode === "edit") {
        await axios.put(
          `http://localhost:8080/api/test-cases/${id}`,
          { input, output, questionId },
          getAuthHeader()
        );
        alert("Test case updated successfully!");
        navigate("/questions");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && mode !== "create") {
    return <div className="text-center py-8">Loading test case...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {mode === "create" ? "Create Test Case" : "Edit Test Case"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question</label>
          <select
            value={questionId}
            onChange={(e) => setQuestionId(e.target.value)}
            required
            disabled={mode === "edit"}
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">Select a question</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Input</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Output</label>
          <input
            type="text"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/questions")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestCaseForm;