// Анонимная функция. Глобальные переманные не будут доступны извне.
(function () {
  // =======================================================================================
  // Глобальные переменные
  // Можно хранить или не хранить данные на глобальном уровне.
  // Если данные лежат на сервере, то можно ничего не хранить на локальном уровне,
  // а просто отправлять запрос на сервер, и отправлять данные в DOM.
  const todoList = document.querySelector(".todo-list");
  const userSelect = document.querySelector(".todo-form__userSelect");
  const form = document.querySelector(".todo-form");
  let todos = [];
  let users = [];

  // =======================================================================================
  // Привязка событий

  // Событие при загрузке страницы приложения
  document.addEventListener("DOMContentLoaded", initApp);

  // Событие формы
  form.addEventListener("submit", handleSubmit);

  // =======================================================================================
  // Базовая логика.

  // Получаем имя пользователя
  function getUserName(userId) {
    const user = users.find((u) => u.id === userId);
    return user.name;
  }

  // Динамическая отрисовка списка задач.
  function showTodo({ id, userId, title, completed }) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = id;
    li.innerHTML = `<span>${title} <br> <i>by</i> <b>${getUserName(userId)}</b></span>`;

    const status = document.createElement("input");
    status.type = "checkbox";
    status.checked = completed;
    status.addEventListener("change", handleTodoChange);

    const close = document.createElement("span");
    close.innerHTML = "&times"; // Спецсимвол Х (крестик)
    close.className = "close";
    close.addEventListener("click", handleClose);

    // Добавляем элементы на страницу
    todoList.prepend(li);
    li.prepend(status);
    li.append(close);
  }

  // Получение списка пользователей в тег select
  function createUserOption(user) {
    const option = document.createElement("option");
    option.value = user.id;
    option.innerText = user.name;

    userSelect.append(option);
  }

  // Удаление задачи из списка
  function removeTodo(todoId) {
    todos = todos.filter((todo) => todo.id !== todoId);

    // Обращаемся к дата-атрибуту
    const todo = todoList.querySelector(`[data-id='${todoId}']`);
    todo.querySelector("input").removeEventListener("change", handleTodoChange);
    todo.querySelector(".close").removeEventListener("click", handleClose);

    todo.remove();
  }

  // Обработка ошибок
  function alertError(error) {
    alert(error.message);
  }

  // =======================================================================================
  // Обработка событий
  function initApp() {
    // Получение данных. Обработка всех запросов, получение всех данных.
    // Получаем массив values, который можно деструктурировать.
    Promise.all([getAllTodos(), getAllUsers()]).then((values) => {
      [todos, users] = values;

      // Добавление данных в разметку
      todos.forEach((todo) => showTodo(todo));
      users.forEach((user) => createUserOption(user));
    });
  }

  // Отправка данных на сервер
  function handleSubmit(event) {
    // Отменяем автоматическую перезагрузку страницы
    event.preventDefault();

    // Проверяем вывод данных на страницу
    // console.log(form.todo.value);
    // console.log(form.user.value);

    // Создаем новую задачу
    createTodo({
      // Приводим значение идентификатора пользователя к числу
      userId: Number(form.user.value),
      title: form.todo.value,
      completed: false,
    });
  }

  // Изменение статуса задач
  function handleTodoChange() {
    const todoId = this.parentElement.dataset.id;
    const complited = this.checked;

    toggleTodoComplete(todoId, complited);
  }

  // Удаление задачи
  function handleClose() {
    const todoId = this.parentElement.dataset.id;
    deleteTodo(todoId);
  }

  // =======================================================================================
  // Асинхронная логика

  // Получение списка задач
  async function getAllTodos() {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=15");
      const data = await response.json();

      return data;
    } catch (error) {
      alertError(error);
    }
  }

  // Получение списка пользователей
  async function getAllUsers() {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");

      const data = await response.json();

      return data;
    } catch (error) {
      alertError(error);
    }
  }

  // Отправка данных на сервер
  async function createTodo(todo) {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
        // Отправка данных
        method: "POST",
        // Тело запроса
        body: JSON.stringify(todo),
        // Ответ от сервера в формате json
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Получаем вновь созданную задачу с сервера
      const newTodo = await response.json();

      // Проверяем ответ с сервера
      console.log(newTodo);

      // Отрисовка новой задачи на странице
      showTodo(newTodo);
    } catch (error) {
      alertError(error);
    }
  }

  // Функция для изменения тсатуса задачи
  async function toggleTodoComplete(todoId, completed) {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
        method: "PATCH",
        // body: JSON.stringify({completed: completed}),
        // Так как ключ и значение имеют одинаковые имена, то запись можно сократить
        body: JSON.stringify({ completed }),
        // Набор заголовков
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error("Failed server connect! Please try again later.");
      }
    } catch (error) {
      alertError(error);
    }
  }

  // Функция удаления задачи
  async function deleteTodo(todoId) {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        removeTodo(todoId);
      } else {
        throw new Error("Failed server connect! Please try again later.");
      }
    } catch (error) {
      alertError(error);
    }
  }
})();
