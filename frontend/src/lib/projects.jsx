import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";

const ProjectsCtx = createContext({ projects: [], current: null, setCurrent: () => {}, refresh: () => {}, create: () => {}, remove: () => {} });

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/workspace/projects");
      setProjects(res.data);
      if (res.data.length > 0) {
        setCurrent((c) => res.data.find((p) => p.project_id === c?.project_id) || res.data[0]);
      } else {
        setCurrent(null);
      }
    } catch (e) {
      setProjects([]);
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (payload) => {
    const res = await api.post("/workspace/projects", payload);
    setProjects((ps) => [res.data, ...ps]);
    setCurrent(res.data);
    return res.data;
  };
  const remove = async (project_id) => {
    await api.delete(`/workspace/projects/${project_id}`);
    setProjects((ps) => ps.filter((p) => p.project_id !== project_id));
    setCurrent((c) => (c?.project_id === project_id ? null : c));
  };

  return (
    <ProjectsCtx.Provider value={{ projects, current, setCurrent, refresh, create, remove, loading }}>
      {children}
    </ProjectsCtx.Provider>
  );
}

export const useProjects = () => useContext(ProjectsCtx);
