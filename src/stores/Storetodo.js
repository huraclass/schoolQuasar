import { defineStore } from "pinia";
import { uid } from "quasar";
import { LocalStorage } from 'quasar'
export default defineStore("useTodo", {

  state:()=>({
    lists:[],
  }),

  getters : {

  },

  actions: {

    insertStore(title){
      // db에 넣기 return id
      if(this.lists){
        this.lists.push({
          id: uid(),
          title,
          done:'N'
        });
      }else{
        this.lists=[];
        this.lists.push({
          id: uid(),
          title,
          done:'N'
        })
      }
    },

    pop() {
      return this.lists[this.lists.length -  1];
    },


    listStore(){
      return this.lists;
    },
    removeStore(id){

      const idx = this.lists.findIndex(task=>task.id == id);
      //삭제 array.splice(시작 index, 제거 index, 추가 요소)
      this.lists.splice(idx,1);
    },

    editStore(item){
      //배열에서 수정하되 done은 'n'으로
      const idx = this.lists.findIndex(task=>task == item);
      item.done = 'N';
      this.lists.splice(idx,1,item);
      LocalStorage.set("todo", this.lists);
    }
  }
})
