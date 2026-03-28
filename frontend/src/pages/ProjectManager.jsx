import { useEffect, useState } from "react";
import { getProjects, createProject } from "../api/projectApi";
import { createTask } from "../api/taskApi";

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data.projects || []);
  };

  const handleCreateProject = async () => {
    await createProject({
      title,
      description: "New Project",
      startDate: new Date(),
      endDate: new Date()
    });
    setTitle("");
    fetchProjects();
  };

  const handleCreateTask = async () => {
    await createTask({
      title: taskTitle,
      description: "New Task",
      projectId: selectedProject,
    //   assignedTo: "PUT_DEVELOPER_ID_HERE",
      assignedTo: "69c65d8d9f3f024bc054c443",
      priority: "Medium",
      deadline: new Date()
    });
    setTaskTitle("");
    alert("Task Created");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Project Manager Panel</h2>

      {/* CREATE PROJECT */}
      <div style={{ marginBottom: 20 }}>
        <h3>Create Project</h3>
        <input
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={handleCreateProject}>Create</button>
      </div>

      {/* CREATE TASK */}
      <div>
        <h3>Create Task</h3>

        <select onChange={(e) => setSelectedProject(e.target.value)}>
          <option>Select Project</option>
          {projects.map((p) => (
            <option value={p._id} key={p._id}>
              {p.title}
            </option>
          ))}
        </select>

        <input
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />

        <button onClick={handleCreateTask}>Create Task</button>
      </div>
    </div>
  );
}