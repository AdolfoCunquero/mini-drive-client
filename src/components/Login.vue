<template>
  <div id="app" class="p-0" >
     <v-app  class="p-0">
         <main>
            <v-row>
                <v-col cols="12" md="8" style="padding:0px; margin:0;">
                    <img src="@/assets/image.jpg" width="100%"/>
                </v-col>
                <v-col cols="12" md="4" style="margin:0; padding:0;">
                    <v-card color="transparent">
                        <v-tabs
                        v-model="tab"
                        color="black"
                        background-color="transparent"
                        class="pt-5"
                        >
                            <v-tab
                                v-for="item in items"
                                :key="item.tab"

                            >
                                {{ item.tab }}
                            </v-tab>
                        </v-tabs>

                        <v-tabs-items v-model="tab" >
                            <v-tab-item
                                :key="'Login'"
                                style="height:600px;padding:15px;"
                            >
                            <div
                                class="transition-swing text-h4 mb-1 mt-15"
                                text="Login"
                            >Login
                            </div>
                            
                                <div style="padding:50px 50px 50px 50px;margin:0px;" >
                                    <v-card-text> 
                                        <v-form
                                        ref="formLogin"
                                        v-model="loginValid"
                                        >
                                            <v-text-field
                                                name="login"
                                                label="User"
                                                type="text"
                                                solo
                                                :rules="rules.emailRules"
                                                :prepend-inner-icon="icons.mdiAccount"
                                                v-model="loginData.email"
                                            ></v-text-field>
                                            <v-text-field
                                                id="password"
                                                name="password"
                                                label="Password"
                                                type="password"
                                                :rules="rules.textRules"
                                                :prepend-inner-icon="icons.mdiLock"
                                                solo
                                                v-model="loginData.password"
                                                @keyup.enter="validateLogin"
                                            ></v-text-field>     
                                        </v-form>

                                        <div class="text-center">
                                            <v-btn
                                                rounded
                                                color="primary"
                                                elevation="10"
                                                dark
                                                @click.prevent="validateLogin"
                                                >
                                                LOGIN
                                                </v-btn>
                                            </div>
                                         <v-spacer></v-spacer>
                                    </v-card-text>
                                </div>

                            </v-tab-item>

                            <v-tab-item
                                :key="'Register'"
                                style="height:600px;padding:15px;"
                            >
                            <div
                                class="transition-swing text-h4 mb-1 mt-5"
                                text="Registrarse"
                            >Registrarse
                            </div>
                                <div>
                                    <v-card-text>
                                        <v-form
                                            ref="formRegistration"
                                            v-model="registrationValid"
                                        >
                                            <v-text-field
                                            v-model="registrationData.firstName"
                                            :rules="rules.textRules"
                                            label="Nombre"
                                            required
                                            solo
                                            ></v-text-field>

                                             <v-text-field
                                            v-model="registrationData.lastName"
                                            :rules="rules.textRules"
                                            label="Apellido"
                                            required
                                            solo
                                            ></v-text-field>

                                            <v-text-field
                                            v-model="registrationData.email"
                                            :rules="rules.emailRules"
                                            label="E-mail"
                                            required
                                            solo
                                            ></v-text-field>

                                            <v-text-field
                                                name="password"
                                                label="Password"
                                                type="password"
                                                v-model="registrationData.password"
                                                :prepend-inner-icon="icons.mdiLock"
                                                solo
                                                :rules="rules.textRules"
                                            ></v-text-field> 

                                            <v-text-field
                                                name="confirmPassword"
                                                label="Confirm Password"
                                                type="password"
                                                v-model="registrationData.confirmPassword"
                                                :prepend-inner-icon="icons.mdiLock"
                                                solo
                                                :rules="rules.textRules"
                                            ></v-text-field> 

                                            <div class="text-center">
                                            <v-btn
                                                rounded
                                                color="primary"
                                                elevation="10"
                                                dark
                                                @click.prevent="validateRegister"
                                                >
                                                REGISTRARME
                                                </v-btn>
                                            </div>
                                            <v-spacer></v-spacer>

                                        </v-form>
                                    </v-card-text>
                                </div>
                            </v-tab-item>

                        </v-tabs-items>
                    </v-card>
                </v-col>
            </v-row>
         </main>
     </v-app>
  </div>
</template>
<script>

import {
    mdiAccount,mdiLock   

} from '@mdi/js';

import axios from 'axios';

export default {
    name:"Login",
    data () {
      return {
        icons:{
            mdiAccount,mdiLock 
        },
        registrationValid:true,
        loginValid:true,
        loginData:{
            email:'',
            password:'',
        },
        registrationData:{
            firstName:'',
            lastName:'',
            email:'',
            password:'',
            confirmPassword:''
        },
        rules:{
            emailRules: [
                v => !!v || 'El campo es requerido',
                v => /.+@.+\..+/.test(v) || 'El email no es valido',
            ],
            textRules: [
                v => !!v || 'El campo es requerido',
            ],
        },
        tab: null,
        items: [
          { tab: 'Login', content: '' },
          { tab: 'Registrarse', content: '' },
        ],
      }
    },
    methods:{
        validateLogin:function(){
            if(this.$refs.formLogin.validate()){
                let $this = this;
                axios.post("auth/login", this.loginData).then(function(response){
                    let data = response.data;
                    axios.defaults.headers = {
                        "Authorization":"Bearer"+data.token
                    }

                    $this.$session.start();
                    $this.$session.set('token', data.token);
                    $this.$session.set('user', data.userInfo);

                    $this.$router.push('/workspace');
                }).catch(function(err){
                    $this.$swal("Error", err.response.data.message);
                    console.log(err);
                });
            }
        },
        validateRegister: function(){
            if(this.$refs.formRegistration.validate()){
                let $this = this;
                if (this.registrationData.password != this.registrationData.confirmPassword){
                    $this.$swal("Error", "Las contrasenias deben coincidir");
                    return;
                }
                axios.post("auth/register",this.registrationData).then(function(response){
                    console.log(response);
                    $this.$refs.formRegistration.reset();
                    $this.$swal("Correcto", "Usuario registrado correctamente");
                }).catch(function(err){
                    $this.$swal("Error", err.response.data.message);
                    console.log(err);
                })
            }
        }
    },
    watch: {
      $route: {
          immediate: true,
          handler() {
              document.title = 'Login';
          }
      },
  },
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.p-0{
    padding: 0px !important; 
    margin: 0px !important;
}

.bg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: url( '../assets/image.jpg') no-repeat center center;
    background-size: cover;
  }
</style>
