import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../interfaces/todo';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private baseUrl = 'http://localhost:3001';
  constructor(private http: HttpClient) {

  }

  getTodosList() {
    return this.http.get<Todo[]>(`${this.baseUrl}/todos`);
  }
  addTodo(todo: Todo) {
    return this.http.post(`${this.baseUrl}/todos`, todo);
  }
  updateTodo(todo: Todo) {
    return this.http.patch(`${this.baseUrl}/todos/${todo.id}`, todo);
  }
  deleteTodo(id: Todo['id']) {
    return this.http.delete(`${this.baseUrl}/todos/${id}`);
  }
}
