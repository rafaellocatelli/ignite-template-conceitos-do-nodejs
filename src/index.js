const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(e => e.username === username)

  if(!user) { return response.status(404).json({ error: 'Mensagem do erro' })}

  request.user = user
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const verifyUsername = users.some(e => e.username === username)

  if(verifyUsername) { return response.status(400).json({ error: 'Mensagem de erro' })}

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const todoFounded = user.todos.find(e => e.id === id)

  if(!todoFounded) { return response.status(404).json({ error: 'Mensagem do erro' })}
  
  todoFounded.title = title
  todoFounded.deadline = new Date(deadline)

  return response.json(todoFounded)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoFounded = user.todos.find(e => e.id === id)

  if(!todoFounded) { return response.status(404).json({ error: 'Mensagem do erro' })}
  
  todoFounded.done = true

  return response.json(todoFounded)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(e => e.id === id)
  if(todoIndex === -1) { return response.status(404).json({ error: 'Todo not found' })}

  user.todos.splice(todoIndex, 1)

  return response.status(204).json()
});

module.exports = app;