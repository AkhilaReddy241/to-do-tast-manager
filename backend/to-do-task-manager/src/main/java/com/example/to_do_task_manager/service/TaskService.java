
package com.example.to_do_task_manager.service;

import com.example.to_do_task_manager.model.Task;
import com.example.to_do_task_manager.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> getAll(String search, String status, String priority) {
        return repository.findAll().stream()
                .filter(task -> search == null || search.isBlank()
                        || task.getTitle().toLowerCase()
                        .contains(search.trim().toLowerCase()))
                .filter(task -> status == null || status.isBlank()
                        || status.equalsIgnoreCase("ALL")
                        || task.getStatus().equalsIgnoreCase(status))
                .filter(task -> priority == null || priority.isBlank()
                        || priority.equalsIgnoreCase("ALL")
                        || task.getPriority().equalsIgnoreCase(priority))
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .toList();
    }

    public Task create(Task task) {
        task.setId(null);
        validate(task);
        return repository.save(task);
    }

    public Task update(Long id, Task incoming) {
        Task existing = getById(id);

        existing.setTitle(incoming.getTitle());
        existing.setDescription(incoming.getDescription());

        if (incoming.getPriority() != null) {
            existing.setPriority(incoming.getPriority());
        }
        if (incoming.getStatus() != null) {
            existing.setStatus(incoming.getStatus());
        }
        if (incoming.getCreatedBy() != null) {
            existing.setCreatedBy(incoming.getCreatedBy());
        }
        if (incoming.getDateAssigned() != null) {
            existing.setDateAssigned(incoming.getDateAssigned());
        }
        existing.setDueDate(incoming.getDueDate());

        validate(existing);
        return repository.save(existing);
    }

    public Task updateStatus(Long id, String status) {
        Task task = getById(id);

        if (status == null ||
                !(status.equalsIgnoreCase("PENDING")
                        || status.equalsIgnoreCase("COMPLETED"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be PENDING or COMPLETED"
            );
        }

        task.setStatus(status);
        return repository.save(task);
    }

    public void delete(Long id) {
        Task task = getById(id);
        repository.delete(task);
    }

    private Task getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Task not found"));
    }

    private void validate(Task task) {
        if (task.getTitle() == null || task.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Task title is required");
        }
        if (task.getTitle().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Title must not exceed 150 characters");
        }
    }
}

