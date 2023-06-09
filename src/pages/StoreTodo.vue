<template>
  <q-page class="bg-grey-3 column">
    <div class="row q-pa-sm bg-primary">
      <q-input
        v-model="newTask"
        @keyup.enter="addDbTask"
        class="col"
        bg-color="white"
        filled
        aria-placeholder="Add task"
        dense
      >
        <template v-slot:append>
          <q-btn @click="addDbTask" round dense flat icon="add"></q-btn>
        </template>
      </q-input>
    </div>

    <!--reset btn-->
    <q-btn label="reset" @click="resetDb"></q-btn>
    <!--list-->
    <q-list class="bg-white" separator bordered>
      <q-item
        v-for="item in lists"
        :key="item.title"
        @click="item.done = item.done == 'Y' ? 'N' : 'Y'"
        :class="{ 'done bg-blue-1': item.done == 'Y' }"
        v-ripple
        clickable
      >
        <q-item-section avatar>
          <q-checkbox
            v-model="item.done"
            color="primary"
            class="no-pointer-event"
            true-value="Y"
            false-value="N"
            dense
          ></q-checkbox>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
        </q-item-section>
        <q-item-section v-if="item.done == 'Y'" side>
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="edit"
            @click.stop="openDialog(item)"
          >
          </q-btn>
        </q-item-section>
        <q-item-section v-if="item.done == 'Y'" side>
          <q-btn
            flat
            round
            dense
            color="red"
            icon="delete"
            @click.stop="removeDBItem(item)"
          ></q-btn>
        </q-item-section>
      </q-item>
      <!--https://quasar.dev/vue-directives/intersection#intersection-api  //observed element-->
      <div v-intersection="onIntersection" v-if="lists.length"></div>
      <div v-intersection="onIntersection" v-if="this.listStore()"></div>

    </q-list>
    <!--no list-->
    <div v-if="!lists.length" class="no-tasks absolute-center">
      <q-icon name="check" size="100px" color="primary" />
      <div class="text-h5 text-primary text-center">No tasks</div>
    </div>
    <DialogCustom
      ref="dialog"
      :edit-task="editTask"
      :origin="origin"
      @onInput="editDBTodo"
    >
    </DialogCustom>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import todoApi from "src/apis/todoApi";
import useTodoStore from "src/stores/Storetodo";
import { mapActions, mapState } from "pinia";
import DialogCustom from "components/DialogCustom.vue";

export default defineComponent({
  name: "Todo",
  title: "DB Todo list",
  components: { DialogCustom },
  data() {
    return {
      newTask: "",
      tasks: [],
      totalCount: 0,
      origin: null,
      editTask: null,
    };
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    ...mapState(useTodoStore, ["lists"]),
  },
  methods: {
    ...mapActions(useTodoStore, ["insertStore","listStore","removeStore","editStore","pop"]),
    //추가

    async addDbTask() {
      if (!this.newTask) {
        this.$refs.list.focus(); //포커스 외부로 돌림
      }
      const payload = {
        title: this.newTask,
      };
      //저장
      const result = await todoApi.create(payload);

      this.insertStore(payload.title);

      console.log(payload);
      if (result.status == 200) {

        if (result.data.id) {
          //this.insertStore(result);
          this.totalCount++;
        }
        await this.$q.notify({
          message: `${this.newTask} 추가하셨습니다`,
          icon: "home",
          color: "primary",
        });
        this.newTask = "";
      }

    },

    //목록가져오기
    async fetchData() {
      const len = 5;
      let list = this.listStore();
      //const lastI = this.tasks.length ? this.tasks[this.tasks.length - 1].id : 0;//여기를 store버전으로 바꾸기
      const lastId = list.length ? list[list.length - 1].id : 0;
      if (list.length > 0 && list.length == this.totalCount) {//여기도
        console.log("fetchData 호출안함", list.length, this.totalCount);
        return false;
      }
      const payload = {
        lastId,
        len,
      };
      const result = await todoApi.list(payload);
      if (result.data.list) {
        //this.tasks = [...this.tasks, ...result.data.list];
        list = [...list,...result.data.list];
        this.totalCount = result.data.totalCount;
      }
      // this.tasks = [];
      // this.totalCount = 0;
    },

    async editDBTodo(item) {
      //배열에서 수정하되 done은 'n'으로
      let list = this.listStore();
      //const idx = this.tasks.findIndex((task) => task == item);
      const idx = list.findIndex((task) => task == item);
      item.done = "N";
      //this.tasks.splice(idx, 1, item);
      list.splice(idx, 1, item);
      this.editStore(idx,item);
      if (this.editTask.title != this.origin) {
        //타이틀이 다를때만 수정
        await todoApi.update(item);
        await this.$q.notify({
          message: `${item.title} 수정하셨습니다`,
          icon: "home",
          color: "primary",
        });
      }
    },

    //삭제
    async removeDBItem(item) {
      this.removeStore(item.id);
      const result = await todoApi.remove(item);

      if (result.status == 200) {
        await this.$q.notify({
          message: `${item.title} 삭제하셨습니다`,
          icon: "home",
          color: "primary",
        });
      }

    },

    //intersection
    async onIntersection(entry) {
      if (entry.isIntersecting) {
        this.$q.loading.show();
        await this.fetchData();
        this.$q.loading.hide();
      }
    },
    //다이얼로그 열기
    openDialog(item) {
      this.$refs.dialog.dialog = true;
      this.editTask = item;
      this.origin = this.editTask.title;
    },
    //수정


    //더미리스트 만들기
    async resetDb() {
      const payload = {
        title: "todo_",
        done: "N",
        len: 100,
      };
      const result = await todoApi.reset(payload);
      if (result.status == 200) {
        console.log(result.status);
        this.fetchData();
      }
    },
  },
});
</script>

<style lang="scss">
.done {
  .q-item__label {
    text-decoration: line-through;
    color: #bbb;
  }
}
.no-tasks {
  opacity: 0.5;
}
</style>
