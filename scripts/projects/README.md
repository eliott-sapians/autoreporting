# Project-Based Task Management System

This directory contains the project-based task management system, designed to ensure systematic and organized development across multiple projects.

## 📁 File Structure

The new hierarchical structure supports multiple projects, each with their own task management:

```
scripts/projects/
├── README.md                    # This file - system documentation
├── task_template.md             # Template for creating new tasks
├── completed/                   # Archive of completed projects (optional)
├── project-name-1/             # Individual project directory
│   ├── task_overview.md        # Master list of numbered tasks for this project
│   ├── next_task.md            # Current task focus for this project
│   ├── task_1.md               # Detailed task specifications
│   ├── task_2.md
│   ├── task_X.md
│   └── completed/              # Completed tasks for this project (optional)
└── project-name-2/             # Another project directory
    ├── task_overview.md
    ├── next_task.md
    └── task_X.md
```

### Core Files (Per Project)

- **`task_overview.md`** - Master list of all numbered tasks with status and dependencies
- **`next_task.md`** - Current task the AI should focus on for this project
- **`task_X.md`** - Detailed specifications for each numbered task
- **`completed/`** - Archive of completed tasks (optional)

## 🤖 AI Integration

The AI assistant **MUST** follow this workflow:

### Before Starting Work
1. **Identify the target project** (check user context or ask for clarification)
2. Check `scripts/projects/[project-name]/next_task.md` for current focus
3. Read the detailed task file (`scripts/projects/[project-name]/task_X.md`)
4. Verify all dependencies are met within the project context
5. Update task status to "in-progress"

### During Work
- Update checklists as progress is made
- Add new requirements as discovered
- Update file lists with created/modified files
- Document any blockers immediately
- Note any cross-project dependencies that emerge

### After Completing Work
- Mark task as completed in `task_overview.md`
- Update `next_task.md` to next priority
- Unblock dependent tasks within the project
- Generate new tasks if needed
- Update any cross-project dependencies

## 🏗️ Project Management

### Creating a New Project
1. Create new directory: `scripts/projects/[project-name]/`
2. Copy `task_template.md` to create initial `task_1.md`
3. Create `task_overview.md` with initial task list
4. Create `next_task.md` pointing to the first task
5. Document any dependencies on other projects

### Working Across Projects
- **Cross-project dependencies**: Document in both projects' task files
- **Shared resources**: Note in relevant task descriptions
- **Priority management**: Focus on one project at a time unless explicitly coordinating

## 📋 Task File Formats

### Task Overview Format
```markdown
### X. Task Name
- **Status**: [pending/in-progress/completed]
- **Priority**: [High/Medium/Low]
- **Dependencies**: [Task numbers or "None"]
- **Cross-Project Dependencies**: [Other projects/tasks or "None"]
- **Description**: Brief description
- **Detail File**: [task_X.md](mdc:scripts/projects/[project-name]/task_X.md)
```

### Detailed Task Format
Each `task_X.md` file contains:
- Overview and status
- Detailed requirements with checklists
- Technical implementation plans
- Files to create/modify
- Testing requirements
- Definition of done
- Dependencies and related tasks
- Cross-project considerations

## 🔄 Workflow Examples

### Creating a New Task (Within Project)
1. Navigate to project directory: `scripts/projects/[project-name]/`
2. Copy `../task_template.md` to `task_X.md` (next available number)
3. Fill in all sections with specific requirements
4. Add to `task_overview.md` with proper dependencies
5. Update `next_task.md` if this becomes priority

### Completing a Task
1. Ensure all checklist items are marked `[x]`
2. Update status to "completed" in project's `task_overview.md`
3. Move detailed file to project's `completed/` (optional)
4. Update project's `next_task.md` to next priority task
5. Update any dependent tasks that are now unblocked
6. Check for cross-project impacts and update accordingly

### Switching Between Projects
1. Complete current task or reach a good stopping point
2. Update current project's `next_task.md` with current status
3. Navigate to new project directory
4. Check new project's `next_task.md` for focus
5. Update AI context with new project priorities

## 🎯 Best Practices

### Task Creation
- Keep tasks focused and manageable (8-24 hours)
- Include specific, testable requirements
- Define clear dependencies (both within and across projects)
- Provide detailed implementation guidance
- Document cross-project implications

### Project Management
- Maintain clear project boundaries
- Document shared resources and dependencies
- Keep project scopes focused and distinct
- Regular sync between related projects

### Task Management
- Always work on highest priority unblocked task
- Update progress regularly during work
- Document discoveries and changes immediately
- Don't skip ahead to blocked tasks
- Consider cross-project impacts

### File Maintenance
- Keep file lists accurate with actual paths
- Update checklists as work progresses
- Maintain consistent formatting across projects
- Use MDC links for file references
- Keep project directories organized

## 🚫 Common Mistakes to Avoid

- Starting work without checking project-specific task files
- Working on tasks with unmet dependencies
- Not updating progress during implementation
- Forgetting to update `next_task.md` after completion
- Creating vague or untestable requirements
- Ignoring cross-project dependencies
- Mixing tasks from different projects without clear coordination

## 🔧 Integration with Development

### File References
Use MDC format for all file links with project context:
- `[task_1.md](mdc:scripts/projects/[project-name]/task_1.md)`
- `[component.tsx](mdc:app/components/component.tsx)`

### Code Implementation
- Reference task requirements for specifications
- Update task checklists as features are built
- Note deviations from planned implementation
- Keep file lists synchronized with actual code
- Document any code that affects multiple projects

### Testing
- Include test requirements in task definitions
- Specify test types and coverage needs
- Update test status in task checklists
- Link to test files when created
- Consider integration testing across projects

### Cross-Project Coordination
- Document shared utilities and components
- Note API contracts between projects
- Track dependencies and version compatibility
- Coordinate breaking changes across projects

---

This system ensures organized, trackable, and efficient development by making project-based task management a core part of the development workflow. Each project maintains its own focused task system while supporting coordination across the entire codebase. 