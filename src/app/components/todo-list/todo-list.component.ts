import { Component, OnInit, ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../interfaces/todo';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  imports: [ CardModule ,
    ButtonModule ,
    RouterLink ,
    TableModule ,
    CheckboxModule ,
    FormsModule ,
    InputTextModule,
    FloatLabel],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css'
})
export class TodoListComponent implements OnInit{
  @ViewChild('todoTask') todoTask: any;
  task = '';
  todos : Todo[] = [];


  constructor(private appService : TodoService){}

   ngOnInit(): void {
       this.getList();
   }
   getList(){
     this.appService.getTodosList().subscribe(
      Response => {
        this.todos = Response;
      }
     )
   }
  updateTodo(e : CheckboxChangeEvent , todo : Todo){
    this.appService.updateTodo({...todo , completed : e.checked}).subscribe(
      Response => {
        console.log(Response);
      }
    )
  }

  deleteTodo(e: unknown , id : Todo['id']){
    this.appService.deleteTodo(id).subscribe(
      Response => {
        this.getList();
      }
    )
  }

  addTodo(){
    this.appService.addTodo({task : this.task , completed : false}).subscribe(
      Response =>{
        this.todoTask.reset();
        this.getList();
      }
    )
  }
}
