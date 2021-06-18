import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { GET_MY_TODOS } from "./TodoPrivateList";

const ADD_TODO = gql`
  mutation addTodos($todo: String!, $isPublic: Boolean!) {
    insert_todos(objects: [{ title: $todo, is_public: $isPublic }]) {
      affected_rows
      returning {
        id
        title
        created_at
        is_completed
      }
    }
  }
`;

const TodoInput = ({ isPublic = false }) => {
  const [todoInput, setTodoInput] = useState('');

  // If this is for the public feed, do nothing
  const updateCache = (cache, { data }) => {
    if (isPublic) return;

    // Fetch the todos from the cache
    const existingTodos = cache.readQuery({
      query: GET_MY_TODOS
    });

    // Add the new todo to the cache
    const newTodo = data.insert_todos.returning[0];
    cache.writeQuery({
      query: GET_MY_TODOS,
      data: { todos: [newTodo, ...existingTodos.todos] }
    });
  };

  const resetInput = () => {
    setTodoInput("");
  }

  const [addTodo] = useMutation(ADD_TODO, {
    update: updateCache,
    onCompleted: resetInput
  });

  return (
    <form
      className="formInput"
      onSubmit={e => {
        e.preventDefault();
        addTodo({ variables: { todo: todoInput, isPublic } });
      }}
    >
      <input
        className="input"
        placeholder="What needs to be done?"
        value={todoInput}
        onChange={e => setTodoInput(e.target.value)}
      />
      <i className="inputMarker fa fa-angle-right" />
    </form>
  );
};

export default TodoInput;
