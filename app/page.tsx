"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

// TOEIC test structure - exactly 200 questions
const TOEIC_STRUCTURE = {
  listening: [
    { part: 1, name: "Photographs", start: 1, end: 6 },
    { part: 2, name: "Question-Response", start: 7, end: 31 },
    { part: 3, name: "Conversations", start: 32, end: 70 },
    { part: 4, name: "Short Talks", start: 71, end: 100 },
  ],
  reading: [
    { part: 5, name: "Incomplete Sentences", start: 101, end: 130 },
    { part: 6, name: "Text Completion", start: 131, end: 146 },
    { part: 7, name: "Reading Comprehension", start: 147, end: 200 },
  ],
};

type Answer = "A" | "B" | "C" | "D" | null;

export default function TOEICAnswerSheet() {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, Answer>>(
    {}
  );
  const [correctionMode, setCorrectionMode] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAnswers = localStorage.getItem("toeic-student-answers");
      const savedCorrectAnswers = localStorage.getItem("toeic-correct-answers");
      const savedCorrectionMode = localStorage.getItem("toeic-correction-mode");

      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers));
        } catch (error) {
          console.error("Failed to parse saved answers:", error);
        }
      }

      if (savedCorrectAnswers) {
        try {
          setCorrectAnswers(JSON.parse(savedCorrectAnswers));
        } catch (error) {
          console.error("Failed to parse saved correct answers:", error);
        }
      }

      if (savedCorrectionMode) {
        setCorrectionMode(savedCorrectionMode === "true");
      }
    }
  }, []);

  // Save to localStorage whenever answers change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("toeic-student-answers", JSON.stringify(answers));
    }
  }, [answers]);

  // Save to localStorage whenever correct answers change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "toeic-correct-answers",
        JSON.stringify(correctAnswers)
      );
    }
  }, [correctAnswers]);

  // Save to localStorage whenever correction mode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("toeic-correction-mode", correctionMode.toString());
    }
  }, [correctionMode]);

  const handleAnswerSelect = (questionNumber: number, answer: Answer) => {
    if (correctionMode) {
      setCorrectAnswers((prev) => ({
        ...prev,
        [questionNumber]: prev[questionNumber] === answer ? null : answer,
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionNumber]: prev[questionNumber] === answer ? null : answer,
      }));
    }
  };

  const clearAllAnswers = () => {
    if (correctionMode) {
      setCorrectAnswers({});
      if (typeof window !== "undefined") {
        localStorage.removeItem("toeic-correct-answers");
      }
    } else {
      setAnswers({});
      if (typeof window !== "undefined") {
        localStorage.removeItem("toeic-student-answers");
      }
    }
  };

  const clearSectionAnswers = (start: number, end: number) => {
    if (correctionMode) {
      setCorrectAnswers((prev) => {
        const newAnswers = { ...prev };
        for (let i = start; i <= end; i++) {
          delete newAnswers[i];
        }
        // Save to localStorage immediately
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "toeic-correct-answers",
            JSON.stringify(newAnswers)
          );
        }
        return newAnswers;
      });
    } else {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        for (let i = start; i <= end; i++) {
          delete newAnswers[i];
        }
        // Save to localStorage immediately
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "toeic-student-answers",
            JSON.stringify(newAnswers)
          );
        }
        return newAnswers;
      });
    }
  };

  // Function to clear all data
  const clearAllData = () => {
    setAnswers({});
    setCorrectAnswers({});
    setCorrectionMode(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("toeic-student-answers");
      localStorage.removeItem("toeic-correct-answers");
      localStorage.removeItem("toeic-correction-mode");
    }
  };

  const getScoreData = () => {
    const totalQuestions = 200;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    for (let i = 1; i <= totalQuestions; i++) {
      const studentAnswer = answers[i];
      const correctAnswer = correctAnswers[i];

      if (!studentAnswer) {
        unansweredCount++;
      } else if (correctAnswer && studentAnswer === correctAnswer) {
        correctCount++;
      } else if (correctAnswer) {
        incorrectCount++;
      }
    }

    return { correctCount, incorrectCount, unansweredCount };
  };

  // Answer bubble component that looks like traditional test sheets
  const AnswerBubble = ({
    questionNumber,
    option,
  }: {
    questionNumber: number;
    option: Answer;
  }) => {
    const isSelectedStudent = answers[questionNumber] === option;
    const isSelectedCorrect = correctAnswers[questionNumber] === option;
    const hasCorrectAnswer = correctAnswers[questionNumber] !== undefined;
    const studentAnswer = answers[questionNumber];
    const correctAnswer = correctAnswers[questionNumber];

    // Determine the bubble appearance based on mode and correctness
    let bubbleClass = "";
    if (correctionMode) {
      // In correction mode, show correct answers
      if (isSelectedCorrect) {
        bubbleClass = "bg-green-600 text-white border-green-600";
      } else {
        bubbleClass =
          "border-gray-400 hover:border-green-500 bg-white dark:bg-gray-800 dark:border-gray-500";
      }
    } else {
      // In student mode, show answers with correction feedback if available
      if (hasCorrectAnswer) {
        if (isSelectedStudent && studentAnswer === correctAnswer) {
          // Correct answer
          bubbleClass = "bg-green-600 text-white border-green-600";
        } else if (isSelectedStudent && studentAnswer !== correctAnswer) {
          // Wrong answer
          bubbleClass = "bg-red-600 text-white border-red-600";
        } else if (option === correctAnswer) {
          // Show correct answer
          bubbleClass =
            "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200";
        } else {
          bubbleClass =
            "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-500";
        }
      } else {
        // No correction data available
        if (isSelectedStudent) {
          bubbleClass =
            "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white";
        } else {
          bubbleClass =
            "border-gray-400 hover:border-gray-600 bg-white dark:bg-gray-800 dark:border-gray-500 dark:hover:border-gray-300";
        }
      }
    }

    return (
      <button
        onClick={() => handleAnswerSelect(questionNumber, option)}
        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-150 hover:scale-110 active:scale-95 ${bubbleClass}`}
        aria-label={`Question ${questionNumber}, option ${option}`}
        disabled={!correctionMode && hasCorrectAnswer}
      >
        {option}
      </button>
    );
  };

  // Question row with number and bubbles
  const QuestionRow = ({ questionNumber }: { questionNumber: number }) => {
    const hasCorrectAnswer = correctAnswers[questionNumber] !== undefined;
    const studentAnswer = answers[questionNumber];
    const correctAnswer = correctAnswers[questionNumber];

    // Determine question row status
    let statusIcon = null;
    if (!correctionMode && hasCorrectAnswer) {
      if (studentAnswer === correctAnswer) {
        statusIcon = <span className="text-green-600 text-xs">✓</span>;
      } else if (studentAnswer && studentAnswer !== correctAnswer) {
        statusIcon = <span className="text-red-600 text-xs">✗</span>;
      } else {
        statusIcon = <span className="text-gray-400 text-xs">—</span>;
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
        <div className="w-8 sm:w-10 text-right flex items-center justify-end gap-1">
          <span className="text-xs sm:text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">
            {questionNumber}
          </span>
          {statusIcon}
        </div>
        <div className="flex gap-2 sm:gap-3 lg:gap-4">
          <AnswerBubble questionNumber={questionNumber} option="A" />
          <AnswerBubble questionNumber={questionNumber} option="B" />
          <AnswerBubble questionNumber={questionNumber} option="C" />
          <AnswerBubble questionNumber={questionNumber} option="D" />
        </div>
      </div>
    );
  };

  // Section component for organizing questions
  const QuestionSection = ({
    title,
    questions,
    sectionType,
  }: {
    title: string;
    questions: Array<{
      part: number;
      name: string;
      start: number;
      end: number;
    }>;
    sectionType: "listening" | "reading";
  }) => {
    const allQuestions = questions.flatMap((part) =>
      Array.from(
        { length: part.end - part.start + 1 },
        (_, i) => part.start + i
      )
    );

    const answeredCount = allQuestions.filter((q) =>
      correctionMode ? correctAnswers[q] : answers[q]
    ).length;
    const totalQuestions = allQuestions.length;

    // Calculate section score if both student answers and correct answers exist
    let sectionScore = null;
    if (!correctionMode && Object.keys(correctAnswers).length > 0) {
      const sectionCorrect = allQuestions.filter(
        (q) =>
          answers[q] && correctAnswers[q] && answers[q] === correctAnswers[q]
      ).length;
      sectionScore = sectionCorrect;
    }

    // Organize questions in columns (similar to real answer sheets)
    // Use different column counts based on screen size
    const questionsPerColumn = 25; // Default for desktop
    const columns = [];
    for (let i = 0; i < allQuestions.length; i += questionsPerColumn) {
      columns.push(allQuestions.slice(i, i + questionsPerColumn));
    }

    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 sm:px-4 lg:px-6 py-3 sm:py-4 shadow-sm">
        {/* Section Header */}
        <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {title}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {questions.map((part) => (
                  <div key={part.part} className="flex items-center gap-1 sm:gap-2">
                    <span className="font-semibold">Part {part.part}:</span>
                    <span className="hidden sm:inline">{part.name}</span>
                    <span className="sm:hidden">{part.name.split(' ')[0]}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1 sm:px-2 py-1 rounded">
                      Q{part.start}-{part.end}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div
                className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-2 ${
                  sectionType === "listening"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}
              >
                {correctionMode ? "ANSWER KEY" : sectionType.toUpperCase()}
              </div>
              <div className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                {sectionScore !== null
                  ? `${sectionScore}/${totalQuestions}`
                  : `${answeredCount}/${totalQuestions}`}
              </div>
              {sectionScore !== null && (
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {((sectionScore / totalQuestions) * 100).toFixed(1)}% correct
                </div>
              )}
              <Button
                onClick={() =>
                  clearSectionAnswers(
                    allQuestions[0],
                    allQuestions[allQuestions.length - 1]
                  )
                }
                variant="outline"
                size="sm"
                disabled={answeredCount === 0}
                className="mt-1 text-xs sm:text-sm"
              >
                Clear Section
              </Button>
            </div>
          </div>
        </div>

        {/* Question Grid - Responsive columns */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
          {columns.map((columnQuestions, colIndex) => (
            <div key={colIndex} className="w-full max-w-xs">
              {columnQuestions.map((questionNumber) => (
                <QuestionRow
                  key={questionNumber}
                  questionNumber={questionNumber}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalAnswered = Object.keys(
    correctionMode ? correctAnswers : answers
  ).length;
  const totalStudentAnswered = Object.keys(answers).length;
  const totalCorrectAnswered = Object.keys(correctAnswers).length;

  const listeningAnswered = TOEIC_STRUCTURE.listening
    .flatMap((part) =>
      Array.from(
        { length: part.end - part.start + 1 },
        (_, i) => part.start + i
      )
    )
    .filter((q) => (correctionMode ? correctAnswers[q] : answers[q])).length;
  const readingAnswered = TOEIC_STRUCTURE.reading
    .flatMap((part) =>
      Array.from(
        { length: part.end - part.start + 1 },
        (_, i) => part.start + i
      )
    )
    .filter((q) => (correctionMode ? correctAnswers[q] : answers[q])).length;

  const progressPercentage = (totalAnswered / 200) * 100;
  const scoreData = getScoreData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Beautiful floating love message */}
      {/* <div className="fixed top-4 right-4 z-50">
        <div className="bg-pink-500 text-white px-3 py-1 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
        <span>💖</span>
        <span className="text-sm font-medium">Love you Gobi</span>
        <span>💖</span>
          </div>
        </div>
      </div> */}
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b-2 border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                TOEIC Answer Sheet
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {correctionMode
                  ? "Answer Key Mode - Set correct answers"
                  : "Test of English for International Communication - 200 Questions"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
              {/* Score Summary */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                {!correctionMode && Object.keys(correctAnswers).length > 0 ? (
                  // Show score when in student mode with correct answers available
                  <>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Score
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                        {scoreData.correctCount}/200
                      </div>
                      <div className="text-xs text-gray-500">
                        {((scoreData.correctCount / 200) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Correct
                      </div>
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-green-600">
                        {scoreData.correctCount}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Wrong
                      </div>
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-red-600">
                        {scoreData.incorrectCount}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Blank
                      </div>
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-600">
                        {scoreData.unansweredCount}
                      </div>
                    </div>
                  </>
                ) : (
                  // Show progress when in normal mode or correction mode
                  <>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Listening
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                        {listeningAnswered}/100
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Reading
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                        {readingAnswered}/100
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Total
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {totalAnswered}/200
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4">
                <Button
                  onClick={() => setCorrectionMode(!correctionMode)}
                  variant={correctionMode ? "default" : "outline"}
                  className={
                    correctionMode ? "bg-green-600 hover:bg-green-700" : ""
                  }
                  size="sm"
                >
                  {correctionMode ? "Exit Answer Key" : "Answer Key Mode"}
                </Button>
                <Button
                  onClick={clearAllAnswers}
                  variant="outline"
                  disabled={totalAnswered === 0}
                  size="sm"
                >
                  {correctionMode ? "Clear Answer Key" : "Clear All Answers"}
                </Button>
                <Button
                  onClick={clearAllData}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  size="sm"
                >
                  Reset All
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 sm:mt-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  correctionMode
                    ? "bg-green-500"
                    : Object.keys(correctAnswers).length > 0
                    ? `bg-gradient-to-r from-green-500 via-yellow-500 to-red-500`
                    : "bg-gradient-to-r from-blue-500 to-green-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {correctionMode
                ? `Answer Key: ${progressPercentage.toFixed(1)}% Complete`
                : Object.keys(correctAnswers).length > 0
                ? `Score: ${scoreData.correctCount}/200 (${(
                    (scoreData.correctCount / 200) *
                    100
                  ).toFixed(1)}%)`
                : `Progress: ${progressPercentage.toFixed(1)}% Complete`}
              {typeof window !== "undefined" &&
                (totalStudentAnswered > 0 || totalCorrectAnswered > 0) && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                    ● Auto-saved
                  </span>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="space-y-6 sm:space-y-8">
          {/* Listening Section */}
          <QuestionSection
            title="LISTENING COMPREHENSION"
            questions={TOEIC_STRUCTURE.listening}
            sectionType="listening"
          />

          {/* Reading Section */}
          <QuestionSection
            title="READING COMPREHENSION"
            questions={TOEIC_STRUCTURE.reading}
            sectionType="reading"
          />
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {correctionMode
                ? "Answer Key Mode Instructions"
                : "How to Use This Answer Sheet"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {correctionMode ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                      A
                    </div>
                    <span>Click to set correct answers</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>Green bubbles show correct answers</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1">
                    <span>
                      Use &quot;Exit Answer Key&quot; to return to student mode
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs font-bold">
                      A
                    </div>
                    <span>Click bubbles to select answers</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="mr-2">Green = Correct</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                      ✗
                    </div>
                    <span>Red = Wrong</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>
                      Use &quot;Answer Key Mode&quot; to set correct answers
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      ● All progress is automatically saved
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {/* Sweet love message in footer */}
            {/* <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Made with</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span className="text-gray-500 dark:text-gray-400">for</span>
                <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent font-bold">
                  PhnNgTram
                </span>
                <span className="text-pink-400">💕</span>
              </div>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
