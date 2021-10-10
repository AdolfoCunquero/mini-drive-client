<template>
  <div id="app">
    <v-app>
      <v-app-bar color="primary" app clipped-left class="elevation-1">
        <v-toolbar-title style="color:white;" >My Files</v-toolbar-title>
        <v-spacer></v-spacer>
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
                        <v-list>
                          <v-list-item
                            v-for="(item, index) in fileItems"
                            :key="index"
                            link
                          >
                            <v-list-item-title class="text-left">
                              <v-icon>
                                {{icons.mdiDownloadCircle}}
                              </v-icon>
                              {{ item.title }}
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
    mdiHome, mdiFolderPlus, mdiFileUpload, mdiFolder, mdiClipboardText,
    mdiDownloadCircle, mdiFileDocument,mdiDotsHorizontal, mdiCached 

} from '@mdi/js'
import axios from 'axios'

import vueFilePond from "vue-filepond";

//import './file-pond.js'
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
  name: 'App',
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
          }).then(function(response){
              $this.addDir(response.data)
          }).catch(function(err){
            $this.snackbar = true;
            $this.textSnackbar = err.response.data.message;
            
            // var myIndex = myArray.indexOf('two');
            // if (myIndex !== -1) {
            //     myArray.splice(myIndex, 1);
            // }

          })
          
        }
      },
      waitingResponseUploadingFiles:false,
      dialogUploadFile: false,
      snackbar: false,
      textSnackbar: "",
      newFolderName:"",
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
        mdiDownloadCircle,
        mdiFileDocument,
        mdiDotsHorizontal,mdiCached   
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
      fileItems: [
        { title: 'Descargar' },
        { title: 'Eliminar'  }
      ],
    }
  },
  methods: {
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
          $this.snackbar = true;
          $this.textSnackbar = item.filename + " - "+data.message;
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
      return this.icons.mdiFileDocument;
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
      }).then(function(response){
        $this.files.push($this.getFullFile(response.data))
        $this.waitingResponseNewFolder = false;
        $this.dialogCreateFolder = false; 
        $this.newFolderName = "";
        $this.snackbar = true;
        $this.textSnackbar = "Carpeta creada correctamente";
      }).catch(function(err){
        $this.waitingResponseNewFolder = false;
        $this.snackbar = true;
        $this.textSnackbar = err.response.data.message;
      })
    },
    getFullFile: function(file){
      file.icon = this.getIcon(file.type)
      return file;
    },
    abrirItem: function(item){
      
      let $this = this;
    
      if (item.type == "FOLDER"){
        this.currentParentId = item.id;

        this.itemsBreadcrum.push({
          text: item.name,
          disabled: false,
          href: '/',
          id:item.id,
        })

        axios.get("directory/list?parentId="+item.id).then(function(response){
          let data = response.data;
          for(let i =0; i < data.length; i++){
            data[i] = $this.getFullFile(data[i]);
          }
          $this.files = data;
        })
      }
    }
  },
  created: function() {
    let $this = this;
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
