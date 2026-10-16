
import { useEffect, useMemo, useState } from "react";
import {
  House,
  ChartNoAxesColumn,
  ChartPie,
  CalendarDays,
  Moon,
  Settings,
  Search,
  Bell,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  EllipsisVertical
} from "lucide-react";
import "./styles.css";

// Backend URL configured in Vercel as VITE_API_URL
const API_URL = `${import.meta.env.VITE_API_URL}/api/tasks`;

const emptyForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "PENDING",
  dueDate: ""
};

const tabs = [
  { name: "Assigned Tasks", status: "PENDING" },
  { name: "Accepted Tasks", status: "ACCEPTED" },
  { name: "Review Tasks", status: "REVIEW" }
];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB");
}

function getStatus(status) {
  const labels = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REVIEW: "In Review",
    COMPLETED: "Completed"
  };

  return labels[String(status || "PENDING").toUpperCase()] || status;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [tab, setTab] = useState("Assigned Tasks");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // GET: Load tasks from the backend
  async function loadTasks() {
    setLoading(true);

    try {
      if (!import.meta.env.VITE_API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setTasks(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(
        `Cannot load tasks. Check the backend URL and connection. ${
          err.message || ""
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const activeTabStatus =
    tabs.find((item) => item.name === tab)?.status || "PENDING";

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const status = String(task.status || "PENDING").toUpperCase();

      const text =
        `${task.title || ""} ${task.description || ""}`.toLowerCase();

      const matchesTab = status === activeTabStatus;
      const matchesSearch = text.includes(search.trim().toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        String(task.priority || "MEDIUM").toUpperCase() ===
          priorityFilter;

      return (
        matchesTab &&
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    activeTabStatus
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function changeTab(name) {
    setTab(name);
    setPage(1);
    setStatusFilter("ALL");
    setNotice("");
    setError("");
  }

  function openCreate() {
    setEditingTask(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
    setNotice("");
    setError("");
  }

  function openEdit(task) {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      status: task.status || "PENDING",
      dueDate: task.dueDate
        ? String(task.dueDate).slice(0, 10)
        : ""
    });

    setModalOpen(true);
    setNotice("");
    setError("");
  }

  // POST: Create a task; PUT: Update an existing task
  async function saveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!import.meta.env.VITE_API_URL) {
      setError("Backend URL is missing. Check Vercel environment variables.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      title: form.title.trim(),
      dueDate: form.dueDate || null
    };

    try {
      const response = await fetch(
        editingTask
          ? `${API_URL}/${editingTask.id}`
          : API_URL,
        {
          method: editingTask ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
      }

      setModalOpen(false);

      setNotice(
        editingTask
          ? "Task updated successfully."
          : "Task created successfully."
      );

      await loadTasks();
    } catch (err) {
      setError(
        `Could not save the task. ${err.message || "Check your backend endpoint and fields."}`
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE: Remove a task
  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setNotice("Task deleted successfully.");

      await loadTasks();
    } catch (err) {
      setError(
        `Could not delete the task. ${
          err.message || "Check DELETE /api/tasks/{id}."
        }`
      );
    }
  }

  // PUT: Update task status
  async function changeTaskStatus(task, newStatus) {
    setError("");
    setNotice("");

    const updated = {
      ...task,
      status: newStatus
    };

    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updated)
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
      }

      const messages = {
        ACCEPTED: "Task accepted successfully.",
        REVIEW: "Task sent for review.",
        COMPLETED: "Task marked as completed.",
        PENDING: "Task moved back to Assigned Tasks."
      };

      setNotice(messages[newStatus] || "Task status updated.");

      await loadTasks();
    } catch (err) {
      setError(
        `Could not update task status to ${newStatus}. ${
          err.message || "Check your backend."
        }`
      );
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <div className="app-shell container-fluid p-0">
      <div className="row g-0 min-vh-100">
        <aside
          className="sidebar col-auto d-flex flex-column align-items-center"
          style={{ backgroundColor: "#7C3AED" }}
        >
          <div
            className="brand-logo"
            style={{ backgroundColor: "#c2c1d1" }}
          >
            UI
          </div>

          <nav className="side-nav d-flex flex-column align-items-center">
            <button title="Home"><House /></button>
            <button title="Dashboard"><ChartNoAxesColumn /></button>
            <button title="Reports"><ChartPie /></button>
            <button title="Calendar"><CalendarDays /></button>
            <button className="selected" title="Tasks">
              <ClipboardList />
            </button>
          </nav>

          <div className="sidebar-bottom mt-auto d-flex flex-column align-items-center">
            <button title="Dark mode"><Moon /></button>
            <button title="Settings"><Settings /></button>
          </div>
        </aside>

        <main className="main-area col">
          <header className="topbar d-flex justify-content-end align-items-center gap-4">
            <div className="search-box">
              <Search size={22} />
              <input
                aria-label="Search tasks"
                placeholder="Search tasks..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <button className="header-icon" title="Notifications">
              <Bell />
            </button>

            <div className="profile-avatar">U</div>
          </header>

          <section className="dashboard-content">
            <h1 className="page-title">My Tasks</h1>

            <div className="task-tabs d-flex gap-4">
              {tabs.map((item) => {
                const count = tasks.filter(
                  (task) =>
                    String(task.status || "PENDING").toUpperCase() ===
                    item.status
                ).length;

                return (
                  <button
                    key={item.name}
                    className={`task-tab ${
                      tab === item.name ? "active" : ""
                    }`}
                    onClick={() => changeTab(item.name)}
                  >
                    {item.name}
                    <span className="ms-2">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="toolbar d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="filters d-flex align-items-center flex-wrap gap-2">
                <div className="filter-select date-select">
                  <CalendarDays size={19} />
                  <span>All dates</span>
                </div>

                <select
                  className="form-select filter-select"
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REVIEW">In Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <select
                  className="form-select filter-select"
                  aria-label="Filter by priority"
                  value={priorityFilter}
                  onChange={(event) => {
                    setPriorityFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">All priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>

                <button
                  className="btn filter-button"
                  onClick={() => setPage(1)}
                >
                  Filter
                </button>
              </div>

              <button className="btn create-button" onClick={openCreate}>
                <Plus size={22} />
                Create New Task
              </button>
            </div>

            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            {notice && (
              <div className="alert alert-success py-2" role="status">
                {notice}
              </div>
            )}

            <div className="table-responsive task-table-container">
              <table className="table task-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created by</th>
                    <th>Date Assigned</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Loading tasks...
                      </td>
                    </tr>
                  ) : visibleTasks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        {error
                          ? "Tasks could not be loaded."
                          : `No ${tab.toLowerCase()} found.`}
                      </td>
                    </tr>
                  ) : (
                    visibleTasks.map((task) => {
                      const status = String(
                        task.status || "PENDING"
                      ).toUpperCase();

                      const due = task.dueDate
                        ? new Date(task.dueDate)
                        : null;

                      const overdue =
                        due &&
                        !Number.isNaN(due.getTime()) &&
                        due < new Date() &&
                        status !== "COMPLETED";

                      return (
                        <tr key={task.id}>
                          <td className="title-cell">
                            <span>{task.title}</span>
                            {overdue && (
                              <span className="overdue-label">Overdue</span>
                            )}
                          </td>

                          <td>
                            <span
                              className={`priority-badge ${
                                (task.priority || "MEDIUM").toLowerCase()
                              }`}
                            >
                              {task.priority || "MEDIUM"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${status.toLowerCase()}`}
                            >
                              {getStatus(status)}
                            </span>
                          </td>

                          <td>{task.createdBy || "—"}</td>
                          <td>{formatDate(task.createdAt)}</td>
                          <td>{formatDate(task.dueDate)}</td>

                          <td>
                            <div className="row-actions d-flex gap-2">
                              <button
                                className="action-btn view-btn"
                                title="View task"
                                onClick={() => setViewTask(task)}
                              >
                                <Eye size={17} />
                              </button>

                              {status === "PENDING" && (
                                <button
                                  className="action-btn edit-btn"
                                  title="Accept task"
                                  onClick={() =>
                                    changeTaskStatus(task, "ACCEPTED")
                                  }
                                >
                                  Accept
                                </button>
                              )}

                              {status === "ACCEPTED" && (
                                <button
                                  className="action-btn edit-btn"
                                  title="Send for review"
                                  onClick={() =>
                                    changeTaskStatus(task, "REVIEW")
                                  }
                                >
                                  Review
                                </button>
                              )}

                              {status === "REVIEW" && (
                                <button
                                  className="action-btn edit-btn"
                                  title="Complete task"
                                  onClick={() =>
                                    changeTaskStatus(task, "COMPLETED")
                                  }
                                >
                                  Complete
                                </button>
                              )}

                              <button
                                className="action-btn edit-btn"
                                title="Edit task"
                                onClick={() => openEdit(task)}
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                className="action-btn delete-btn"
                                title="Delete task"
                                onClick={() => deleteTask(task)}
                              >
                                <Trash2 size={17} />
                              </button>

                              <button
                                className="action-btn more-btn"
                                title="More actions"
                                onClick={() => openEdit(task)}
                              >
                                <EllipsisVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <footer className="pagination-bar d-flex align-items-center justify-content-end gap-3 flex-wrap">
              <label className="rows-label d-flex align-items-center gap-3">
                Rows per page:
                <select
                  className="form-select rows-select"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>

              <span className="page-count">
                {filteredTasks.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                –
                {Math.min(currentPage * pageSize, filteredTasks.length)} of{" "}
                {filteredTasks.length}
              </span>

              <button
                className="pagination-arrow"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => value - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </button>

              <button
                className="pagination-arrow"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => value + 1)}
                aria-label="Next page"
              >
                <ChevronRight />
              </button>
            </footer>
          </section>
        </main>
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <form className="task-modal" onSubmit={saveTask}>
            <div className="modal-heading d-flex justify-content-between align-items-center">
              <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              />
            </div>

            <label className="form-label">
              Task title *
              <input
                className="form-control"
                value={form.title}
                onChange={(event) =>
                  updateForm("title", event.target.value)
                }
                placeholder="Enter task title"
                maxLength={150}
                required
                autoFocus
              />
            </label>

            <label className="form-label">
              Description
              <textarea
                className="form-control"
                rows="3"
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Describe your task"
              />
            </label>

            <div className="row">
              <div className="col-sm-6">
                <label className="form-label w-100">
                  Priority
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(event) =>
                      updateForm("priority", event.target.value)
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
              </div>

              <div className="col-sm-6">
                <label className="form-label w-100">
                  Status
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value)
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </label>
              </div>
            </div>

            <label className="form-label w-100">
              Due date
              <input
                className="form-control"
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  updateForm("dueDate", event.target.value)
                }
              />
            </label>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn create-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingTask
                  ? "Save Changes"
                  : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {viewTask && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewTask(null);
            }
          }}
        >
          <div className="task-modal">
            <div className="modal-heading d-flex justify-content-between align-items-center">
              <h2>Task Details</h2>
              <button
                type="button"
                className="btn-close"
                onClick={() => setViewTask(null)}
                aria-label="Close"
              />
            </div>

            <h5>{viewTask.title}</h5>
            <p className="text-secondary">
              {viewTask.description || "No description provided."}
            </p>
            <p>
              <strong>Priority:</strong> {viewTask.priority || "MEDIUM"}
            </p>
            <p>
              <strong>Status:</strong> {getStatus(viewTask.status)}
            </p>
            <p>
              <strong>Due date:</strong> {formatDate(viewTask.dueDate)}
            </p>

            <button
              type="button"
              className="btn create-button"
              onClick={() => setViewTask(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
