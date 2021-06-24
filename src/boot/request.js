import Vue from 'vue'
import axios from 'axios'
import request from 'src/request'

Vue.prototype.$axios = axios
Vue.prototype.ajax = request
