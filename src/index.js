const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkIfUsernameIsValid(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found :(" })
  }
  request.user = user;
  return next();
}

function checkIfTodoExists(request, response, next) {
  const { user } = request;
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    return response.status(404).json({ error: "Todo not found :(" })
  }
  request.todo = todo
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "This username already exists" });
  }

  users.push({
    username,
    name,
    id: uuidv4(),
    todos: [],
  });

  return response.status(201).json({ message: 'User successfully created' })
});

app.get('/todos', checkIfUsernameIsValid, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checkIfUsernameIsValid, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo)
  return response.status(201).json({ id: todo.id })

});

app.put('/todos/:id', checkIfUsernameIsValid, checkIfTodoExists, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(200).json({ mesage: 'Todo updated successfully' })
});

app.patch('/todos/:id/done', checkIfUsernameIsValid, checkIfTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;
  return response.status(200).json(todo)
});

app.delete('/todos/:id', checkIfUsernameIsValid, checkIfTodoExists, (request, response) => {
  const { todo } = request;
  const { user } = request;

  user.todos.splice(user.todos.indexOf(todo), 1)
  
  return response.status(200).json(todo);
});

module.exports = app;