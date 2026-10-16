
package com.example.to_do_task_manager.repository;

import com.example.to_do_task_manager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
