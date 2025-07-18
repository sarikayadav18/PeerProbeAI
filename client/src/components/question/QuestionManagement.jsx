import React, { useState } from "react";
import axios from "axios";
import QuestionForm from "./QuestionForm";
import TestCaseForm from "../testcase/TestCaseForm";

const QuestionManagement = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [mode, setMode] = useState("create"); // 'create' or 'edit'

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return {
      headers: {
        Authorization: `Bearer ${user?.token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // Enhanced Question Submission with Test Cases
  const handleQuestionSubmit = async (questionData) => {
    try {
      // First create the question
      const questionResponse = await axios.post(
        "http://localhost:8080/api/questions",
        questionData,
        getAuthHeader()
      );

      const newQuestion = questionResponse.data;

      // Then create test cases for this question
      if (testCases.length > 0) {
        await Promise.all(
          testCases.map(testCase =>
            axios.post(
              "http://localhost:8080/api/test-cases",
              { ...testCase, questionId: newQuestion.id },
              getAuthHeader()
            )
          )
        );
      }

      alert("Question and test cases created successfully!");
      setCurrentQuestion(null);
      setTestCases([]);
    } catch (err) {
      alert("Error: " + err.response?.data?.message || "Unknown error");
    }
  };

  // Add Test Case to local state
  const handleAddTestCase = (testCase) => {
    setTestCases([...testCases, testCase]);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Question Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Question Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {mode === "create" ? "Create New Question" : "Edit Question"}
          </h2>
          <QuestionForm 
            onSubmit={handleQuestionSubmit}
            initialData={currentQuestion}
          />
        </div>

        {/* Right Column - Test Case Management */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          
          <TestCaseForm onAdd={handleAddTestCase} />
          
          {testCases.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Current Test Cases:</h3>
              <ul className="space-y-3">
                {testCases.map((tc, index) => (
                  <li key={index} className="p-3 border rounded">
                    <p><strong>Input:</strong> {tc.input}</p>
                    <p><strong>Output:</strong> {tc.output}</p>
                    <button
                      onClick={() => setTestCases(testCases.filter((_, i) => i !== index))}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionManagement;