import React, { createContext, useState, useEffect, useContext } from "react";

const JobReactionsContext = createContext();

export const JobReactionsProvider = ({ children }) => {
  const [reactions, setReactions] = useState(() => {
    const saved = localStorage.getItem("job-reactions");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("job-reactions", JSON.stringify(reactions));
  }, [reactions]);

  const getReaction = (jobId) => reactions[jobId] || null;

  const toggleLike = (jobId) => {
    setReactions((prev) => {
      if (prev[jobId] === "like") {
        const { [jobId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [jobId]: "like" };
    });
  };

  const toggleDislike = (jobId) => {
    setReactions((prev) => {
      if (prev[jobId] === "dislike") {
        const { [jobId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [jobId]: "dislike" };
    });
  };

  const clearReaction = (jobId) => {
    setReactions((prev) => {
      if (!prev[jobId]) return prev;
      const { [jobId]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearAll = () => setReactions({});

  return (
    <JobReactionsContext.Provider
      value={{
        reactions,
        getReaction,
        toggleLike,
        toggleDislike,
        clearReaction,
        clearAll,
      }}
    >
      {children}
    </JobReactionsContext.Provider>
  );
};

export const useJobReactions = () => useContext(JobReactionsContext);
