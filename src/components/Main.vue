<template>
  <div id="app">
    <v-app>
      <v-app-bar color="primary" app clipped-left class="elevation-1">
        <v-toolbar-title style="color:white;" >My Files</v-toolbar-title>
        <v-spacer></v-spacer>  
    <v-row style="max-width:100px;" >
      <v-menu
        bottom
        min-width="50px"
        rounded
        offset-y
      >
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            x-large
            v-on="on"
            class="text-right"
            style="float:right"
          >
            <v-avatar
              color="indigo"
              size="48"
            >
              <span class="white--text text-h5">{{ user.shortName }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card style="width:250px;">
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <v-avatar
                color="indigo"
              >
                <span class="white--text text-h5">{{ user.shortName }}</span>
              </v-avatar>
              <h3>{{ user.fullName }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn
                depressed
                rounded
                text
              >
                Edit Account
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn
                depressed
                rounded
                text
                @click="logout"
              >
                Log Out
              </v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </v-row>
      </v-app-bar>
      <v-bottom-navigation v-model="value" class="elevation-1">
        <v-btn value="home">
          <span>Home</span>
          <v-icon>{{icons.mdiHome }}</v-icon>
        </v-btn>

        <v-btn value="newFolder" @click="dialogCreateFolder=true">
          <span>Crear Carpeta</span>
          <v-icon>{{icons.mdiFolderPlus }}</v-icon>
        </v-btn>

        <v-btn value="uploadFile" @click="openDialogUploadFile">
          <span>Upload File</span>

          <v-icon>{{icons.mdiFileUpload }}</v-icon>
        </v-btn>

        <v-btn value="refresh" @click="refreshCurrentDirectory">
          <span>Refresh</span>

          <v-icon>{{icons.mdiRefresh  }}</v-icon>
        </v-btn>
      </v-bottom-navigation>

      <v-main class="p-0">

        <!-- Provides the application the proper gutter -->
        <v-container fluid>
            <!-- <router-view ></router-view> -->
            <div class="text-left" style="margin-bottom:15px;">
              <span  
                v-for="(item, index) in itemsBreadcrum" :key="index"
              >
                <v-btn
                  text
                  color="deep-purple accent-4"
                  @click="redirectParent(index, item)"
                >
                  {{item.text}}
                </v-btn>
                <span v-if="index != (itemsBreadcrum.length -1 )">/</span>
              </span>
            </div>

            <v-card>
              <v-list
                subheader
                v-if="files.length > 0"
              >
                <v-list-item
                  v-for="file in files"
                  :key="file.title"
                  link
                  @click="abrirItem(file)"
                >
                  <v-list-item-avatar>
                    <v-icon size="25">
                      {{ file.icon }}
                    </v-icon>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title class="text-left" v-text="file.name"></v-list-item-title>

                    <v-list-item-subtitle class="text-left" v-text="file.created"></v-list-item-subtitle>
                  </v-list-item-content>

                  <v-list-item-action>
                    
                    <div>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn icon 
                            v-bind="attrs"
                            v-on="on">
                            <v-icon>{{ icons.mdiDotsHorizontal  }}</v-icon>
                          </v-btn>
                        </template>
                        <v-list v-if="file.type == 'FILE'">
                          <v-list-item link @click.prevent="downloadFile(file)">
                            <v-list-item-title class="text-left">
                              <v-icon>
                                {{icons.mdiDownload}}
                              </v-icon>
                              Descargar
                            </v-list-item-title>
                          </v-list-item>

                           <v-list-item link @click="openDialogRenameDirectory(file)">
                            <v-list-item-title class="text-left">
                              <v-icon>
                                {{icons.mdiPencil }}
                              </v-icon>
                              Renombrar
                            </v-list-item-title>
                          </v-list-item>

                          <v-list-item link @click="deleteDirectory(file)">
                            <v-list-item-title class="text-left">
                              <v-icon>
                                {{icons.mdiDelete}}
                              </v-icon>
                              Eliminar
                            </v-list-item-title>
                          </v-list-item>
                          
                        </v-list>

                         <v-list v-else>
                            <v-list-item link @click="openDialogRenameDirectory(file)">
                            <v-list-item-title class="text-left">
                              <v-icon>
                                {{icons.mdiPencil }}
                              </v-icon>
                              Renombrar
                            </v-list-item-title>
                          </v-list-item>

                           <v-list-item link @click="deleteDirectory(file)">
                            <v-list-item-title class="text-left">
                              <v-icon>
                                {{icons.mdiDelete}}
                              </v-icon>
                              Eliminar
                            </v-list-item-title>
                          </v-list-item> 
                        </v-list>

                      </v-menu>
                    </div>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>

        </v-container>
      </v-main>


        <v-dialog
          v-model="dialogUploadFile"
          max-width="500px"
        >
          <v-card>
            <v-card-title>
              Subir Archivos
            </v-card-title>
            <v-card-text>
                <file-pond
                  name="test"
                  :instantUpload="true"
                  :allowRevert="false"
                  :checkValidity="true"
                  :beforeAddFile="validateNewFile"
                  ref="pond"
                  label-idle="Drop files here or <span class='filepond--label-action'>Browse</span>"
                  v-bind:allow-multiple="true"
                  v-bind:files="myFiles"
                  v-bind:server="myServer"
                  v-on:initfile="handleFilePondInitFile"
                />

            </v-card-text>
            <v-card-actions>
              <v-btn
                depressed
                @click="dialogUploadFile = false"
                :disabled="waitingResponseUploadingFiles"
              >
                Cerrar
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-dialog>



      <v-dialog
          v-model="dialogRenameDirectory"
          max-width="500px"
        >
          <v-card>
            <v-card-title>
              Renombrar
            </v-card-title>
            <v-card-text>
              <v-text-field
                label="Nombre*"
                required
                v-model="newDirectoryName"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
            
              <v-btn
                :loading="waitingResponseRenameDir"
                :disabled="waitingResponseRenameDir"
                color="primary"
                depressed
                @click="renameDirectory"
              >
                Guardar
                <template v-slot:loader>
                <span>Guardando</span>
                </template>
              </v-btn>

              <v-btn
                depressed
                @click="dialogRenameDirectory = false"
                :disabled="waitingResponseRenameDir"
              >
                Cancelar
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-dialog>


      <v-dialog
          v-model="dialogCreateFolder"
          max-width="500px"
        >
          <v-card>
            <v-card-title>
              Crear Carpeta
            </v-card-title>
            <v-card-text>
              <v-text-field
                label="Nombre*"
                required
                v-model="newFolderName"
              ></v-text-field>

              <v-alert
                dense
                outlined
                v-if="errorNewFolder"
                class="text-left"
                style="margin:0px;"
                type="error"
              >
                {{textErrorNewFolder}}
              </v-alert>

            </v-card-text>
            <v-card-actions>
            
              <v-btn
                :loading="waitingResponseNewFolder"
                :disabled="waitingResponseNewFolder"
                color="primary"
                depressed
                @click="createFolder"
              >
                Guardar
                <template v-slot:loader>
                <span>Guardando</span>
                </template>
              </v-btn>

              <v-btn
                depressed
                @click="dialogCreateFolder = false"
                :disabled="waitingResponseNewFolder"
              >
                Cancelar
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-dialog>

      <v-snackbar
        right
        v-model="snackbar"
        color="primary"
      >
        {{ textSnackbar }}

        <template v-slot:action="{ attrs }">
          <v-btn
            color="white"
            text
            v-bind="attrs"
            @click="snackbar = false"
          >
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>


    </v-app>
  </div>
</template>

<script>

import {
    mdiHome, mdiFolderPlus, mdiFileUpload, mdiFolder, mdiClipboardText,mdiRefresh ,
    mdiDownload, mdiFileDocument,mdiDotsHorizontal, mdiCached, mdiDelete,mdiFileOutline,mdiPencil   

} from '@mdi/js'
import axios from 'axios'

import vueFilePond from "vue-filepond";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";

import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileMetadata from "filepond-plugin-file-metadata";

const FilePond = vueFilePond(
  FilePondPluginFileMetadata,
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview
);

export default {
  name: 'Min',
  data: function(){
    var $this = this;
    return {
      currentParentId:"",
      myFiles: [],
      myServer: {
        instantUpload:false,
        process: function(field, file, metadata, load) {
          load(Date.now());
          let formData = new FormData();
          formData.append('file', file, file.name);
          formData.append('parentId',$this.currentParentId);
          formData.append('level',0); 
          formData.append('icon','mdi-file'); 
          formData.append('type','FILE'); 

          axios.post("directory/upload", formData, {headers: {'Content-Type': 'multipart/form-data'}
          }).then(function(){
              $this.refreshCurrentDirectory();
          }).catch(function(err){
            console.log(err);
            $this.snackbar = true;
            $this.textSnackbar = err.response.data.message;
          })
          
        }
      },
      waitingResponseUploadingFiles:false,
      waitingResponseRenameDir:false,
      dialogUploadFile: false,
      dialogRenameDirectory:false,
      snackbar: false,
      textSnackbar: "",
      newFolderName:"",
      newDirectoryName :"",
      errorNewFolder:false,
      textErrorNewFolder:"",
      waitingResponseNewFolder:false,
      dialogCreateFolder:false,
      value:true,
      icons: {
        mdiHome,
        mdiFolderPlus,
        mdiFileUpload,
        mdiFolder,
        mdiClipboardText,
        mdiDownload,
        mdiFileDocument,mdiRefresh ,mdiPencil ,
        mdiDotsHorizontal,mdiCached , mdiDelete , mdiFileOutline  
      },
      files: [],
      itemsBreadcrum: [
        {
          text: 'Home',
          disabled: false,
          href: '/',
          id:""
        }
      ],
      selectedDirectory:{},
      user: {
        shortName: '',
        fullName: 'Adolfo Cunquero',
        email: 'adolfocunquero@gmail.com',
      },
    }
  },
  methods: {
    openDialogRenameDirectory: function(file){
      this.selectedDirectory = file;
      this.dialogRenameDirectory = true;
      this.newDirectoryName = file.name;
    },
    renameDirectory: function(){
      let $this = this;
      if (this.newDirectoryName == ""){
        this.snackbar = true;
        this.textSnackbar = "Debe escribir un nombre";
        this.newDirectoryName = "";
        return
      }

      if(this.newDirectoryName == this.selectedDirectory.name){
        this.dialogRenameDirectory = false;
        return;
      }

      axios.put("directory/rename/"+this.selectedDirectory.id, {"name":this.newDirectoryName}).then(function(){
        $this.refreshCurrentDirectory();
        $this.dialogRenameDirectory = false;
        $this.snackbar = true;
        $this.textSnackbar = "Directorio renombrado correctamente";
        $this.newDirectoryName = "";
      }).catch(function(err){
        console.log(err);
        $this.snackbar = true;
        $this.textSnackbar = err.response.data.message;
      })
    },
    deleteDirectory: function(file){
      let $this = this;
      axios.delete("directory/delete/"+file.id).then(function(){
        $this.refreshCurrentDirectory();
        $this.snackbar = true;
        $this.textSnackbar = "Item eliminado correctamente";
      }).catch(function(err){
        console.log(err);
        $this.snackbar = true;
        $this.textSnackbar = err.response.data.message;
      })
    },
    downloadFile: function(file){
      axios.get("directory/download/"+file.id, { responseType: 'blob' }).then(response => {
        const blob = new Blob([response.data])
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = file.name
        link.click()
        URL.revokeObjectURL(link.href)
      }).catch(console.error)
    },
    openDialogUploadFile: function(){
      this.myFiles = [];
      this.dialogUploadFile = true;
    },
    addDir:function(item){
      item = this.getFullFile(item)
      this.files.push(item);
    },
    handleFilePondInitFile: function () {
      console.log("FilePond has initialized");

      // FilePond instance methods are available on `this.$refs.pond`
    },
    validateNewFile: function(item){
      let $this = this;
      return new Promise((resolve, reject) =>{
        console.log("directory/exists?parentId="+$this.currentParentId+"&name="+item.filename)
        axios.get("directory/exists?parentId="+$this.currentParentId+"&name="+item.filename).then(function(response){
          console.log(response);
          let data = response.data;
          //$this.snackbar = true;
          //$this.textSnackbar = item.filename + " - "+data.message;
          resolve(data.status);
        }).catch(function(err){
          console.log(err)
          reject(err);
        })
      });
    },
    redirectParent: function(index, item){
      this.currentParentId = item.id;
      this.itemsBreadcrum = this.itemsBreadcrum.slice(0, index+1)
      let $this = this;

      axios.get("directory/list?parentId="+item.id).then(function(response){
        let data = response.data;
        for(let i =0; i < data.length; i++){
          data[i] = $this.getFullFile(data[i]);
        }
        $this.files = data;
      })
    },
    getIcon: function(iconName){
      if (iconName == "FOLDER"){
        return this.icons.mdiFolder;
      }
      return this.icons.mdiFileOutline ;
    },
    createFolder: function(){

      if (this.newFolderName == ""){
        this.snackbar = true;
        this.textSnackbar = "Debe de escribir un nombre";
        return;
      }

      let $this = this;
      this.waitingResponseNewFolder = true;
      axios.post("directory/createFolder", {
        "name":this.newFolderName,
        "level":0,
        "icon":"mdi-folder",
        "type":"FOLDER",
        "parentId":$this.currentParentId
      }).then(function(){
        $this.refreshCurrentDirectory();
        $this.waitingResponseNewFolder = false;
        $this.dialogCreateFolder = false; 
        $this.newFolderName = "";
        
        $this.snackbar = true;
        $this.textSnackbar = "Carpeta creada correctamente";
      }).catch(function(err){
        console.log(err);
        $this.waitingResponseNewFolder = false;
        $this.snackbar = true;
        $this.textSnackbar = err.response.data.message;
      })
    },
    getFullFile: function(file){
      file.icon = this.getIcon(file.type)
      return file;
    },
    refreshCurrentDirectory(){
      this.abrirItem({id:this.currentParentId, type:"FOLDER"}, true);
    },
    abrirItem: function(item, refresh){
      let $this = this;
      if (item.type == "FOLDER"){
        this.currentParentId = item.id;

        if(!refresh){
          this.itemsBreadcrum.push({
            text: item.name,
            disabled: false,
            href: '/',
            id:item.id,
          })
        }

        axios.get("directory/list?parentId="+item.id).then(function(response){
          let data = response.data;
          for(let i =0; i < data.length; i++){
            data[i] = $this.getFullFile(data[i]);
          }
          $this.files = data;
        })
      }
    },
    logout:function(){
      this.$session.destroy();
      this.$router.push("/login");
    }
  },
  created: function() {
    let $this = this;

    if (!this.$session.exists()) {
      this.$router.push('/login');
      return;
    }

    this.user = this.$session.get("user");
    axios.get("directory/list").then(function(response){
      let data = response.data;
      for(let i =0; i < data.length; i++){
        data[i] = $this.getFullFile(data[i]);
      }
      $this.files = data;
    })
  },
  components: {
    FilePond
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.p-0{
  padding-top:0px !important;
}
</style>
