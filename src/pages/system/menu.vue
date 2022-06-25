<template>
  <div>
    <t-card class="list-card-container">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button @click="openDrawer">
            <add-icon size="18px"/>
            新增菜单
          </t-button>
        </div>
        <t-input v-model="searchValue" class="search-input" placeholder="请输入菜单名称" clearable>
          <template #suffix-icon>
            <search-icon size="20px"/>
          </template>
        </t-input>
      </t-row>
      <div class="table-container">
        <t-enhanced-table
          row-key="menuId"
          :columns="columns"
          :data="menuData"
          :tree="{childrenKey: 'childrenList', checkStrictly: checkStrictly === 'true' ? true : false}"
          :selected-row-keys="selectedRowKeys"
          @select-change="rehandleSelectChange"
        >
          <template #menuType="{ row }">
            <t-tag v-if="row.menuType === 1" theme="success" variant="light">目录</t-tag>
            <t-tag v-if="row.menuType === 2" theme="danger" variant="light">菜单</t-tag>
            <t-tag v-if="row.menuType === 3" theme="warning" variant="light">按钮</t-tag>
          </template>

          <template #status="{ row }">
            <p v-if="row.status === 0" class="status unhealth">隐藏</p>
            <p v-if="row.status === 1" class="status">显示</p>
          </template>

          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickEdit(slotProps)">编辑</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps)">删除</a>
          </template>
        </t-enhanced-table>
      </div>
    </t-card>
    <t-form :data="formData" ref="form" @submit="onSubmit">
      <t-drawer :visible.sync="visibleDrawer" header="新增菜单" :size="drawerSize" :closeBtn="true">

        <t-form-item label="上级菜单" name="parentMenu" :rules="parentMenuRules">
          <t-tree-select
            :data="parentMenuOptions"
            v-model="formData.parentMenu"
            filterable
            clearable
            placeholder="请选择上级菜单"
          />
        </t-form-item>

        <t-form-item label="菜单类型" name="menuType" :rules="menuTypeRules">
          <t-radio-group
            name="menuType"
            v-model="formData.menuType"
            :options="menuTypeOptions"
          ></t-radio-group>
        </t-form-item>

        <t-form-item label="菜单名称" name="menuName" :rules="menuNameRules">
          <t-input v-model="formData.menuName" placeholder="请输入菜单名称"/>
        </t-form-item>

        <t-form-item label="请求路径" name="url" :rules="urlRules">
          <t-input v-model="formData.url" placeholder="请输入请求路径"/>
        </t-form-item>

        <t-form-item label="页面地址" name="path" :rules="pathRules">
          <t-input v-model="formData.path" placeholder="请输入页面地址"/>
        </t-form-item>

        <t-form-item label="菜单图标" name="icon" :rules="iconRules">
          <t-select
            placeholder="请选择"
            :autoWidth="true"
            v-model="formData.icon"
            :popupProps="{ overlayClassName: 'tdesign-demo-select__overlay-option' }"
          >
            <t-option
              v-for="item in options"
              :value="item.value"
              :label="item.label"
              :key="item.value"
            >
              <div class="tdesign-demo__user-option">
                <t-icon :name="item.label" size="20px"/>
              </div>

            </t-option>
            <div style="float: none; clear: both"></div>
          </t-select>
        </t-form-item>

        <t-form-item label="菜单状态" name="status" :rules="statusRules">
          <t-radio-group default-value="1" v-model="formData.status">
            <t-radio value="1">显示</t-radio>
            <t-radio value="0">隐藏</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="菜单排序" name="sort" :rules="sortRules">
          <t-input type="number" v-model="formData.sort"/>
        </t-form-item>

        <template #footer>
          <t-form-item>
            <t-button type="submit">确定</t-button>
            <t-button theme="default" variant="base" @click="visibleDrawer = false">取消</t-button>
          </t-form-item>
        </template>
      </t-drawer>
    </t-form>
    <t-dialog
      theme="warning"
      header="系统提示"
      body="确定删除该条菜单信息吗？"
      :visible.sync="deleteDialog"
      @confirm="onConfirmDelete"
      :onClose="onCloseDeleteDialog"
    >
    </t-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {EnhancedTable} from 'tdesign-vue';
import {SearchIcon, AddIcon} from 'tdesign-icons-vue';
import cloneDeep from 'lodash/cloneDeep';

const INITIAL_DATA = {
  parentMenu: 0,
  menuType: 1,
  menuName: '',
  url: '',
  path: '',
  icon: '',
  status: '1',
  sort: 100
};

export default Vue.extend({
  name: 'MenuIndex',
  components: {
    SearchIcon, AddIcon, TEnhancedTable: EnhancedTable
  },
  data() {
    let deleteMenuId;
    return {
      visibleDrawer: false,
      drawerSize: '600px',
      searchValue: '',
      parentMenuOptions: [],
      menuTypeOptions: [
        {
          value: 1,
          label: '目录',
        },
        {
          value: 2,
          label: '菜单',
        },
        {
          value: 3,
          label: '按钮',
        },
      ],
      formData: {...INITIAL_DATA},
      parentMenuRules: [{required: true, message: '上级菜单必选'}],
      menuTypeRules: [{required: true, message: '菜单类型必选'}],
      menuNameRules: [{required: true, message: '菜单名称不能为空'}],
      urlRules: [{required: true, message: '请求路径不能为空'}],
      pathRules: [{required: true, message: '页面地址不能为空'}],
      statusRules: [{required: true, message: '菜单状态必选'}],
      sortRules: [{required: true, message: '菜单排序不能为空'}],
      iconRules: [{required: true, message: '菜单图标必选'}],
      menuData: [],
      checkStrictly: 'true',
      selectedRowKeys: [],
      deleteDialog: false,
      deleteMenuId,
      columns: [
        {colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left'},
        {
          title: '菜单名称',
          align: 'left',
          width: 250,
          ellipsis: true,
          colKey: 'menuName',
          fixed: 'left',
        },
        {
          title: '菜单类型',
          width: 200,
          ellipsis: true,
          colKey: 'menuType',
        },
        {title: '菜单状态', colKey: 'status', width: 100, cell: {col: 'status'}},
        {
          title: '请求路径',
          width: 200,
          ellipsis: true,
          colKey: 'url',
        },
        {
          title: '页面地址',
          width: 300,
          ellipsis: true,
          colKey: 'path',
        },
        {
          title: '菜单排序',
          width: 200,
          ellipsis: true,
          colKey: 'sort',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      options: [
        {label: 'add-circle', value: 'add-circle'},
        {label: 'add-rectangle', value: 'add-rectangle'},
        {label: 'add', value: 'add'},
        {label: 'app', value: 'app'},
        {label: 'arrow-down-rectangle', value: 'arrow-down-rectangle'},
        {label: 'arrow-down', value: 'arrow-down'},
        {label: 'arrow-left', value: 'arrow-left'},
        {label: 'arrow-right', value: 'arrow-right'},
        {label: 'arrow-up', value: 'arrow-up'},
        {label: 'attach', value: 'attach'},
        {label: 'backtop-rectangle', value: 'backtop-rectangle'},
        {label: 'backtop', value: 'backtop'},
        {label: 'backward', value: 'backward'},
        {label: 'barcode', value: 'barcode'},
        {label: 'books', value: 'books'},
        {label: 'browse-off', value: 'browse-off'},
        {label: 'browse', value: 'browse'},
        {label: 'bulletpoint', value: 'bulletpoint'},
        {label: 'calendar', value: 'calendar'},
        {label: 'call', value: 'call'},
        {label: 'caret-down-small', value: 'caret-down-small'},
        {label: 'caret-down', value: 'caret-down'},
        {label: 'caret-left-small', value: 'caret-left-small'},
        {label: 'caret-left', value: 'caret-left'},
        {label: 'caret-right-small', value: 'caret-right-small'},
        {label: 'caret-right', value: 'caret-right'},
        {label: 'caret-up-small', value: 'caret-up-small'},
        {label: 'caret-up', value: 'caret-up'},
        {label: 'cart', value: 'cart'},
        {label: 'chart-bar', value: 'chart-bar'},
        {label: 'chart-bubble', value: 'chart-bubble'},
        {label: 'chart-pie', value: 'chart-pie'},
        {label: 'chart', value: 'chart'},
        {label: 'chat', value: 'chat'},
        {label: 'check-circle-filled', value: 'check-circle-filled'},
        {label: 'check-circle', value: 'check-circle'},
        {label: 'check-rectangle-filled', value: 'check-rectangle-filled'},
        {label: 'check-rectangle', value: 'check-rectangle'},
        {label: 'check', value: 'check'},
        {label: 'chevron-down-circle', value: 'chevron-down-circle'},
        {label: 'chevron-down-rectangle', value: 'chevron-down-rectangle'},
        {label: 'chevron-down', value: 'chevron-down'},
        {label: 'chevron-left-circle', value: 'chevron-left-circle'},
        {label: 'chevron-left-double', value: 'chevron-left-double'},
        {label: 'chevron-left-rectangle', value: 'chevron-left-rectangle'},
        {label: 'chevron-left', value: 'chevron-left'},
        {label: 'chevron-right-circle', value: 'chevron-right-circle'},
        {label: 'chevron-right-double', value: 'chevron-right-double'},
        {label: 'chevron-right-rectangle', value: 'chevron-right-rectangle'},
        {label: 'chevron-right', value: 'chevron-right'},
        {label: 'chevron-up-circle', value: 'chevron-up-circle'},
        {label: 'chevron-up-rectangle', value: 'chevron-up-rectangle'},
        {label: 'chevron-up', value: 'chevron-up'},
        {label: 'circle', value: 'circle'},
        {label: 'clear', value: 'clear'},
        {label: 'close-circle-filled', value: 'close-circle-filled'},
        {label: 'close-circle', value: 'close-circle'},
        {label: 'close-rectangle', value: 'close-rectangle'},
        {label: 'close', value: 'close'},
        {label: 'cloud-download', value: 'cloud-download'},
        {label: 'cloud-upload', value: 'cloud-upload'},
        {label: 'cloud', value: 'cloud'},
        {label: 'control-platform', value: 'control-platform'},
        {label: 'creditcard', value: 'creditcard'},
        {label: 'dashboard', value: 'dashboard'},
        {label: 'delete', value: 'delete'},
        {label: 'desktop', value: 'desktop'},
        {label: 'discount-filled', value: 'discount-filled'},
        {label: 'discount', value: 'discount'},
        {label: 'download', value: 'download'},
        {label: 'edit-1', value: 'edit-1'},
        {label: 'edit', value: 'edit'},
        {label: 'ellipsis', value: 'ellipsis'},
        {label: 'enter', value: 'enter'},
        {label: 'error-circle-filled', value: 'error-circle-filled'},
        {label: 'error-circle', value: 'error-circle'},
        {label: 'error', value: 'error'},
        {label: 'file-add', value: 'file-add'},
        {label: 'file-copy', value: 'file-copy'},
        {label: 'file-excel', value: 'file-excel'},
        // {label: 'file-icon', value: 'file-icon'},
        {label: 'file-image', value: 'file-image'},
        {label: 'file-paste', value: 'file-paste'},
        {label: 'file-pdf', value: 'file-pdf'},
        {label: 'file-powerpoint', value: 'file-powerpoint'},
        {label: 'file-unknown', value: 'file-unknown'},
        {label: 'file-word', value: 'file-word'},
        {label: 'file', value: 'file'},
        {label: 'filter-clear', value: 'filter-clear'},
        {label: 'filter', value: 'filter'},
        {label: 'flag', value: 'flag'},
        {label: 'folder-add', value: 'folder-add'},
        {label: 'folder-open', value: 'folder-open'},
        {label: 'folder', value: 'folder'},
        {label: 'fork', value: 'fork'},
        {label: 'format-horizontal-align-bottom', value: 'format-horizontal-align-bottom'},
        {label: 'format-horizontal-align-center', value: 'format-horizontal-align-center'},
        {label: 'format-horizontal-align-top', value: 'format-horizontal-align-top'},
        {label: 'format-vertical-align-center', value: 'format-vertical-align-center'},
        {label: 'format-vertical-align-left', value: 'format-vertical-align-left'},
        {label: 'format-vertical-align-right', value: 'format-vertical-align-right'},
        {label: 'forward', value: 'forward'},
        {label: 'fullscreen-exit', value: 'fullscreen-exit'},
        {label: 'fullscreen', value: 'fullscreen'},
        {label: 'gender-female', value: 'gender-female'},
        {label: 'gender-male', value: 'gender-male'},
        {label: 'gift', value: 'gift'},
        {label: 'heart-filled', value: 'heart-filled'},
        {label: 'heart', value: 'heart'},
        {label: 'help-circle-filled', value: 'help-circle-filled'},
        {label: 'help-circle', value: 'help-circle'},
        {label: 'help', value: 'help'},
        {label: 'history', value: 'history'},
        {label: 'home', value: 'home'},
        {label: 'hourglass', value: 'hourglass'},
        {label: 'image', value: 'image'},
        {label: 'info-circle-filled', value: 'info-circle-filled'},
        {label: 'info-circle', value: 'info-circle'},
        {label: 'internet', value: 'internet'},
        {label: 'jump', value: 'jump'},
        {label: 'laptop', value: 'laptop'},
        {label: 'layers', value: 'layers'},
        {label: 'link-unlink', value: 'link-unlink'},
        {label: 'link', value: 'link'},
        {label: 'loading', value: 'loading'},
        {label: 'lock-off', value: 'lock-off'},
        {label: 'lock-on', value: 'lock-on'},
        {label: 'login', value: 'login'},
        {label: 'logo-android', value: 'logo-android'},
        {label: 'logo-apple-filled', value: 'logo-apple-filled'},
        {label: 'logo-apple', value: 'logo-apple'},
        {label: 'logo-chrome-filled', value: 'logo-chrome-filled'},
        {label: 'logo-chrome', value: 'logo-chrome'},
        {label: 'logo-codepen', value: 'logo-codepen'},
        {label: 'logo-github-filled', value: 'logo-github-filled'},
        {label: 'logo-github', value: 'logo-github'},
        {label: 'logo-ie-filled', value: 'logo-ie-filled'},
        {label: 'logo-ie', value: 'logo-ie'},
        {label: 'logo-windows-filled', value: 'logo-windows-filled'},
        {label: 'logo-windows', value: 'logo-windows'},
        {label: 'logout', value: 'logout'},
        {label: 'mail', value: 'mail'},
        {label: 'menu-fold', value: 'menu-fold'},
        {label: 'menu-unfold', value: 'menu-unfold'},
        {label: 'minus-circle-filled', value: 'minus-circle-filled'},
        {label: 'minus-circle', value: 'minus-circle'},
        {label: 'minus-rectangle', value: 'minus-rectangle'},
        {label: 'mobile-vibrate', value: 'mobile-vibrate'},
        {label: 'mobile', value: 'mobile'},
        {label: 'money-circle', value: 'money-circle'},
        {label: 'more', value: 'more'},
        {label: 'move', value: 'move'},
        {label: 'next', value: 'next'},
        {label: 'notification-filled', value: 'notification-filled'},
        {label: 'notification', value: 'notification'},
        {label: 'order-adjustment-column', value: 'order-adjustment-column'},
        {label: 'order-ascending', value: 'order-ascending'},
        {label: 'order-descending', value: 'order-descending'},
        {label: 'page-first', value: 'page-first'},
        {label: 'page-last', value: 'page-last'},
        {label: 'pause-circle-filled', value: 'pause-circle-filled'},
        {label: 'photo', value: 'photo'},
        {label: 'pin', value: 'pin'},
        {label: 'play-circle-filled', value: 'play-circle-filled'},
        {label: 'play-circle-stroke', value: 'play-circle-stroke'},
        {label: 'play-circle', value: 'play-circle'},
        {label: 'play', value: 'play'},
        {label: 'poweroff', value: 'poweroff'},
        {label: 'precise-monitor', value: 'precise-monitor'},
        {label: 'previous', value: 'previous'},
        {label: 'print', value: 'print'},
        {label: 'qrcode', value: 'qrcode'},
        {label: 'queue', value: 'queue'},
        {label: 'rectangle', value: 'rectangle'},
        {label: 'refresh', value: 'refresh'},
        {label: 'remove', value: 'remove'},
        {label: 'rollback', value: 'rollback'},
        {label: 'root-list', value: 'root-list'},
        {label: 'round', value: 'round'},
        {label: 'save', value: 'save'},
        {label: 'scan', value: 'scan'},
        {label: 'search', value: 'search'},
        {label: 'secured', value: 'secured'},
        {label: 'server', value: 'server'},
        {label: 'service', value: 'service'},
        {label: 'setting', value: 'setting'},
        {label: 'share', value: 'share'},
        {label: 'shop', value: 'shop'},
        {label: 'slash', value: 'slash'},
        {label: 'sound', value: 'sound'},
        {label: 'star-filled', value: 'star-filled'},
        {label: 'star', value: 'star'},
        {label: 'stop-circle-1', value: 'stop-circle-1'},
        {label: 'stop-circle-filled', value: 'stop-circle-filled'},
        {label: 'stop-circle', value: 'stop-circle'},
        {label: 'stop', value: 'stop'},
        {label: 'swap-left', value: 'swap-left'},
        {label: 'swap-right', value: 'swap-right'},
        {label: 'swap', value: 'swap'},
        {label: 'thumb-down', value: 'thumb-down'},
        {label: 'thumb-up', value: 'thumb-up'},
        {label: 'time-filled', value: 'time-filled'},
        {label: 'time', value: 'time'},
        {label: 'tips', value: 'tips'},
        {label: 'tools', value: 'tools'},
        {label: 'unfold-less', value: 'unfold-less'},
        {label: 'unfold-more', value: 'unfold-more'},
        {label: 'upload', value: 'upload'},
        {label: 'usb', value: 'usb'},
        {label: 'user-add', value: 'user-add'},
        {label: 'user-avatar', value: 'user-avatar'},
        {label: 'user-circle', value: 'user-circle'},
        {label: 'user-clear', value: 'user-clear'},
        {label: 'user-talk', value: 'user-talk'},
        {label: 'user', value: 'user'},
        {label: 'usergroup-add', value: 'usergroup-add'},
        {label: 'usergroup-clear', value: 'usergroup-clear'},
        {label: 'usergroup', value: 'usergroup'},
        {label: 'video', value: 'video'},
        {label: 'view-column', value: 'view-column'},
        {label: 'view-list', value: 'view-list'},
        {label: 'view-module', value: 'view-module'},
        {label: 'wallet', value: 'wallet'},
        {label: 'wifi', value: 'wifi'},
        {label: 'zoom-in', value: 'zoom-in'},
        {label: 'zoom-out', value: 'zoom-out'}
      ],
    };
  },
  watch: {
    // 切换模式，重置数据，避免互相影响
    checkStrictly() {
      this.selectedRowKeys = [];
      this.data = cloneDeep(data);
    },
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.dataLoading = true;
    this.getMenuListTree()
  },

  methods: {
    // 打开新增菜单抽屉
    openDrawer() {
      console.log("打开抽屉")
      this.visibleDrawer = true
      this.getParentMenuListOptions();
    },

    // 获取树形结构菜单列表
    getMenuListTree() {
      this.$request
        .post('/api/menu/list/tree')
        .then((res) => {
          if (res.code === 20000) {
            this.menuData = res.data
          }
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },

    // 获取上级菜单选项
    getParentMenuListOptions() {
      this.$request
        .post('/api/menu/list/option/tree')
        .then((res) => {
          if (res.code === 20000) {
            this.parentMenuOptions = res.data
          }
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },

    rehandleSelectChange(value, {selectedRowData}) {
      this.selectedRowKeys = value;
      console.log(value, selectedRowData);
    },

    handleClickEdit(slotProps) {
      console.log("编辑菜单", slotProps)
    },

    handleClickDelete(slotProps) {
      this.deleteMenuId = slotProps.row.menuId
      this.deleteDialog = true
    },

    // 确认删除
    onConfirmDelete() {
      let menuId = this.deleteMenuId;
      this.deleteDialog = false
      this.$request
        .post('/api/menu/delete', {
          menuId
        })
        .then((res) => {
          if (res.code === 20000) {
            this.$message.success(res.message);
            this.getMenuListTree()
          }
        })
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },

    onCloseDeleteDialog() {
      console.log("取消删除")
    },

    // 提交表单
    onSubmit({validateResult, firstError}) {
      if (validateResult === true) {
        this.$request
          .post('/api/menu/add', this.formData)
          .then((res) => {
            if (res.code === 20000) {
              this.$message.success(res.message);
              this.visibleDrawer = false
              this.getMenuListTree()
            }
          })
          .catch((e: Error) => {
            console.log(e);
          })
          .finally(() => {
            this.dataLoading = false;
          });
      } else {
        this.$message.warning(firstError);
      }
    }
  },
});
</script>

<style lang="less">
@import '@/style/variables';

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}

.left-operation-container {
  padding: 0 0 6px 0;
  margin-bottom: 16px;

  .selected-count {
    display: inline-block;
    margin-left: 8px;
    color: @text-color-secondary;
  }
}

.search-input {
  width: 360px;
}

.tdesign-demo-select__overlay-option {
  width: 470px !important;
}

.t-select-option + .t-select-option {
  margin-top: 0 !important;
}

.tdesign-demo-select__overlay-option .t-select-option {
  height: 40px;
  width: 40px;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  //float: left;

  &:nth-child(9n) {
    margin-right: 0;
  }
}

.tdesign-demo-select__overlay-option .t-select__groups {
  display: flex !important;
  flex-wrap: wrap !important;
}

.status {
  position: relative;
  color: #00a870;
  margin-left: 10px;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    content: '';
    background-color: #00a870;
    width: 6px;
    height: 6px;
    margin-left: -10px;
    border-radius: 50%;
  }
}

.status.unhealth {
  color: #e34d59;

  &::before {
    background-color: #e34d59;
  }
}

.status.warning {
  color: #ed7b2f;

  &::before {
    background-color: #ed7b2f;
  }
}
</style>
