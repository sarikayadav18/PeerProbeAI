import React, { useEffect, useState } from "react";
import axios from "axios";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token;
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/questions", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setQuestions(res.data);
    } catch (err) {
      alert("Failed to fetch questions");
    }
  };

  const deleteQuestion = async (id) => {
    await axios.delete(`http://localhost:8080/api/questions/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchQuestions();
  };

  const saveEdit = async () => {
    await axios.put(
      `http://localhost:8080/api/questions/${editId}`,
      { name: editName, description: editDescription },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    setEditId(null);
    fetchQuestions();
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-center">All Questions</h2>
      {questions.map((q) => (
        <div key={q.id} className="border-b py-4">
          {editId === q.id ? (
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
              <h3 className="text-lg font-medium">{q.name}</h3>
              <p className="text-gray-700 mb-2">{q.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditId(q.id);
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
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
