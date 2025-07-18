import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const QuestionForm = ({ mode = "create" }) => { // 'create', 'edit', or 'view'
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    if (mode !== "create" && id) {
      const fetchQuestion = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8080/api/questions/${id}`,
            getAuthHeader()
          );
          setName(response.data.name);
          setDescription(response.data.description);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to load question");
        } finally {
          setLoading(false);
        }
      };
      fetchQuestion();
    }
  }, [id, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") {
        await axios.post(
          "http://localhost:8080/api/questions",
          { name, description },
          getAuthHeader()
        );
        alert("Question created successfully!");
        navigate("/questions");
      } else if (mode === "edit") {
        await axios.put(
          `http://localhost:8080/api/questions/${id}`,
          { name, description },
          getAuthHeader()
        );
        alert("Question updated successfully!");
        navigate("/questions");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/questions/${id}`,
        getAuthHeader()
      );
      alert("Question deleted successfully!");
      navigate("/questions");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && mode !== "create") {
    return <div className="text-center py-8">Loading question...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {mode === "create" && "Create a Question"}
        {mode === "edit" && "Edit Question"}
        {mode === "view" && "View Question"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            readOnly={mode === "view"}
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 ${
              mode === "view" ? "bg-gray-100" : ""
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            readOnly={mode === "view"}
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 ${
              mode === "view" ? "bg-gray-100" : ""
            }`}
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-4">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              disabled={loading}
            >
              Delete Question
            </button>
          )}
          
          {mode !== "view" && (
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Processing..." : mode === "create" ? "Create" : "Update"}
            </button>
          )}
          
          {(mode === "view" || mode === "edit") && (
            <button
              type="button"
              onClick={() => navigate("/questions")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Back to List
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;