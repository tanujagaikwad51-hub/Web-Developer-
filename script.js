/* =========================================
   TO-DO LIST APPLICATION
========================================= */

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const prioritySelect = document.getElementById("prioritySelect");
const dueDate = document.getElementById("dueDate");
const searchInput = document.getElementById("searchInput");
const darkModeBtn = document.getElementById("darkModeBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const sortSelect = document.getElementById("sortSelect");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* Remove invalid saved tasks */
tasks = tasks.filter(function (task) {
    return task &&
        typeof task === "object" &&
        typeof task.text === "string";
});


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


/* =========================================
   SHOW TASKS
========================================= */

function showTasks() {

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    /* Search */
    if (searchInput) {

        const searchText = searchInput.value.toLowerCase().trim();

        if (searchText !== "") {
            filteredTasks = filteredTasks.filter(function (task) {
                return task.text.toLowerCase().includes(searchText);
            });
        }
    }


    /* Filter */
    const activeFilter =
        document.querySelector(".filters button.active");

    if (activeFilter) {

        const filter = activeFilter.dataset.filter;

        if (filter === "active") {
            filteredTasks = filteredTasks.filter(function (task) {
                return !task.completed;
            });
        }

        if (filter === "completed") {
            filteredTasks = filteredTasks.filter(function (task) {
                return task.completed;
            });
        }
    }


    /* Sort */
    if (sortSelect) {

        const sortValue = sortSelect.value;

        if (sortValue === "priority") {

            const priorityOrder = {
                High: 1,
                Medium: 2,
                Low: 3
            };

            filteredTasks.sort(function (a, b) {

                return (
                    (priorityOrder[a.priority] || 4) -
                    (priorityOrder[b.priority] || 4)
                );

            });
        }

        if (sortValue === "dueDate") {

            filteredTasks.sort(function (a, b) {

                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;

                return new Date(a.dueDate) - new Date(b.dueDate);

            });
        }
    }


    /* Create task elements */

    filteredTasks.forEach(function (task) {

        const li = document.createElement("li");

        const taskText = document.createElement("span");

        taskText.textContent = task.text;

        if (task.completed) {
            taskText.style.textDecoration = "line-through";
            taskText.style.opacity = "0.6";
        }

        taskText.setAttribute("tabindex", "0");
        taskText.setAttribute("role", "button");

        taskText.addEventListener("click", function () {
            toggleTask(task.id);
        });

        taskText.addEventListener("keydown", function (event) {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();
                toggleTask(task.id);

            }

        });


        /* Priority */

        const priority = document.createElement("span");

        priority.textContent = task.priority || "Low";

        priority.classList.add(
            "priority",
            (task.priority || "Low").toLowerCase()
        );


        /* Due Date */

        const date = document.createElement("span");

        if (task.dueDate) {

            date.textContent = task.dueDate;
            date.classList.add("due-date");

        }


        /* Edit button */

        const editBtn = document.createElement("button");

        editBtn.textContent = "Edit";
        editBtn.type = "button";

        editBtn.addEventListener("click", function () {
            editTask(task.id);
        });


        /* Delete button */

        const deleteBtn = document.createElement("button");

        deleteBtn.textContent = "Delete";
        deleteBtn.type = "button";

        deleteBtn.addEventListener("click", function () {
            deleteTask(task.id);
        });


        li.appendChild(taskText);
        li.appendChild(priority);

        if (task.dueDate) {
            li.appendChild(date);
        }

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);

    });


    updateTaskCounter();
    updateProgress();
}


/* =========================================
   ADD TASK
========================================= */

function addTask() {

    if (!taskInput) {
        return;
    }

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task.");
        taskInput.focus();
        return;
    }

    const task = {

        id: Date.now(),

        text: text,

        completed: false,

        priority: prioritySelect
            ? prioritySelect.value
            : "Low",

        dueDate: dueDate
            ? dueDate.value
            : ""

    };


    tasks.push(task);

    saveTasks();

    taskInput.value = "";

    if (dueDate) {
        dueDate.value = "";
    }

    showTasks();

    taskInput.focus();
}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {
            task.completed = !task.completed;
        }

        return task;

    });

    saveTasks();

    showTasks();
}


/* =========================================
   EDIT TASK
========================================= */

function editTask(id) {

    const task = tasks.find(function (task) {
        return task.id === id;
    });

    if (!task) {
        return;
    }


    const newText = prompt(
        "Edit task:",
        task.text
    );

    if (newText === null) {
        return;
    }

    const cleanText = newText.trim();

    if (cleanText === "") {
        alert("Task cannot be empty.");
        return;
    }

    task.text = cleanText;


    const newPriority = prompt(
        "Priority: High, Medium or Low",
        task.priority || "Low"
    );

    if (newPriority !== null) {

        const priorityValue =
            newPriority.trim().toLowerCase();

        if (priorityValue === "high") {
            task.priority = "High";
        }
        else if (priorityValue === "medium") {
            task.priority = "Medium";
        }
        else if (priorityValue === "low") {
            task.priority = "Low";
        }

    }


    const newDueDate = prompt(
        "Due date (YYYY-MM-DD):",
        task.dueDate || ""
    );

    if (newDueDate !== null) {
        task.dueDate = newDueDate.trim();
    }


    saveTasks();

    showTasks();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });

    saveTasks();

    showTasks();
}


/* =========================================
   TASK COUNTER
========================================= */

function updateTaskCounter() {

    const taskCounter =
        document.getElementById("taskCounter");

    if (!taskCounter) {
        return;
    }

    const total = tasks.length;

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;

    taskCounter.textContent =
        `Total: ${total} | Completed: ${completed} | Remaining: ${total - completed}`;
}


/* =========================================
   PROGRESS BAR
========================================= */

function updateProgress() {

    const progressFill =
        document.getElementById("progressFill");

    const progressText =
        document.getElementById("progressText");

    if (!progressFill) {
        return;
    }

    if (tasks.length === 0) {

        progressFill.style.width = "0%";

        if (progressText) {
            progressText.textContent = "0%";
        }

        return;
    }


    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;


    const percentage =
        Math.round((completed / tasks.length) * 100);


    progressFill.style.width =
        percentage + "%";


    if (progressText) {
        progressText.textContent =
            percentage + "%";
    }
}


/* =========================================
   FILTER BUTTONS
========================================= */

const filterButtons =
    document.querySelectorAll(".filters button");

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        showTasks();

    });

});


/* =========================================
   EVENT LISTENERS
========================================= */

if (addTaskBtn && taskInput) {

    addTaskBtn.addEventListener(
        "click",
        addTask
    );

    taskInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                addTask();
            }

        }
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        showTasks
    );

}


if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        showTasks
    );

}


if (clearAllBtn) {

    clearAllBtn.addEventListener(
        "click",
        function () {

            if (tasks.length === 0) {
                alert("There are no tasks to clear.");
                return;
            }


            const confirmClear =
                confirm("Are you sure you want to clear all tasks?");

            if (!confirmClear) {
                return;
            }


            tasks = [];

            saveTasks();

            showTasks();

        }
    );

}


/* =========================================
   DARK MODE
========================================= */

if (darkModeBtn) {

    darkModeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );


            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(
                "darkMode",
                isDark
            );


            darkModeBtn.textContent =
                isDark
                    ? "☀️ Light Mode"
                    : "🌙 Dark Mode";

        }
    );


    const savedDarkMode =
        localStorage.getItem("darkMode");


    if (savedDarkMode === "true") {

        document.body.classList.add(
            "dark-mode"
        );

        darkModeBtn.textContent =
            "☀️ Light Mode";
    }

}


/* =========================================
   START TODO APP ONLY IF IT EXISTS
========================================= */

if (taskList) {
    showTasks();
}


/* =========================================
   CONTACT FORM VALIDATION
========================================= */

const contactForm =
    document.getElementById("contactForm");


if (contactForm) {

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const messageInput =
        document.getElementById("message");

    const nameError =
        document.getElementById("name-error");

    const emailError =
        document.getElementById("email-error");

    const messageError =
        document.getElementById("message-error");

    const formStatus =
        document.getElementById("form-status");


    function showError(
        input,
        errorElement,
        message
    ) {

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (input) {
            input.setAttribute(
                "aria-invalid",
                "true"
            );
        }

    }


    function clearError(
        input,
        errorElement
    ) {

        if (errorElement) {
            errorElement.textContent = "";
        }

        if (input) {
            input.removeAttribute(
                "aria-invalid"
            );
        }

    }


    /* Name validation */

    if (nameInput) {

        nameInput.addEventListener(
            "input",
            function () {

                if (nameInput.value.trim() === "") {

                    showError(
                        nameInput,
                        nameError,
                        "Please enter your name."
                    );

                }
                else {

                    clearError(
                        nameInput,
                        nameError
                    );

                }

            }
        );

    }


    /* Email validation */

    if (emailInput) {

        emailInput.addEventListener(
            "input",
            function () {

                const email =
                    emailInput.value.trim();


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (email === "") {

                    showError(
                        emailInput,
                        emailError,
                        "Please enter your email address."
                    );

                }
                else if (!emailPattern.test(email)) {

                    showError(
                        emailInput,
                        emailError,
                        "Please enter a valid email address."
                    );

                }
                else {

                    clearError(
                        emailInput,
                        emailError
                    );

                }

            }
        );

    }


    /* Message validation */

    if (messageInput) {

        messageInput.addEventListener(
            "input",
            function () {

                if (
                    messageInput.value.trim() === ""
                ) {

                    showError(
                        messageInput,
                        messageError,
                        "Please enter your message."
                    );

                }
                else {

                    clearError(
                        messageInput,
                        messageError
                    );

                }

            }
        );

    }


    /* Submit */

    contactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            let valid = true;


            /* Name */

            if (
                !nameInput ||
                nameInput.value.trim() === ""
            ) {

                showError(
                    nameInput,
                    nameError,
                    "Please enter your name."
                );

                valid = false;

            }
            else {

                clearError(
                    nameInput,
                    nameError
                );

            }


            /* Email */

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (email === "") {

                showError(
                    emailInput,
                    emailError,
                    "Please enter your email address."
                );

                valid = false;

            }
            else if (!emailPattern.test(email)) {

                showError(
                    emailInput,
                    emailError,
                    "Please enter a valid email address."
                );

                valid = false;

            }
            else {

                clearError(
                    emailInput,
                    emailError
                );

            }


            /* Message */

            if (
                !messageInput ||
                messageInput.value.trim() === ""
            ) {

                showError(
                    messageInput,
                    messageError,
                    "Please enter your message."
                );

                valid = false;

            }
            else {

                clearError(
                    messageInput,
                    messageError
                );

            }


            /* Result */

            if (!valid) {

                if (formStatus) {
                    formStatus.textContent =
                        "Please correct the errors above.";
                }

                return;
            }


            if (formStatus) {

                formStatus.textContent =
                    "Your message has been submitted successfully.";

            }


            contactForm.reset();

        }
    );

}