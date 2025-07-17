import React, { useState } from "react";
import axios from "axios";

const QuestionForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    try {
      await axios.post(
        "http://localhost:8080/api/questions",
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Question created successfully!");
      setName("");
      setDescription("");
    } catch (err) {
      alert("Error: " + err.response?.data?.message || "Unknown error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-center">Create a Question</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            rows={4}
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
